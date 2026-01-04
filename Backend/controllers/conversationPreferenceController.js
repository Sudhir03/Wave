const ConversationPreference = require("../models/conversationPreferenceModel");
const Conversation = require("../models/conversationModel");
const catchAsync = require("../utils/catchAsync");

// =======================
// GET /conversation-preferences
// =======================
exports.getMyPreferences = catchAsync(async (req, res) => {
  const { userId } = req;

  const prefs = await ConversationPreference.find({ userId })
    .populate({
      path: "conversationId",
      match: { participants: userId },
      select: "_id",
    })
    .select("conversationId pinned muted")
    .lean();

  const filtered = prefs.filter((p) => p.conversationId);

  res.status(200).json(filtered);
});

// =======================
// GET /conversation-preferences/:conversationId
// =======================
exports.getPreference = catchAsync(async (req, res) => {
  const { conversationId } = req.params;
  const { userId } = req;

  const isParticipant = await Conversation.exists({
    _id: conversationId,
    participants: userId,
  });

  if (!isParticipant) {
    return res.status(403).json({ message: "Access denied" });
  }

  const pref = await ConversationPreference.findOne({
    userId,
    conversationId,
  })
    .select("pinned muted")
    .lean();

  res.status(200).json(
    pref || {
      pinned: false,
      muted: false,
    }
  );
});

// =======================
// PATCH /conversation-preferences/:conversationId
// =======================
exports.updatePreference = catchAsync(async (req, res) => {
  const { conversationId } = req.params;
  const { userId } = req;

  const isParticipant = await Conversation.exists({
    _id: conversationId,
    participants: userId,
  });

  if (!isParticipant) {
    return res.status(403).json({ message: "Access denied" });
  }

  const updates = {};
  if (req.body.pinned !== undefined) updates.pinned = req.body.pinned;
  if (req.body.muted !== undefined) updates.muted = req.body.muted;

  const pref = await ConversationPreference.findOneAndUpdate(
    { userId, conversationId },
    { $set: updates },
    { new: true, upsert: true }
  ).select("pinned muted");

  res.status(200).json(pref);
});
