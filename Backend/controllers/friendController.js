const User = require("../models/userModel");
const Friendship = require("../models/friendshipModel");
const catchAsync = require("../utils/catchAsync");

/* =========================
   Helper: Block Check
========================= */
const isBlockedBetween = async (a, b) => {
  const [u1, u2] = await Promise.all([
    User.findById(a).select("blockedUsers"),
    User.findById(b).select("blockedUsers"),
  ]);

  if (!u1 || !u2) return true;

  return u1.blockedUsers.includes(b) || u2.blockedUsers.includes(a);
};

/* =========================
   1. Send Friend Request
========================= */
exports.sendFriendRequest = catchAsync(async (req, res) => {
  const senderId = req.userId;
  const { receiverId } = req.body;

  if (!receiverId) {
    return res.status(400).json({
      isSuccess: false,
      message: "receiverId required",
    });
  }

  if (senderId.toString() === receiverId) {
    return res.status(400).json({
      isSuccess: false,
      message: "Cannot send request to yourself",
    });
  }

  // ❌ Block check
  const blocked = await isBlockedBetween(senderId, receiverId);
  if (blocked) {
    return res.status(403).json({
      isSuccess: false,
      message: "You cannot send a request to this user",
    });
  }

  const receiverExists = await User.findById(receiverId);
  if (!receiverExists) {
    return res.status(404).json({
      isSuccess: false,
      message: "Receiver user not found",
    });
  }

  const existingRelationship = await Friendship.findOne({
    $or: [
      { user1: senderId, user2: receiverId },
      { user1: receiverId, user2: senderId },
    ],
  });

  if (existingRelationship) {
    if (existingRelationship.status === "accepted") {
      return res.status(400).json({
        isSuccess: false,
        message: "Already friends with this user.",
      });
    }

    if (existingRelationship.status === "pending") {
      return res.status(400).json({
        isSuccess: false,
        message: "Friend request already exists.",
      });
    }
  }

  const request = await Friendship.create({
    user1: senderId,
    user2: receiverId,
    status: "pending",
    conversationId: null,
  });

  return res.status(201).json({
    isSuccess: true,
    message: "Friend request sent",
    request,
  });
});

/* =========================
   2. Cancel Friend Request
========================= */
exports.cancelFriendRequest = catchAsync(async (req, res) => {
  const senderId = req.userId;
  const { id: friendshipId } = req.params;

  const friendship = await Friendship.findOne({
    _id: friendshipId,
    user1: senderId,
    status: "pending",
  });

  if (!friendship) {
    return res.status(404).json({
      isSuccess: false,
      message: "Pending request not found",
    });
  }

  await Friendship.deleteOne({ _id: friendshipId });

  res.status(200).json({
    isSuccess: true,
    message: "Friend request cancelled",
  });
});

/* =========================
   3. Get Sent Requests
========================= */
exports.getSentRequests = catchAsync(async (req, res) => {
  const senderId = req.userId;

  const me = await User.findById(senderId).select("blockedUsers");

  const requests = await Friendship.find({
    user1: senderId,
    status: "pending",
    user2: { $nin: me.blockedUsers },
  }).populate("user2", "fullName username profileImageUrl");

  const formatted = requests.map((r) => ({
    id: r._id,
    receiverId: r.user2._id,
    fullName: r.user2.fullName,
    username: r.user2.username,
    profileImageUrl: r.user2.profileImageUrl,
  }));

  res.status(200).json({
    isSuccess: true,
    results: formatted.length,
    requests: formatted,
  });
});

/* =========================
   4. Get Pending Requests
========================= */
exports.getPendingRequests = catchAsync(async (req, res) => {
  const { userId } = req;

  const me = await User.findById(userId).select("blockedUsers");

  const requests = await Friendship.find({
    user2: userId,
    status: "pending",
    user1: { $nin: me.blockedUsers },
  }).populate("user1", "fullName username profileImageUrl");

  const formattedRequests = requests.map((r) => ({
    id: r._id,
    senderId: r.user1._id,
    fullName: r.user1.fullName,
    username: r.user1.username,
    profileImageUrl: r.user1.profileImageUrl,
  }));

  res.status(200).json({
    isSuccess: true,
    results: formattedRequests.length,
    requests: formattedRequests,
  });
});

/* =========================
   5. Accept Friend Request
========================= */
exports.acceptFriendRequest = catchAsync(async (req, res) => {
  const receiverId = req.userId;
  const { id: friendshipId } = req.params;

  const friendship = await Friendship.findOne({
    _id: friendshipId,
    user2: receiverId,
    status: "pending",
  });

  if (!friendship) {
    return res.status(404).json({
      isSuccess: false,
      message: "Pending request not found",
    });
  }

  // ❌ Block check
  const blocked = await isBlockedBetween(receiverId, friendship.user1);
  if (blocked) {
    return res.status(403).json({
      isSuccess: false,
      message: "Cannot accept request from blocked user",
    });
  }

  await Friendship.updateOne({ _id: friendshipId }, { status: "accepted" });

  await Promise.all([
    User.updateOne(
      { _id: friendship.user1 },
      { $addToSet: { friendships: friendshipId } }
    ),
    User.updateOne(
      { _id: receiverId },
      { $addToSet: { friendships: friendshipId } }
    ),
  ]);

  res.status(200).json({
    isSuccess: true,
    message: "Friend request accepted",
  });
});

/* =========================
   6. Decline Friend Request
========================= */
exports.declineFriendRequest = catchAsync(async (req, res) => {
  const { id: friendshipId } = req.params;
  const receiverId = req.userId;

  const friendship = await Friendship.findOne({
    _id: friendshipId,
    user2: receiverId,
    status: "pending",
  });

  if (!friendship) {
    return res.status(404).json({
      isSuccess: false,
      message: "Pending request not found",
    });
  }

  await Friendship.deleteOne({ _id: friendshipId });

  res.status(200).json({
    isSuccess: true,
    message: "Friend request declined",
  });
});

/* =========================
   7. Get Friends List
========================= */
exports.getMyFriends = catchAsync(async (req, res) => {
  const { userId } = req;

  const user = await User.findById(userId)
    .select("blockedUsers friendships")
    .populate({
      path: "friendships",
      match: { status: "accepted" },
      populate: [
        { path: "user1", select: "fullName username profileImageUrl" },
        { path: "user2", select: "fullName username profileImageUrl" },
      ],
    });

  if (!user) {
    return res.status(404).json({
      isSuccess: false,
      message: "User not found",
    });
  }

  const blockedSet = new Set(user.blockedUsers.map(String));

  const friends = user.friendships
    .map((f) => {
      const friend = f.user1._id.toString() === userId ? f.user2 : f.user1;

      if (blockedSet.has(friend._id.toString())) return null;

      return {
        _id: friend._id,
        fullName: friend.fullName,
        username: friend.username,
        profileImageUrl: friend.profileImageUrl,
        conversationId: f.conversationId || null,
      };
    })
    .filter(Boolean);

  res.status(200).json({
    isSuccess: true,
    results: friends.length,
    friends,
  });
});

/* =========================
   8. Remove Friend
========================= */
exports.removeFriend = catchAsync(async (req, res) => {
  const userId = req.userId;
  const { id: friendId } = req.params;

  if (userId.toString() === friendId.toString()) {
    return res.status(400).json({
      isSuccess: false,
      message: "You cannot remove yourself",
    });
  }

  const friendship = await Friendship.findOne({
    status: "accepted",
    $or: [
      { user1: userId, user2: friendId },
      { user1: friendId, user2: userId },
    ],
  });

  if (!friendship) {
    return res.status(404).json({
      isSuccess: false,
      message: "Friend relationship not found",
    });
  }

  await Friendship.deleteOne({ _id: friendship._id });

  await Promise.all([
    User.updateOne({ _id: userId }, { $pull: { friendships: friendship._id } }),
    User.updateOne(
      { _id: friendId },
      { $pull: { friendships: friendship._id } }
    ),
  ]);

  res.status(200).json({
    isSuccess: true,
    message: "Friend removed successfully",
  });
});
