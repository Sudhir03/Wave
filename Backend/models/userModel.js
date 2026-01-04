const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  // Clerk User ID (primary reference)
  clerkUserId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },

  username: {
    type: String,
    trim: true,
    index: true,
  },

  fullName: {
    type: String,
    trim: true,
    index: true,
  },

  firstName: {
    type: String,
    trim: true,
  },

  lastName: {
    type: String,
    trim: true,
  },

  email: {
    type: String,
    trim: true,
    index: true,
  },

  profileImageUrl: {
    type: String,
  },

  isDeleted: {
    type: Boolean,
    default: false,
    index: true,
  },

  lastSeen: {
    type: Date,
    default: null,
  },

  deletedAt: {
    type: Date,
  },

  clerkCreatedAt: Date,
  clerkUpdatedAt: Date,

  friendships: [{ type: mongoose.Schema.Types.ObjectId, ref: "Friendship" }],

  blockedUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
  ],
});

module.exports = mongoose.model("User", userSchema);
