const User = require("../models/userModel");
const Conversation = require("../models/conversationModel");
const Friendship = require("../models/friendshipModel");
const catchAsync = require("../utils/catchAsync");

// 1. Send Friend Request
exports.sendFriendRequest = catchAsync(async (req, res) => {
  const senderId = req.userId;
  const { receiverId } = req.body;

  if (!receiverId) {
    return res
      .status(400)
      .json({ isSuccess: false, message: "receiverId required" });
  }

  if (senderId.toString() === receiverId) {
    return res
      .status(400)
      .json({ isSuccess: false, message: "Cannot send request to yourself" });
  }

  const receiverExists = await User.findById(receiverId);
  if (!receiverExists) {
    return res
      .status(404)
      .json({ isSuccess: false, message: "Receiver user not found" });
  }

  // Check if relationship already exists (pending or accepted)
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
      const isIncoming =
        existingRelationship.user2.toString() === senderId.toString();

      return res.status(400).json({
        isSuccess: false,
        message: isIncoming
          ? "This user has already sent you a request."
          : "Friend request already sent and pending.",
        relationship: existingRelationship,
      });
    }
  }

  // Create new Friendship document with 'pending' status
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

// 2. Cancel Friend Request
exports.cancelFriendRequest = catchAsync(async (req, res) => {
  const senderId = req.userId;
  const { id: friendshipId } = req.params;

  // Find the pending friendship initiated by the sender
  const friendship = await Friendship.findOne({
    _id: friendshipId,
    user1: senderId,
    status: "pending",
  });

  if (!friendship) {
    return res
      .status(404)
      .json({ isSuccess: false, message: "Pending request not found" });
  }

  // Delete the friendship document
  await Friendship.deleteOne({ _id: friendshipId });

  return res.status(200).json({
    isSuccess: true,
    message: "Friend request cancelled",
  });
});

// 3. Get Sent Requests
exports.getSentRequests = catchAsync(async (req, res) => {
  const senderId = req.userId;

  // Find pending friendships where the current user is user1 (sender)
  const requests = await Friendship.find({
    user1: senderId,
    status: "pending",
  }).populate("user2", "fullName username profileImageUrl");

  const formatted = requests.map((r) => ({
    id: r._id,
    receiverId: r.user2._id,
    fullName: r.user2.fullName,
    username: r.user2.username,
    profileImageUrl: r.user2.profileImageUrl,
  }));

  return res.status(200).json({
    isSuccess: true,
    results: formatted.length,
    requests: formatted,
  });
});

// 4. Get Pending Requests
exports.getPendingRequests = catchAsync(async (req, res) => {
  const { userId } = req;

  // Find pending friendships where the current user is user2 (receiver)
  const requests = await Friendship.find({
    user2: userId,
    status: "pending",
  }).populate("user1", "fullName username profileImageUrl");

  const formattedRequests = requests.map((r) => ({
    id: r._id,
    senderId: r.user1._id,
    fullName: r.user1.fullName,
    username: r.user1.username,
    profileImageUrl: r.user1.profileImageUrl,
  }));

  return res.status(200).json({
    isSuccess: true,
    results: formattedRequests.length,
    requests: formattedRequests,
  });
});

// 5. Accept Friend Request
exports.acceptFriendRequest = catchAsync(async (req, res) => {
  const receiverId = req.userId;
  const { id: friendshipId } = req.params;

  // Find the pending friendship where the current user is the intended receiver
  const friendship = await Friendship.findOne({
    _id: friendshipId,
    user2: receiverId,
    status: "pending",
  });

  if (!friendship) {
    return res
      .status(404)
      .json({ isSuccess: false, message: "Pending request not found" });
  }

  const senderId = friendship.user1;

  // Optional safety check
  if (senderId.toString() === receiverId.toString()) {
    return res.status(400).json({
      isSuccess: false,
      message: "Cannot accept a friend request from yourself",
    });
  }

  // 2. Update Friendship status to 'accepted'
  await Friendship.updateOne({ _id: friendshipId }, { status: "accepted" });

  // 3. Add the Friendship ID to both Users' 'friendships' arrays
  await Promise.all([
    User.updateOne(
      { _id: senderId },
      { $addToSet: { friendships: friendshipId } }
    ),
    User.updateOne(
      { _id: receiverId },
      { $addToSet: { friendships: friendshipId } }
    ),
  ]);

  return res.status(200).json({
    isSuccess: true,
    message: "Friend request accepted",
    friendshipId: friendshipId,
  });
});

// 6. Decline Friend Request
exports.declineFriendRequest = catchAsync(async (req, res) => {
  const { id: friendshipId } = req.params;
  const receiverId = req.userId;

  // Find the pending friendship intended for the receiver
  const friendship = await Friendship.findOne({
    _id: friendshipId,
    user2: receiverId,
    status: "pending",
  });

  if (!friendship) {
    return res
      .status(404)
      .json({ isSuccess: false, message: "Pending request not found" });
  }

  // Delete the friendship document (decline means permanent removal)
  await Friendship.deleteOne({ _id: friendshipId });

  return res.status(200).json({
    isSuccess: true,
    message: "Friend request declined",
  });
});

// 7. Get Friends List
exports.getMyFriends = catchAsync(async (req, res) => {
  // Fetches accepted friends by populating the User's friendship array.
  const { userId } = req;

  const user = await User.findById(userId).populate({
    path: "friendships",
    match: { status: "accepted" },

    select: "user1 user2 conversationId",

    populate: [
      {
        path: "user1",
        model: "User",
        select: "fullName username profileImageUrl",
      },
      {
        path: "user2",
        model: "User",
        select: "fullName username profileImageUrl",
      },
      {
        path: "conversationId",
        select: "_id",
      },
    ],
  });

  if (!user) {
    return res
      .status(404)
      .json({ isSuccess: false, message: "User not found" });
  }

  const friendsList = user.friendships.map((friendship) => {
    const friend =
      friendship.user1._id.toString() === userId.toString()
        ? friendship.user2
        : friendship.user1;

    const convId = friendship.conversationId
      ? friendship.conversationId._id
      : null;

    return {
      _id: friend._id,
      fullName: friend.fullName,
      username: friend.username,
      profileImageUrl: friend.profileImageUrl,
      conversationId: convId,
    };
  });

  return res.status(200).json({
    isSuccess: true,
    results: friendsList.length,
    friends: friendsList,
  });
});

// 8. Remove Friend
exports.removeFriend = catchAsync(async (req, res) => {
  const userId = req.userId;
  const { id: friendId } = req.params;

  // Prevent removing yourself
  if (userId.toString() === friendId.toString()) {
    return res.status(400).json({
      isSuccess: false,
      message: "You cannot remove yourself",
    });
  }

  // 1. Find the Friendship Document
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

  const friendshipId = friendship._id;

  // 2. Delete the Friendship document
  await Friendship.deleteOne({ _id: friendshipId });

  // 3. Remove the Friendship ID from both Users' 'friendships' arrays
  await Promise.all([
    User.updateOne({ _id: userId }, { $pull: { friendships: friendshipId } }),
    User.updateOne({ _id: friendId }, { $pull: { friendships: friendshipId } }),
  ]);

  return res.status(200).json({
    isSuccess: true,
    message: "Friend removed successfully",
  });
});
