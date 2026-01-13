import { Phone, Video, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/atoms/Avatar";
import { cn } from "@/lib/utils";
import { getAvatarGradient } from "@/lib/colorGradient";

// ✅ Duration formatter (mm:ss)
const formatDuration = (seconds = 0) => {
  const total = Math.floor(seconds);
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export function ContactItem({ c, index }) {
  const fullName = `${c.otherUser?.firstName ?? ""} ${
    c.otherUser?.lastName ?? ""
  }`.trim();

  const initial = fullName ? fullName.charAt(0) : "?";

  const isMissed = c.status === "missed";
  const isConnected = c.status === "connected";
  const isIncoming = c.direction === "incoming";

  return (
    <NavLink
      to={`/call/${c.callId}`}
      className={({ isActive }) =>
        cn(
          "flex items-center p-2 rounded-md gap-3",
          isActive
            ? "bg-accent/20 font-semibold"
            : "hover:bg-accent/10 transition-colors"
        )
      }
    >
      {/* Avatar */}
      <Avatar className="w-10 h-10 rounded-full">
        <AvatarImage src={c.otherUser?.profileImageUrl} />
        <AvatarFallback
          className={`flex items-center justify-center font-medium ${getAvatarGradient(
            index
          )}`}
        >
          {initial}
        </AvatarFallback>
      </Avatar>

      {/* Call info */}
      <div className="flex-1 flex justify-between items-center">
        <div className="flex flex-col">
          <div className="font-medium truncate">{fullName}</div>

          <div className="flex gap-2 items-center text-xs mt-1">
            {/* Direction Arrow */}
            {isIncoming ? (
              <ArrowDownLeft
                className={cn(
                  "w-4 h-4",
                  isMissed ? "text-red-500" : "text-green-500"
                )}
              />
            ) : (
              <ArrowUpRight
                className={cn(
                  "w-4 h-4",
                  isMissed ? "text-red-500" : "text-green-500"
                )}
              />
            )}

            {/* Status text */}
            <span
              className={cn(
                "capitalize",
                isMissed ? "text-red-500" : "text-green-500"
              )}
            >
              {isMissed ? "Missed" : "Connected"}
            </span>

            {/* Call start time (12-hour, clean) */}
            <span className="text-muted-foreground">
              {new Date(c.startedAt).toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })}
            </span>
          </div>
        </div>

        {/* Call type icon */}
        <div className="text-gray-700 font-medium">
          {c.type === "video" ? (
            <Video className="w-5 h-5 text-gray-600" />
          ) : (
            <Phone className="w-5 h-5 text-gray-600" />
          )}
        </div>
      </div>
    </NavLink>
  );
}
