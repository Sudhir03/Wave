// =======================
// Imports – Models & Utils
// =======================
const Conversation = require("../models/conversationModel");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const uploadToCloudinary = require("../utils/uploadToCloudinary");

// =======================
// Imports – Socket & Presence
// =======================
const { getIO, isUserInChatRoom } = require("../socket/socket");
const { getPresence } = require("../redis/presence");
const getMediaPreview = require("../utils/getMediaPreview");

/* =========================
   BLOCK HELPER (NEW)
========================= */
const isBlockedBetween = async (a, b) => {
  const users = await User.find({ _id: { $in: [a, b] } }).select(
    "blockedUsers"
  );
  if (users.length !== 2) return true;

  return users[0].blockedUsers.includes(b) || users[1].blockedUsers.includes(a);
};

/* =========================
   GET MY CONVERSATIONS
========================= */
exports.getMyConversations = async (req, res) => {
  try {
    const userId = req.userId;
    const { limit = 10, cursor } = req.query;

    const me = await User.findById(userId).select("blockedUsers");

    const query = { participants: userId };
    if (me.blockedUsers?.length) {
      query.participants = {
        $all: [userId],
        $nin: me.blockedUsers,
      };
    }

    if (cursor) query.updatedAt = { $lt: new Date(cursor) };

    const conversations = await Conversation.find(query)
      .sort({ updatedAt: -1 })
      .limit(Number(limit))
      .populate(
        "participants",
        "fullName username profileImageUrl lastSeen blockedUsers"
      )
      .populate({
        path: "lastMessage",
        select: "content senderId timestamp",
      });

    const formatted = await Promise.all(
      conversations.map(async (conv) => {
        const partner = conv.participants.find(
          (p) => p._id.toString() !== userId
        );

        // ⛔ Partner blocked me
        if (partner.blockedUsers?.includes(userId)) return null;

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
          lastMessage: {
            content: conv.lastMessagePreview || "",
            timestamp: conv.lastMessage?.timestamp || conv.updatedAt,
          },
          updatedAt: conv.updatedAt,
          unreadCount: conv.unreadCount?.get(userId) || 0,
        };
      })
    );

    const cleanFormatted = formatted.filter(Boolean);

    const nextCursor =
      conversations.length === Number(limit)
        ? conversations[conversations.length - 1].updatedAt
        : null;

    res.status(200).json({
      conversations: cleanFormatted,
      nextCursor,
    });
  } catch {
    res.status(500).json({ message: "Failed to load conversations" });
  }
};

/* =========================
   GET MESSAGES
========================= */
exports.getMessages = async (req, res) => {
  const { conversationId } = req.params;
  const { cursor, limit = 10 } = req.query;
  const userId = req.userId;

  const conversation = await Conversation.findById(conversationId);
  if (!conversation)
    return res.status(404).json({ message: "Conversation not found" });

  if (!conversation.participants.some((p) => p.toString() === userId))
    return res.status(403).json({ message: "Access denied" });

  const receiverId = conversation.participants.find(
    (p) => p.toString() !== userId
  );

  const blocked = await isBlockedBetween(userId, receiverId);
  if (blocked) {
    return res.status(403).json({
      message: "You cannot access messages in this conversation",
    });
  }

  const query = { conversationId };
  if (cursor) query.timestamp = { $lt: new Date(cursor) };

  const messages = await Message.find(query)
    .sort({ timestamp: -1 })
    .limit(Number(limit) + 1)
    .populate("sender", "fullName profileImageUrl");

  const hasNextPage = messages.length > limit;
  if (hasNextPage) messages.pop();

  messages.reverse();

  res.status(200).json({
    isSuccess: true,
    messages,
    nextCursor: hasNextPage ? messages[0]?.timestamp : null,
  });
};

/* =========================
   SEND TEXT MESSAGE
========================= */
exports.sendTextMessage = catchAsync(async (req, res) => {
  const { userId } = req;
  const { conversationId, content, clientId } = req.body;

  if (!content?.trim())
    return res.status(400).json({ message: "Text content required" });

  const conversation = await Conversation.findById(conversationId);
  if (!conversation)
    return res.status(404).json({ message: "Conversation not found" });

  const receiverId = conversation.participants.find(
    (id) => id.toString() !== userId.toString()
  );

  const blocked = await isBlockedBetween(userId, receiverId);
  if (blocked)
    return res.status(403).json({
      message: "You cannot message this user",
    });

  const presence = await getPresence(receiverId);
  let status = "sent";

  const isReceiverReading = isUserInChatRoom(
    receiverId.toString(),
    conversationId.toString()
  );

  if (isReceiverReading) status = "read";
  else if (presence?.status === "online" || presence?.status === "in_chat")
    status = "delivered";

  const message = await Message.create({
    conversationId,
    sender: userId,
    receiver: receiverId,
    content,
    media: [],
    status,
  });

  const populatedMessage = await message.populate(
    "sender",
    "fullName profileImageUrl"
  );

  const update = {
    lastMessage: message._id,
    lastMessagePreview: content,
    updatedAt: message.timestamp,
    $set: { [`unreadCount.${userId}`]: 0 },
  };

  if (!isReceiverReading) update.$inc = { [`unreadCount.${receiverId}`]: 1 };

  await Conversation.findByIdAndUpdate(conversationId, update);

  const updatedConversation = await Conversation.findById(conversationId);
  const receiverUnread =
    updatedConversation.unreadCount.get(receiverId.toString()) || 0;

  const io = getIO();

  io.to(conversationId.toString()).emit("receive_message", {
    ...populatedMessage.toObject(),
    clientId,
    status,
  });

  io.to(receiverId.toString()).emit("conversation_update", {
    conversationId,
    lastMessage: {
      content: populatedMessage.content,
      timestamp: populatedMessage.timestamp,
    },
    updatedAt: populatedMessage.timestamp,
    unreadCount: receiverUnread,
  });

  io.to(userId.toString()).emit("conversation_update", {
    conversationId,
    lastMessage: {
      content: populatedMessage.content,
      timestamp: populatedMessage.timestamp,
    },
    updatedAt: populatedMessage.timestamp,
    unreadCount: 0,
  });

  res.status(201).json({
    isSuccess: true,
    sentMessage: populatedMessage,
  });
});

/* =========================
   SEND MEDIA MESSAGE
========================= */
exports.sendMediaMessage = catchAsync(async (req, res) => {
  const { userId } = req;
  const { conversationId, clientId } = req.body;

  if (!req.files || req.files.length === 0)
    return res.status(400).json({ message: "Media files required" });

  const conversation = await Conversation.findById(conversationId);
  if (!conversation)
    return res.status(404).json({ message: "Conversation not found" });

  const receiverId = conversation.participants.find(
    (id) => id.toString() !== userId.toString()
  );

  const blocked = await isBlockedBetween(userId, receiverId);
  if (blocked)
    return res.status(403).json({
      message: "You cannot send media to this user",
    });

  const media = await Promise.all(
    req.files.map(async (file) => {
      let type = "document";
      let resourceType = "raw";
      let thumbnail = null;
      let isVoice = false;

      if (file.mimetype.startsWith("image")) {
        type = "image";
        resourceType = "image";
      } else if (file.mimetype.startsWith("video")) {
        type = "video";
        resourceType = "video";
      } else if (file.mimetype.startsWith("audio")) {
        type = "audio";
        resourceType = "video";
        if (file.originalname.startsWith("voice-")) isVoice = true;
      }

      const uploaded = await uploadToCloudinary({
        buffer: file.buffer,
        subFolder: `chat-media/${conversationId}`,
        resourceType,
      });

      if (type === "video") {
        thumbnail = uploaded.secure_url
          .replace("/video/upload/", "/video/upload/so_1,f_jpg,q_auto,w_400/")
          .replace(".mp4", ".jpg");
      }

      if (type === "image") thumbnail = uploaded.secure_url;

      return {
        type,
        isVoice,
        url: uploaded.secure_url,
        thumbnail,
        fileName: file.originalname,
        fileSize: uploaded.bytes,
      };
    })
  );

  const presence = await getPresence(receiverId);
  let status = "sent";

  const isReceiverReading = isUserInChatRoom(
    receiverId.toString(),
    conversationId.toString()
  );

  if (isReceiverReading) status = "read";
  else if (presence?.status === "online" || presence?.status === "in_chat")
    status = "delivered";

  const message = await Message.create({
    conversationId,
    sender: userId,
    receiver: receiverId,
    content: "",
    media,
    status,
  });

  const populatedMessage = await message.populate(
    "sender",
    "fullName profileImageUrl"
  );

  const mediaPreview = getMediaPreview(media);

  await Conversation.findByIdAndUpdate(conversationId, {
    lastMessage: message._id,
    lastMessagePreview: mediaPreview,
    updatedAt: message.timestamp,
    $set: { [`unreadCount.${userId}`]: 0 },
    ...(isReceiverReading
      ? {}
      : { $inc: { [`unreadCount.${receiverId}`]: 1 } }),
  });

  const updatedConversation = await Conversation.findById(conversationId);
  const receiverUnread =
    updatedConversation.unreadCount.get(receiverId.toString()) || 0;

  const io = getIO();

  io.to(conversationId.toString()).emit("receive_message", {
    ...populatedMessage.toObject(),
    clientId,
    status,
  });

  io.to(receiverId.toString()).emit("conversation_update", {
    conversationId,
    lastMessage: {
      content: mediaPreview,
      timestamp: populatedMessage.timestamp,
    },
    updatedAt: populatedMessage.timestamp,
    unreadCount: receiverUnread,
  });

  io.to(userId.toString()).emit("conversation_update", {
    conversationId,
    lastMessage: {
      content: mediaPreview,
      timestamp: populatedMessage.timestamp,
    },
    updatedAt: populatedMessage.timestamp,
    unreadCount: 0,
  });

  res.status(201).json({
    isSuccess: true,
    sentMessage: populatedMessage,
  });
});
