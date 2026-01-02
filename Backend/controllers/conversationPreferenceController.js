const ConversationPreference = require("../models/conversationPreferenceModel");
const Conversation = require("../models/conversationModel");
const catchAsync = require("../utils/catchAsync");

// =======================
// GET Conversation Preference
// =======================
exports.getPreference = catchAsync(async (req, res) => {
  const { conversationId } = req.params;
  const { userId } = req;

  // 🔒 Ensure user is participant
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
  }).select("pinned muted");

  return res.status(200).json(
    pref || {
      pinned: false,
      muted: false,
    }
  );
});

// =======================
// PATCH Update Conversation Preference
// =======================
exports.updatePreference = catchAsync(async (req, res) => {
  const { conversationId } = req.params;
  const { userId } = req;

  // 🔒 Ensure user is participant
  const isParticipant = await Conversation.exists({
    _id: conversationId,
    participants: userId,
  });

  if (!isParticipant) {
    return res.status(403).json({ message: "Access denied" });
  }

  // ✅ Allow only safe fields
  const updates = {};
  if (req.body.pinned !== undefined) updates.pinned = req.body.pinned;
  if (req.body.muted !== undefined) updates.muted = req.body.muted;

  const pref = await ConversationPreference.findOneAndUpdate(
    { userId, conversationId },
    { $set: updates },
    { new: true, upsert: true }
  ).select("pinned muted");

  return res.status(200).json(pref);
});
