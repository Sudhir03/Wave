const catchAsync = require("../utils/catchAsync");
const Call = require("../models/callModel");

exports.getMyCallHistory = catchAsync(async (req, res) => {
  const { userId } = req;

  const calls = await Call.find({
    $or: [{ callerId: userId }, { calleeId: userId }],
  })
    .populate("callerId", "firstName lastName profileImageUrl")
    .populate("calleeId", "firstName lastName profileImageUrl")
    .sort({ createdAt: -1 });

  const history = calls.map((call) => {
    const isCaller = call.callerId._id.toString() === userId;

    return {
      callId: call._id,
      type: call.callType,
      direction: isCaller ? "outgoing" : "incoming",
      otherUser: isCaller ? call.calleeId : call.callerId,

      status: call.connectedAt
        ? "connected"
        : call.endedAt
        ? "missed"
        : "initiated",

      startedAt: call.createdAt,
      endedAt: call.endedAt,
      duration: call.duration,
    };
  });

  res.status(200).json({
    count: history.length,
    data: history,
  });
});
