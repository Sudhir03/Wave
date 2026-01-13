import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { Avatar, AvatarFallback, AvatarImage } from "../atoms/Avatar";
import { Spinner } from "../atoms/Spinner";
import { getAvatarGradient } from "@/lib/colorGradient";
import { getMyCallHistory } from "@/api/call";
import { CallPopover } from "../molecules/CallPopover";

/* helper */
const formatDuration = (seconds = 0) => {
  const total = Math.floor(seconds);

  const hrs = Math.floor(total / 3600);
  const mins = Math.floor((total % 3600) / 60);
  const secs = total % 60;

  // ⏱️ If 1 hour or more → hh:mm:ss
  if (hrs > 0) {
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  // ⏱️ Otherwise → mm:ss
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
};

export const CallHistoryPage = () => {
  const { id } = useParams(); // callId
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  // =========================
  // READ & NORMALIZE CACHE
  // =========================
  const cachedRaw = queryClient.getQueryData(["callHistory"]);

  const cachedCalls = Array.isArray(cachedRaw)
    ? cachedRaw
    : cachedRaw?.data ?? [];

  // =========================
  // FALLBACK FETCH (only if cache empty)
  // =========================
  const { data: fetchedCalls = [], isLoading } = useQuery({
    queryKey: ["callHistory"],
    enabled: cachedCalls.length === 0,
    queryFn: async () => {
      const token = await getToken();
      return getMyCallHistory({ token });
    },
    select: (res) => res.data, // 👈 array only
  });

  const calls = cachedCalls.length ? cachedCalls : fetchedCalls;

  // =========================
  // FIND CALL BY callId
  // =========================
  const call = calls.find((c) => c.callId === id);

  if (isLoading && cachedCalls.length === 0) {
    return (
      <div className="flex justify-center py-10">
        <Spinner />
      </div>
    );
  }

  if (!id) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground px-6">
        <p className="text-sm font-medium">Select a call to view details</p>
        <p className="text-xs mt-1">Choose a call from your call history</p>
      </div>
    );
  }

  const { otherUser } = call;

  const peer = {
    _id: call?.otherUser?._id,
    fullName:
      `${call?.otherUser?.firstName} ${call?.otherUser?.lastName}`.trim(),
    profileImageUrl: call?.otherUser?.profileImageUrl,
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="flex flex-col h-full w-full px-4 py-6 space-y-6 md:max-w-xl md:mx-auto">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col items-center text-center gap-2">
        <Avatar className="w-20 h-20">
          <AvatarImage src={otherUser.profileImageUrl} />
          <AvatarFallback className={getAvatarGradient(0)}>
            {otherUser.firstName.charAt(0)}
          </AvatarFallback>
        </Avatar>

        <h2 className="text-xl font-semibold">
          {otherUser.firstName} {otherUser.lastName}
        </h2>

        <div
          className={`text-sm font-medium ${
            call.status === "missed" ? "text-red-500" : "text-green-600"
          }`}
        >
          {call.status === "missed" ? "Missed call" : "Connected call"}
        </div>

        {/* ✅ Duration (ONLY if connected) */}
        <div className="text-xs text-muted-foreground">
          {call.status === "connected" &&
            call.duration > 0 &&
            formatDuration(call.duration)}
        </div>
      </div>

      {/* ================= ACTION BUTTONS ================= */}
      <div className="flex justify-center gap-4">
        <div className="p-1 rounded-full bg-gray-200">
          <CallPopover type="audio" peer={peer} />
        </div>
        <div className="p-1 rounded-full bg-gray-200">
          <CallPopover type="video" peer={peer} />
        </div>
      </div>

      {/* ================= DETAILS CARD ================= */}
      <div className="border rounded-xl p-4 space-y-3 bg-card">
        <DetailRow label="Call type" value={call.type} />
        <DetailRow label="Direction" value={call.direction} />

        <DetailRow
          label="Started at"
          value={new Date(call.startedAt).toLocaleString("en-US", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        />

        {call.endedAt && (
          <DetailRow
            label="Ended at"
            value={new Date(call.endedAt).toLocaleString("en-US", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          />
        )}
      </div>
    </div>
  );
};

const DetailRow = ({ label, value }) => {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="capitalize font-medium">{value}</span>
    </div>
  );
};
