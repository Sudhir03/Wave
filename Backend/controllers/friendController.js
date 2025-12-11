const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");

exports.getMyFriends = catchAsync(async (req, res) => {
  const userId = req.userId;

  const user = await User.findById(userId).populate(
    "friends",
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
    results: user.friends.length,
    friends: user.friends,
  });
});

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

  // Check that the friend relationship exists
  const user = await User.findOne({
    _id: userId,
    friends: friendId,
  });

  if (!user) {
    return res.status(404).json({
      isSuccess: false,
      message: "Friend relationship not found",
    });
  }

  // Remove each user from the other's friends list
  await Promise.all([
    User.updateOne({ _id: userId }, { $pull: { friends: friendId } }),
    User.updateOne({ _id: friendId }, { $pull: { friends: userId } }),
  ]);

  return res.status(200).json({
    isSuccess: true,
    message: "Friend removed successfully",
  });
});
