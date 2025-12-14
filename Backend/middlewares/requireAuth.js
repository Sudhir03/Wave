const User = require("../models/userModel");
const { verifyToken } = require("@clerk/backend");

exports.requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Please sign in to continue" });
    }

    const token = authHeader.split(" ")[1];

    const session = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    const authUser = await User.findOne({
      clerkUserId: session.sub,
    });
    req.userId = authUser?._id?.toString();
    req.clerkUserId = authUser?.clerkUserId;

    next();
  } catch (error) {
    return res.status(401).json({
      isSuccess: false,
      message: "Session expired, please sign in again",
    });
  }
};
