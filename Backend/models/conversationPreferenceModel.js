const mongoose = require("mongoose");

const conversationPreferenceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },

    // UI-only preferences
    pinned: {
      type: Boolean,
      default: false,
      index: true,
    },
    muted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// One preference per user per conversation
conversationPreferenceSchema.index(
  { userId: 1, conversationId: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "ConversationPreference",
  conversationPreferenceSchema
);
