// =======================
// Imports – Models & Utils
// =======================
const Conversation = require("../models/conversationModel");
const Message = require("../models/messageModel");
const catchAsync = require("../utils/catchAsync");

// =======================
// Imports – Socket & Presence
// =======================
const { getIO, isUserInChatRoom } = require("../socket/socket");
const { getPresence } = require("../redis/presence");

/* ======================================================
   GET MY CONVERSATIONS
   - Cursor based pagination
   - Presence aware (online / last seen)
====================================================== */
exports.getMyConversations = async (req, res) => {
  try {
    // =======================
    // Extract Params
    // =======================
    const userId = req.userId;
    const { limit = 10, cursor } = req.query;

    // =======================
    // Build Query
    // =======================
    const query = { participants: userId };
    if (cursor) query.updatedAt = { $lt: new Date(cursor) };

    // =======================
    // Fetch Conversations
    // =======================
    const conversations = await Conversation.find(query)
      .sort({ updatedAt: -1 })
      .limit(Number(limit))
      .populate(
        "participants",
        "fullName username profileImageUrl isOnline lastSeen"
      )
      .populate({
        path: "lastMessage",
        select: "content senderId timestamp",
      });

    // =======================
    // Format Conversations
    // =======================
    const formatted = await Promise.all(
      conversations.map(async (conv) => {
        const partner = conv.participants.find(
          (p) => p._id.toString() !== userId
        );

        // Presence from Redis
        const presence = await getPresence(partner._id.toString());

        return {
          conversationId: conv._id,
          type: conv.type,
          partner: {
            ...partner.toObject(),
            isOnline:
              presence.status === "online" || presence.status === "in_chat",
            lastSeen: presence.lastSeen || partner.lastSeen,
          },
          lastMessage: conv.lastMessage,
          updatedAt: conv.updatedAt,
          unreadCount: conv.unreadCount?.get(userId) || 0,
        };
      })
    );

    // =======================
    // Pagination Cursor
    // =======================
    const nextCursor =
      conversations.length === Number(limit)
        ? conversations[conversations.length - 1].updatedAt
        : null;

    // =======================
    // Response
    // =======================
    res.status(200).json({ conversations: formatted, nextCursor });
  } catch (error) {
    res.status(500).json({ message: "Failed to load conversations" });
  }
};

/* ======================================================
   GET MESSAGES
   - Cursor pagination
   - Access controlled
====================================================== */
exports.getMessages = async (req, res) => {
  // =======================
  // Extract Params
  // =======================
  const { conversationId } = req.params;
  const { cursor, limit = 10 } = req.query;
  const userId = req.userId;

  // =======================
  // Validate Conversation
  // =======================
  const conversation = await Conversation.findById(conversationId);
  if (!conversation)
    return res.status(404).json({ message: "Conversation not found" });

  if (!conversation.participants.some((p) => p.toString() === userId))
    return res.status(403).json({ message: "Access denied" });

  // =======================
  // Build Message Query
  // =======================
  const query = { conversationId };
  if (cursor) query.timestamp = { $lt: new Date(cursor) };

  // =======================
  // Fetch Messages
  // =======================
  const messages = await Message.find(query)
    .sort({ timestamp: -1 })
    .limit(Number(limit) + 1)
    .populate("sender", "fullName profileImageUrl");

  // =======================
  // Pagination Handling
  // =======================
  const hasNextPage = messages.length > limit;
  if (hasNextPage) messages.pop();

  messages.reverse();

  // =======================
  // Response
  // =======================
  res.status(200).json({
    isSuccess: true,
    messages,
    nextCursor: hasNextPage ? messages[0]?.timestamp : null,
  });
};

/* ======================================================
   SEND MESSAGE (RACE SAFE)
   - Presence aware delivery status
   - Optimistic clientId support
====================================================== */
exports.sendMessage = catchAsync(async (req, res) => {
  // =======================
  // Extract Data
  // =======================
  const { userId } = req;
  const { conversationId, content, media = [], clientId } = req.body;

  // =======================
  // Validate Conversation
  // =======================
  const conversation = await Conversation.findById(conversationId);
  if (!conversation)
    return res.status(404).json({ message: "Conversation not found" });

  const receiverId = conversation.participants.find(
    (id) => id.toString() !== userId.toString()
  );

  /* ----------------------
     PRESENCE CHECK
  ---------------------- */
  const presence = await getPresence(receiverId.toString());
  let status = "sent";

  const isReceiverReading = isUserInChatRoom(
    receiverId.toString(),
    conversationId.toString()
  );

  if (isReceiverReading) status = "read";
  else if (presence?.status === "online" || presence?.status === "in_chat")
    status = "delivered";

  /* ----------------------
     SAVE MESSAGE
  ---------------------- */
  const message = await Message.create({
    conversationId,
    sender: userId,
    receiver: receiverId,
    content,
    media,
    status,
  });

  const populatedMessage = await message.populate(
    "sender",
    "fullName profileImageUrl"
  );

  /* ----------------------
     UPDATE CONVERSATION
  ---------------------- */
  const update = {
    lastMessage: message._id,
    updatedAt: message.timestamp,
    $set: { [`unreadCount.${userId}`]: 0 },
  };

  if (!isReceiverReading) {
    update.$inc = { [`unreadCount.${receiverId}`]: 1 };
  }

  await Conversation.findByIdAndUpdate(conversationId, update);

  /* ----------------------
     FETCH ABSOLUTE UNREAD
  ---------------------- */
  const updatedConversation = await Conversation.findById(conversationId);
  const receiverUnread =
    updatedConversation.unreadCount.get(receiverId.toString()) || 0;

  /* ----------------------
     SOCKET EMITS
  ---------------------- */
  const io = getIO();

  // Chat screen (real-time message)
  io.to(conversationId.toString()).emit("receive_message", {
    ...populatedMessage.toObject(),
    clientId,
    status,
  });

  // Receiver chat list
  io.to(receiverId.toString()).emit("conversation_update", {
    conversationId,
    lastMessage: {
      content: populatedMessage.content,
      timestamp: populatedMessage.timestamp,
    },
    updatedAt: populatedMessage.timestamp,
    unreadCount: receiverUnread,
  });

  // Sender chat list
  io.to(userId.toString()).emit("conversation_update", {
    conversationId,
    lastMessage: {
      content: populatedMessage.content,
      timestamp: populatedMessage.timestamp,
    },
    updatedAt: populatedMessage.timestamp,
    unreadCount: 0,
  });

  // =======================
  // Response
  // =======================
  res.status(201).json({
    isSuccess: true,
    sentMessage: populatedMessage,
  });
});
