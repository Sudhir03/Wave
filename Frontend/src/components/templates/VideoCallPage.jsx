import { VideoCallWindow } from "@/components/organisms/VideoCallWindow";

export const VideoCallPage = ({ contact, closeModal }) => (
  <div className="h-screen w-screen bg-background">
    <VideoCallWindow
      name={contact.name}
      img={contact.img}
      onEnd={closeModal} // pass closeModal to CallControls
    />
  </div>
);
