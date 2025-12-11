const User = require("../models/userModel");
const FriendRequest = require("../models/friendRequestModel");

const catchAsync = require("../utils/catchAsync");

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

  // Check if request already exists (either direction)
  const alreadyRequested = await FriendRequest.findOne({
    $or: [
      { senderId, receiverId },
      { senderId: receiverId, receiverId: senderId },
    ],
  });

  if (alreadyRequested) {
    return res.status(400).json({
      isSuccess: false,
      message: "Friend request already exists",
      request: alreadyRequested,
    });
  }

  const request = await FriendRequest.create({ senderId, receiverId });

  return res
    .status(201)
    .json({ isSuccess: true, message: "Friend request sent", request });
});

exports.cancelFriendRequest = catchAsync(async (req, res) => {
  const senderId = req.userId;
  const { id: requestId } = req.params;

  const request = await FriendRequest.findOne({
    _id: requestId,
    senderId,
  });

  if (!request) {
    return res
      .status(404)
      .json({ isSuccess: false, message: "Friend request not found" });
  }

  await FriendRequest.deleteOne({ _id: requestId });

  return res.status(200).json({
    isSuccess: true,
    message: "Friend request cancelled",
  });
});

exports.getSentRequests = catchAsync(async (req, res) => {
  const senderId = req.userId;

  const requests = await FriendRequest.find({ senderId }).populate(
    "receiverId",
    "fullName username profileImageUrl"
  );

  const formatted = requests.map((r) => ({
    id: r._id,
    receiverId: r.receiverId._id,
    fullName: r.receiverId.fullName,
    username: r.receiverId.username,
    profileImageUrl: r.receiverId.profileImageUrl,
  }));

  return res.status(200).json({
    isSuccess: true,
    results: formatted.length,
    requests: formatted,
  });
});

exports.getPendingRequests = catchAsync(async (req, res) => {
  const userId = req.userId;

  const requests = await FriendRequest.find({ receiverId: userId }).populate(
    "senderId",
    "fullName username profileImageUrl"
  );

  const formattedRequests = requests.map((r) => ({
    id: r._id,
    senderId: r.senderId._id, // ⬅️ IMPORTANT for incomingMap
    fullName: r.senderId.fullName,
    username: r.senderId.username,
    profileImageUrl: r.senderId.profileImageUrl,
  }));

  return res.status(200).json({
    isSuccess: true,
    results: formattedRequests.length,
    requests: formattedRequests,
  });
});

exports.acceptFriendRequest = catchAsync(async (req, res) => {
  const receiverId = req.userId;
  const { id: requestId } = req.params;

  // 1. Find the friend request for this receiver
  const request = await FriendRequest.findOne({
    _id: requestId,
    receiverId,
  });

  if (!request) {
    return res
      .status(404)
      .json({ isSuccess: false, message: "Friend request not found" });
  }

  const senderId = request.senderId;

  // Optional safety: prevent someone from friending themselves
  if (senderId.toString() === receiverId.toString()) {
    return res.status(400).json({
      isSuccess: false,
      message: "Cannot accept a friend request from yourself",
    });
  }

  // 2. Update both users' friends arrays (symmetric friendship)
  // $addToSet avoids duplicates if they are already friends
  await Promise.all([
    User.updateOne({ _id: senderId }, { $addToSet: { friends: receiverId } }),
    User.updateOne({ _id: receiverId }, { $addToSet: { friends: senderId } }),
  ]);

  // 3. Delete the friend request after accepting
  await FriendRequest.deleteOne({ _id: request._id });

  return res.status(200).json({
    isSuccess: true,
    message: "Friend request accepted",
  });
});

exports.declineFriendRequest = catchAsync(async (req, res) => {
  const { id: requestId } = req.params;
  const receiverId = req.userId;

  const request = await FriendRequest.findOne({ _id: requestId, receiverId });

  if (!request) {
    return res
      .status(404)
      .json({ isSuccess: false, message: "Friend request not found" });
  }

  await FriendRequest.deleteOne({ _id: requestId });

  return res.status(200).json({
    isSuccess: true,
    message: "Friend request declined",
  });
});
