const Conversation = require("../models/conversationModel");
const Message = require("../models/messageModel");
const catchAsync = require("../utils/catchAsync");
const uploadToCloudinary = require("../utils/uploadToCloudinary");

const { getIO } = require("../socket/socket");
const { getPresence } = require("../redis/presence");

/* =========================
   GET MY CONVERSATIONS
========================= */
exports.getMyConversations = async (req, res) => {
  try {
    const userId = req.userId;
    const { limit = 10, cursor } = req.query;

    const query = { participants: userId };
    if (cursor) query.updatedAt = { $lt: new Date(cursor) };

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

    res.status(200).json({ conversations: formatted, nextCursor });
  } catch (error) {
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
  if (!conversation) {
    return res.status(404).json({ message: "Conversation not found" });
  }

  if (!conversation.participants.some((p) => p.toString() === userId)) {
    return res.status(403).json({ message: "Access denied" });
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

  if (!content?.trim()) {
    return res.status(400).json({ message: "Text content required" });
  }

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    return res.status(404).json({ message: "Conversation not found" });
  }

  const receiverId = conversation.participants.find(
    (id) => id.toString() !== userId.toString()
  );

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

  const io = getIO();
  io.to(conversationId.toString()).emit("receive_message", {
    ...populatedMessage.toObject(),
    clientId,
    status,
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

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "Media files required" });
  }

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    return res.status(404).json({ message: "Conversation not found" });
  }

  const receiverId = conversation.participants.find(
    (id) => id.toString() !== userId.toString()
  );

  const media = await Promise.all(
    req.files.map(async (file) => {
      let type = "document";
      let resourceType = "raw";
      let thumbnail = null;
      let isVoice = false;

      // IMAGE
      if (file.mimetype.startsWith("image")) {
        type = "image";
        resourceType = "image";
      }

      // VIDEO
      else if (file.mimetype.startsWith("video")) {
        type = "video";
        resourceType = "video";
      }

      // AUDIO / VOICE
      else if (file.mimetype.startsWith("audio")) {
        type = "audio";
        resourceType = "video"; // cloudinary requirement

        // 🔥 VOICE DETECTION (MIC RECORDED)
        if (file.originalname.startsWith("voice-")) {
          isVoice = true;
        }
      }

      const uploaded = await uploadToCloudinary({
        buffer: file.buffer,
        subFolder: `chat-media/${conversationId}`,
        resourceType,
      });

      // VIDEO THUMBNAIL (Cloudinary)
      if (type === "video") {
        thumbnail = uploaded.secure_url
          .replace("/video/upload/", "/video/upload/so_1,f_jpg,q_auto,w_400/")
          .replace(".mp4", ".jpg");
      }

      // IMAGE THUMBNAIL = IMAGE ITSELF
      if (type === "image") {
        thumbnail = uploaded.secure_url;
      }

      return {
        type, // image | video | audio | document
        isVoice,
        url: uploaded.secure_url,
        thumbnail, // image/video only
        fileName: file.originalname,
        fileSize: uploaded.bytes, // Number (bytes)
      };
    })
  );

  /* =========================
     Presence → status
  ========================= */
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

  const io = getIO();
  io.to(conversationId.toString()).emit("receive_message", {
    ...populatedMessage.toObject(),
    clientId,
    status,
  });

  res.status(201).json({
    isSuccess: true,
    sentMessage: populatedMessage,
  });
});
