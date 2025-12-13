const mongoose = require("mongoose");
const { Schema } = mongoose;

/**
 * Message Schema
 */
const MessageSchema = new Schema(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
    },
    content: {
      type: String,
      trim: true,
      default: null,
    },
    media: [
      {
        type: {
          type: String,
          required: true,
          enum: ["image", "video", "document", "audio", "voice"],
        },
        url: {
          type: String,
          required: true,
        },
        fileName: {
          type: String,
        },
        fileSize: {
          type: Number,
        },
        poster: {
          type: String,
          default: null,
        },
      },
    ],
    status: {
      type: String,
      enum: ["sent", "delivered", "read", "failed"],
      default: "sent",
    },
    readBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: false,
  }
);

module.exports = mongoose.model("Message", MessageSchema);
