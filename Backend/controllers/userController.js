const catchAsync = require("../utils/catchAsync");
const User = require("../models/userModel");

exports.clerkUserSync = catchAsync(async (req, res, next) => {
  const { type, data } = req.body;

  if (!type || !data) {
    return res.status(400).json({ message: "Invalid webhook payload" });
  }

  console.log("Clerk Webhook Event:", type);

  const clerkUserId = data.id;

  if (type === "user.created" || type === "user.updated") {
    const primaryEmail = data.email_addresses?.[0]?.email_address || null;

    const fullName =
      data.first_name || data.last_name
        ? `${data.first_name || ""} ${data.last_name || ""}`.trim()
        : null;

    await User.findOneAndUpdate(
      { clerkUserId },
      {
        clerkUserId,
        username: data.username || null,
        firstName: data.first_name || null,
        lastName: data.last_name || null,
        fullName,
        email: primaryEmail,
        profileImageUrl: data.profile_image_url || null,
        clerkCreatedAt: data.created_at ? new Date(data.created_at) : undefined,
        clerkUpdatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
      },
      { upsert: true, new: true }
    );

    console.log("Profile Synced →", clerkUserId);
  }

  if (type === "user.deleted") {
    await User.findOneAndUpdate(
      { clerkUserId },
      {
        isDeleted: true,
        deletedAt: new Date(),
        email: null,
        username: null,
        fullName: null,
        firstName: null,
        lastName: null,
        profileImageUrl: null,
      }
    );

    console.log("User soft-deleted (flag set) →", clerkUserId);
  }

  return res.status(200).json({ received: true });
});

exports.searchUsers = catchAsync(async (req, res, next) => {
  const { q } = req.query;
  const currentUserId = req.userId;

  if (!q || q.trim().length === 0) {
    return res.status(200).json({
      isSuccess: true,
      results: 0,
      users: [],
    });
  }

  const regex = new RegExp(q.trim(), "i");

  const users = await User.find({
    isDeleted: { $ne: true },
    clerkUserId: { $ne: currentUserId },
    $or: [{ username: regex }, { fullName: regex }],
  }).select("clerkUserId username fullName profileImageUrl");

  res.status(200).json({
    isSuccess: true,
    results: users.length,
    users,
  });
});
