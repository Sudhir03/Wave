import { useState } from "react";
import { Phone, Video } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { VideoCallWindow } from "@/components/organisms/VideoCallWindow";
import { NormalCallCard } from "@/components/organisms/NormalCallCard";

export const CallPopover = ({ type }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isAudio = type === "audio";
  const Icon = isAudio ? Phone : Video;

  const openCall = () => setIsOpen(true);
  const closeCall = () => setIsOpen(false);

  return (
    <>
      {/* Trigger button */}
      <Button variant="ghost" onClick={openCall}>
        <Icon className="w-5 h-5" />
      </Button>

      {/* Fullscreen modal */}
      {isOpen && (
        <div className="fixed inset-0 w-full h-full bg-black/90 z-50 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center">
            {isAudio ? (
              <NormalCallCard
                name="Alice"
                img="https://www.pexels.com/photo/person-in-blue-denim-jacket-sitting-on-chair-while-writing-39866/"
                onEnd={closeCall}
              />
            ) : (
              <VideoCallWindow
                callerName="Sarah Connor"
                localVideoSrc="https://www.w3schools.com/html/mov_bbb.mp4"
                remoteVideoSrc="https://www.w3schools.com/html/movie.mp4"
                onEnd={closeCall}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
};
