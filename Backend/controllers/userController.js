const { clerkClient } = require("@clerk/clerk-sdk-node");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/userModel");

exports.clerkUserSync = catchAsync(async (req, res) => {
  const { type, data } = req.body;

  if (!type || !data) {
    return res.status(400).json({ message: "Invalid webhook payload" });
  }

  const clerkUserId = data.id;

  if (type === "user.created") {
    const primaryEmail = data.email_addresses?.[0]?.email_address || null;

    const fullName = `${data.first_name} ${data.last_name}`.trim();

    await User.create({
      clerkUserId,
      username: data.username,
      firstName: data.first_name,
      lastName: data.last_name,
      fullName,
      email: primaryEmail,
      profileImageUrl: data.profile_image_url,
      clerkCreatedAt: data.created_at ? new Date(data.created_at) : undefined,
      clerkUpdatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
    });
  }

  return res.status(200).json({ received: true });
});

exports.getMe = catchAsync(async (req, res) => {
  const { userId } = req;

  const user = await User.findById(userId).select(
    "firstName lastName username email profileImageUrl"
  );

  if (!user) {
    return res.status(404).json({
      isSuccess: false,
      message: "User not found",
    });
  }

  return res.status(200).json({
    isSuccess: true,
    user,
  });
});

exports.updateMe = catchAsync(async (req, res) => {
  const { name, username } = req.body;
  const { userId } = req;

  if (name && (!name.first || !name.last)) {
    return res.status(400).json({
      isSuccess: false,
      message: "First name and last name are mandatory.",
    });
  }

  const userDoc = await User.findById(userId).select(
    "clerkUserId fullName firstName lastName username"
  );

  if (!userDoc) {
    return res.status(404).json({
      isSuccess: false,
      message: "User not found",
    });
  }

  const clerkUserId = userDoc.clerkUserId;

  let isUpdateNeeded = false;
  const updatesForClerk = {};

  let firstNameChanged = false;
  let lastNameChanged = false;

  if (name && !!name.first && name.first !== userDoc.firstName) {
    firstNameChanged = true;
    updatesForClerk.firstName = name.first;
  }

  if (name && !!name.last && name.last !== userDoc.lastName) {
    lastNameChanged = true;
    updatesForClerk.lastName = name.last;
  }

  if (firstNameChanged || lastNameChanged) {
    isUpdateNeeded = true;

    const finalFirstName = updatesForClerk.firstName || userDoc.firstName;
    const finalLastName = updatesForClerk.lastName || userDoc.lastName;

    userDoc.fullName =
      `${finalFirstName.trim()} ${finalLastName.trim()}`.trim();

    userDoc.firstName = finalFirstName;
    userDoc.lastName = finalLastName;
  }

  if (!!username && username !== userDoc.username) {
    isUpdateNeeded = true;

    updatesForClerk.username = username || null;

    userDoc.username = username;
  }

  if (!isUpdateNeeded) {
    return res.status(200).json({
      isSuccess: true,
      message: "No changes detected. Profile remains the same.",
      user: userDoc,
    });
  }

  // Update Clerk only if there are relevant changes
  if (Object.keys(updatesForClerk).length > 0) {
    console.log(updatesForClerk);

    await clerkClient.users.updateUser(clerkUserId, updatesForClerk);
  }

  await userDoc.save();

  return res.status(200).json({
    isSuccess: true,
    message: "Profile updated successfully.",
    user: userDoc,
  });
});

exports.updateAvatar = catchAsync(async (req, res) => {
  const file = req.file;
  const { userId } = req;

  if (!file) {
    return res.status(400).json({
      isSuccess: false,
      message: "File is required",
    });
  }

  const userDoc = await User.findById(userId);

  if (!userDoc) {
    return res.status(404).json({
      isSuccess: false,
      message: "User not found",
    });
  }

  const clerkUserId = userDoc.clerkUserId;

  if (!clerkUserId) {
    return res.status(400).json({
      isSuccess: false,
      message: "User is missing clerkUserId",
    });
  }

  const imageBlob = new Blob([file.buffer], { type: file.mimetype });

  let updatedClerkUser;
  try {
    updatedClerkUser = await clerkClient.users.updateUserProfileImage(
      clerkUserId,
      {
        file: imageBlob,
      }
    );
  } catch (err) {
    return res.status(400).json({
      isSuccess: false,
      message: err?.errors?.[0]?.message || "Failed to update profile",
    });
  }

  userDoc.profileImageUrl = updatedClerkUser.imageUrl;
  await userDoc.save();

  return res.status(200).json({
    isSuccess: true,
    message: "Avatar updated successfully",
    profileImageUrl: updatedClerkUser.imageUrl,
  });
});

exports.updatePassword = catchAsync(async (req, res) => {
  const { userId } = req;
  const { newPassword } = req.body;

  if (
    !newPassword ||
    typeof newPassword !== "string" ||
    newPassword.trim().length < 8
  ) {
    return res.status(400).json({
      isSuccess: false,
      message: "newPassword is required and must be at least 8 characters",
    });
  }

  const userDoc = await User.findById(userId);
  if (!userDoc) {
    return res.status(404).json({
      isSuccess: false,
      message: "User not found",
    });
  }

  const clerkUserId = userDoc.clerkUserId;
  if (!clerkUserId) {
    return res.status(400).json({
      isSuccess: false,
      message: "User is missing clerkUserId",
    });
  }

  try {
    await clerkClient.users.updateUser(clerkUserId, {
      password: newPassword,
    });

    return res.status(200).json({
      isSuccess: true,
      message: "Password updated successfully",
    });
  } catch (err) {
    return res.status(400).json({
      isSuccess: false,
      message: err?.errors?.[0]?.message || "Failed to update password",
    });
  }
});

exports.searchUsers = catchAsync(async (req, res) => {
  const { q } = req.query;
  const { userId: currentUserId } = req;

  if (!q || q.trim().length === 0) {
    return res.status(200).json({
      isSuccess: true,
      results: 0,
      users: [],
    });
  }

  const regex = new RegExp(q.trim(), "i");

  // 1. Users I blocked
  const me = await User.findById(currentUserId).select("blockedUsers");
  const blockedByMe = me.blockedUsers || [];

  // 2. Users who blocked me
  const usersWhoBlockedMe = await User.find({
    blockedUsers: currentUserId,
  }).select("_id");
  const blockedMeIds = usersWhoBlockedMe.map((u) => u._id);

  // 3. Exclude all
  const excludedIds = [currentUserId, ...blockedByMe, ...blockedMeIds];

  // 4. Search
  const users = await User.find({
    isDeleted: { $ne: true },
    _id: { $nin: excludedIds },
    $or: [{ username: regex }, { fullName: regex }],
  }).select("clerkUserId username fullName profileImageUrl");

  return res.status(200).json({
    isSuccess: true,
    results: users.length,
    users,
  });
});
