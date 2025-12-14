const catchAsync = require("../utils/catchAsync");

const Conversation = require("../models/conversationModel");

exports.getConversationId = catchAsync(async (req, res) => {
  const { userId } = req;
  const { friendId } = req.params;

  if (!friendId) {
    return res
      .status(400)
      .json({ isSuccess: false, message: "Friend ID is required." });
  }

  const conversationDoc = await Conversation.findOne({
    participants: {
      $all: [userId, friendId],
    },
  });

  if (!conversationDoc) {
    return res.status(404).json({
      isSuccess: false,
      message: "Conversation not found between these users.",
    });
  }

  return res.status(200).json({
    isSuccess: true,
    conversationId: conversationDoc._id,
  });
});

exports.createConversation = catchAsync(async (req, res) => {
  const { userId } = req;
  const { friendId } = req.params;

  if (!friendId) {
    return res
      .status(400)
      .json({ isSuccess: false, message: "Friend ID is required." });
  }

  const conversationDoc = await Conversation.findOne({
    participants: {
      $all: [userId, friendId],
    },
  });

  if (conversationDoc) {
    return res.status(200).json({
      isSuccess: true,
      conversationId: conversationDoc._id,
    });
  }

  const newConversationDoc = await Conversation.create({
    participants: [userId, friendId],
  });

  return res.status(201).json({
    isSuccess: true,
    conversationId: newConversationDoc._id,
  });
});
