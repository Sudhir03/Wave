const Call = require("../models/callModel");

exports.createCall = async ({ callerId, calleeId, callType }) => {
  return Call.create({
    callerId,
    calleeId,
    callType,
    startedAt: new Date(),
  });
};

exports.answerCall = async ({ callId }) => {
  return Call.updateOne(
    { _id: callId, connectedAt: null },
    { connectedAt: new Date() }
  );
};

exports.endCall = async ({ callId }) => {
  const call = await Call.findById(callId);
  if (!call) return;

  const endedAt = new Date();
  const duration = call.connectedAt ? (endedAt - call.connectedAt) / 1000 : 0;

  return Call.updateOne({ _id: callId }, { endedAt, duration });
};
