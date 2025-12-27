const Conversation = require("../models/conversationModel");
const Friendship = require("../models/friendshipModel");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");

const { getIO } = require("../socket/socket");
const { getPresence } = require("../redis/presence");

exports.getMyConversations = async (req, res) => {
  try {
    const userId = req.userId; // coming from auth middleware
    const { limit = 10, cursor } = req.query;

    const query = {
      participants: userId,
    };

    // cursor-based pagination
    if (cursor) {
      query.updatedAt = { $lt: new Date(cursor) };
    }

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

    const formatted = conversations.map((conv) => {
      const partner = conv.participants.find(
        (p) => p._id.toString() !== userId
      );

      return {
        conversationId: conv._id,
        type: conv.type,
        partner,
        lastMessage: conv.lastMessage,
        updatedAt: conv.updatedAt,
      };
    });

    const nextCursor =
      conversations.length === Number(limit)
        ? conversations[conversations.length - 1].updatedAt
        : null;

    res.status(200).json({
      conversations: formatted,
      nextCursor,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to load conversations" });
  }
};

exports.getMessages = async (req, res) => {
  const { conversationId } = req.params;
  const { cursor, limit = 10 } = req.query;
  const userId = req.userId;

  // 1️⃣ Validate conversation
  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    return res.status(404).json({
      isSuccess: false,
      message: "Conversation not found",
    });
  }

  // 2️⃣ Access control
  if (!conversation.participants.some((p) => p.toString() === userId)) {
    return res.status(403).json({
      isSuccess: false,
      message: "Access denied",
    });
  }

  // 3️⃣ Build query
  const query = { conversationId };

  if (cursor) {
    query.timestamp = { $lt: new Date(cursor) };
  }

  // 4️⃣ Fetch messages (DESC for pagination)
  const messages = await Message.find(query)
    .sort({ timestamp: -1 })
    .limit(Number(limit) + 1)
    .populate("sender", "fullName profileImageUrl");

  const hasNextPage = messages.length > limit;
  if (hasNextPage) messages.pop();

  // Reverse → old → new (UI friendly)
  messages.reverse();

  return res.status(200).json({
    isSuccess: true,
    messages,
    nextCursor: hasNextPage ? messages[0]?.timestamp : null,
  });
};

// Unified Chat Data Fetch
exports.getUnifiedChatData = catchAsync(async (req, res) => {
  const { friendId, conversationId } = req.params;
  const { userId } = req;

  let conversationDoc = null;
  let chatPartnerDoc = null;
  let messages = [];

  if (friendId) {
    // SCENARIO 1: Fetching by Friend ID (New or Existing Chat)

    // 1. Find the Friendship
    const friendship = await Friendship.findOne({
      status: "accepted",
      $or: [
        { user1: userId, user2: friendId },
        { user1: friendId, user2: userId },
      ],
    }).populate("user1 user2");

    if (!friendship) {
      return res.status(400).json({
        isSucces: false,
        message: "Friendship not found or not accepted.",
      });
    }

    // 2. Determine the chat partner and conversation ID
    chatPartnerDoc =
      friendship.user1._id.toString() === userId
        ? friendship.user2
        : friendship.user1;

    if (friendship.conversationId) {
      // Conversation exists, proceed to fetch messages
      conversationDoc = await Conversation.findById(friendship.conversationId);
    }
    // Agar friendship mili lekin conversationId nahi hai, toh yeh New Chat scenario hai.
  } else if (conversationId) {
    // SCENARIO 2: Fetching by Conversation ID (Existing Chat)

    conversationDoc = await Conversation.findById(conversationId);

    if (!conversationDoc) {
      return res
        .status(404)
        .json({ isSucces: false, message: "Conversation not found." });
    }

    // Verify if the current user is a participant
    if (!conversationDoc.participants.some((p) => p.toString() === userId)) {
      return res
        .status(403)
        .json({ isSucces: false, message: "Access denied." });
    }

    // Get the chat partner's profile
    const partnerId = conversationDoc.participants.find(
      (p) => p.toString() !== userId
    );
    chatPartnerDoc = await User.findById(partnerId);
  }

  // 3. Fetch Messages if Conversation exists
  if (conversationDoc) {
    messages = await Message.find({
      conversationId: conversationDoc._id,
    }).sort({ timestamp: 1 });
  }

  // Final Formatting
  const responseData = {
    conversationId: conversationDoc ? conversationDoc._id : null,
    chatPartner: chatPartnerDoc
      ? {
          id: chatPartnerDoc._id,
          fullName: chatPartnerDoc.fullName,
          username: chatPartnerDoc.username,
          profileImageUrl: chatPartnerDoc.profileImageUrl,
          isOnline: chatPartnerDoc.isOnline, // Example field
          lastSeen: chatPartnerDoc.lastSeen, // Example field
        }
      : null,
    messages: messages,
  };

  return res.status(200).json(responseData);
});

// Send Message

exports.sendMessage = catchAsync(async (req, res) => {
  const { userId } = req;
  const { conversationId, content, media = [], clientId } = req.body;

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    return res.status(404).json({ message: "Conversation not found" });
  }

  const receiverId = conversation.participants.find(
    (id) => id.toString() !== userId.toString()
  );

  // 🔎 CHECK RECEIVER PRESENCE
  const presence = await getPresence(receiverId);
  let status = "sent";

  if (
    presence?.status === "in_chat" &&
    presence.activeChatId === conversationId.toString()
  ) {
    status = "read";
  } else if (presence?.status === "online" || presence?.status === "in_chat") {
    status = "delivered";
  }

  // ✅ SAVE MESSAGE WITH STATUS
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

  // 🚀 EMIT MESSAGE
  const io = getIO();
  io.to(conversationId.toString()).emit("receive_message", {
    ...populatedMessage.toObject(),
    clientId,
    status,
  });

  return res.status(201).json({
    isSuccess: true,
    sentMessage: populatedMessage,
  });
});
