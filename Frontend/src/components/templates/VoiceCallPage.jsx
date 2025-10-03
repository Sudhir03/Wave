import { NormalCallCard } from "@/components/organisms/NormalCallCard";

export const VoiceCallPage = ({ contact, closeModal }) => (
  <div className="h-screen flex items-center justify-center bg-background">
    <NormalCallCard
      name={contact.name}
      img={contact.img}
      onEnd={closeModal} // pass closeModal to CallControls
    />
  </div>
);
