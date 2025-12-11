import { Avatar, AvatarImage, AvatarFallback } from "@/components/atoms/Avatar";
import { Phone, Video } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { getAvatarGradient } from "@/lib/colorGradient";

export function ContactItem({ c, index }) {
  const navigate = useNavigate();
  return (
    <NavLink
      to={`/call/${c._id}`}
      // onClick={(e) => {
      //   e.preventDefault();
      //   navigate(`/calls/${c._id}`, { replace: true });
      // }}
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
      <Avatar className="w-10 h-10 rounded cursor-pointer">
        <AvatarImage src={c.img} />
        <AvatarFallback
          className={`flex items-center justify-center font-medium ${getAvatarGradient(
            index
          )}`}
        >
          {c.name.charAt(0)}
        </AvatarFallback>
      </Avatar>

      {/* Call info */}
      <div className="flex-1 flex justify-between items-center">
        <div className="flex flex-col">
          <div className="font-medium">{c.name}</div>
          <div className="flex gap-2 items-center text-xs text-muted-foreground w-full mt-1">
            {/* Call status */}
            <div>
              {c.callStatus === "missed" && (
                <p className="text-red-500 capitalize">Missed</p>
              )}
              {c.callStatus === "ongoing" && (
                <p className="text-green-500 capitalize">Ongoing</p>
              )}
              {c.callStatus === "incoming" && (
                <p className="text-blue-500 capitalize">Incoming</p>
              )}
            </div>

            {/* Call time */}
            <span>
              {new Date(c.date).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>

        {/* Call type */}
        <div className="text-gray-700 font-medium">
          {c.type === "voice" ? (
            <Phone className="w-5 h-5 text-gray-600" />
          ) : (
            <Video className="w-5 h-5 text-gray-600" />
          )}
        </div>
      </div>
    </NavLink>
  );
}
