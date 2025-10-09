import { useParams } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "../atoms/Avatar";
import { Phone, Video, XCircle } from "lucide-react";
import { useState } from "react";
import { getAvatarGradient } from "@/lib/colorGradient";
import { VideoCallWindow } from "../organisms/VideoCallWindow";
import { NormalCallCard } from "../organisms/NormalCallCard";

const callHistory = {
  1: [
    { type: "voice", date: "2025-09-17 14:32", duration: "5m 23s" },
    { type: "video", date: "2025-09-16 18:10", duration: "12m 45s" },
  ],
  2: [{ type: "missed", date: "2025-09-15 09:20", duration: "3m 11s" }],
  3: [],
  4: [{ type: "video", date: "2025-09-12 21:05", duration: "25m 0s" }],
};

export const CallHistoryPage = () => {
  const { id } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [callType, setCallType] = useState(null); // "voice" or "video"

  const contacts = {
    1: { name: "Alice", img: "/avatars/1.png" },
    2: { name: "Bob", img: "/avatars/2.png" },
    3: { name: "Charlie", img: "/avatars/3.png" },
    4: { name: "Diana", img: "/avatars/4.png" },
  };

  // ✅ derive index based on object keys
  const contactIds = Object.keys(contacts); // ["1","2","3","4"]
  const contactIndex = contactIds.indexOf(id); // gives proper index
  const contact = contacts[id];
  const history = callHistory[id] || [];

  if (!contact) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Select a call to see details
      </div>
    );
  }

  const openModal = (type) => {
    setCallType(type);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCallType(null);
  };

  return (
    <div className="flex flex-col h-full p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-2">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 rounded cursor-pointer">
            <AvatarImage src={contact.img} />
            <AvatarFallback
              className={`flex items-center justify-center font-medium ${getAvatarGradient(
                contactIndex
              )}`}
            >
              {contact.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-lg font-semibold">{contact.name}</h2>
        </div>

        {/* Voice & Video Buttons */}
        <div className="flex gap-2">
          <button
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 cursor-pointer"
            onClick={() => openModal("voice")}
          >
            <Phone className="w-5 h-5" />
          </button>
          <button
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 cursor-pointer"
            onClick={() => openModal("video")}
          >
            <Video className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Call History */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No calls yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {history.map((call, index) => (
              <li
                key={index}
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/10 transition-colors"
              >
                {/* Left side: icon + date */}
                <div className="flex items-center gap-2">
                  {call.type === "voice" ? (
                    <Phone className="w-5 h-5 text-green-500" />
                  ) : call.type === "video" ? (
                    <Video className="w-5 h-5 text-blue-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400" />
                  )}
                  <span className="text-sm text-muted-foreground">
                    {new Date(call.date).toLocaleString([], {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </div>

                {/* Right side: duration */}
                <span className="text-xs font-medium text-gray-500">
                  {call.duration}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modal with conditional rendering */}
      {isModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full h-full">
            {callType === "voice" && (
              <NormalCallCard
                name={contact.name}
                img={contact.img}
                onEnd={closeModal}
              />
            )}
            {callType === "video" && (
              <VideoCallWindow
                callerName="Sarah Connor"
                localVideoSrc="https://www.w3schools.com/html/mov_bbb.mp4"
                remoteVideoSrc="https://www.w3schools.com/html/movie.mp4"
                onEnd={closeModal}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
