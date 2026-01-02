const User = require("../models/userModel");
const Friendship = require("../models/friendshipModel");
const Conversation = require("../models/conversationModel");
const catchAsync = require("../utils/catchAsync");

/**
 * POST /block/:userId
 * Block a user
 *
 * Rules:
 * - Cannot block self
 * - Remove pending friend requests (both directions)
 * - Remove friendship if exists
 * - (Optional) Conversation can be archived later
 * - Add user to blockedUsers
 */
exports.blockUser = catchAsync(async (req, res) => {
  const blockerId = req.userId;
  const { userId: targetId } = req.params;

  /* =========================
     BASIC VALIDATIONS
  ========================= */
  if (blockerId.toString() === targetId) {
    return res.status(400).json({
      isSuccess: false,
      message: "You cannot block yourself",
    });
  }

  const targetUser = await User.findById(targetId);
  if (!targetUser) {
    return res.status(404).json({
      isSuccess: false,
      message: "User not found",
    });
  }

  /* =========================
     1. REMOVE PENDING REQUESTS
  ========================= */
  await Friendship.deleteMany({
    status: "pending",
    $or: [
      { user1: blockerId, user2: targetId },
      { user1: targetId, user2: blockerId },
    ],
  });

  /* =========================
     2. REMOVE FRIENDSHIP (IF ANY)
  ========================= */
  const friendship = await Friendship.findOne({
    status: "accepted",
    $or: [
      { user1: blockerId, user2: targetId },
      { user1: targetId, user2: blockerId },
    ],
  });

  if (friendship) {
    await Friendship.deleteOne({ _id: friendship._id });

    await Promise.all([
      User.updateOne(
        { _id: blockerId },
        { $pull: { friendships: friendship._id } }
      ),
      User.updateOne(
        { _id: targetId },
        { $pull: { friendships: friendship._id } }
      ),
    ]);
  }

  /* =========================
     3. (OPTIONAL) HANDLE CONVERSATION
     - Not deleting for now (safe)
     - UI already hides via search + block
  ========================= */
  // Future: archive / soft delete conversation if needed

  /* =========================
     4. ADD TO BLOCK LIST
  ========================= */
  await User.updateOne(
    { _id: blockerId },
    { $addToSet: { blockedUsers: targetId } }
  );

  return res.status(200).json({
    isSuccess: true,
    message: "User blocked successfully",
  });
});

/**
 * POST /block/:userId/unblock
 * Unblock a user
 *
 * Notes:
 * - Does NOT restore friendship
 * - Does NOT restore requests
 * - User must re-add manually
 */
exports.unblockUser = catchAsync(async (req, res) => {
  const blockerId = req.userId;
  const { userId: targetId } = req.params;

  await User.updateOne(
    { _id: blockerId },
    { $pull: { blockedUsers: targetId } }
  );

  return res.status(200).json({
    isSuccess: true,
    message: "User unblocked successfully",
  });
});

/**
 * GET /block
 * Get my blocked users
 */
exports.getBlockedUsers = catchAsync(async (req, res) => {
  const user = await User.findById(req.userId).populate(
    "blockedUsers",
    "fullName username profileImageUrl"
  );

  if (!user) {
    return res.status(404).json({
      isSuccess: false,
      message: "User not found",
    });
  }

  return res.status(200).json({
    isSuccess: true,
    results: user.blockedUsers.length,
    users: user.blockedUsers,
  });
});
