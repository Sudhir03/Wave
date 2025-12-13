const mongoose = require("mongoose");

const friendshipSchema = new mongoose.Schema(
  {
    user1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    user2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      default: null,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "blocked"],
      default: "pending",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

friendshipSchema.index({ user1: 1, user2: 1 }, { unique: true });

module.exports = mongoose.model("Friendship", friendshipSchema);
