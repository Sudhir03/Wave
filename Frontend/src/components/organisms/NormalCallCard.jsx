import { Avatar, AvatarImage, AvatarFallback } from "@/components/atoms/Avatar";
import { CallControls } from "@/components/molecules/CallControls";

export const NormalCallCard = ({ name, img, onEnd }) => (
  <div className="flex flex-col items-center justify-center h-full">
    <Avatar className="w-20 h-20 mb-4">
      <AvatarImage src={img} />
      <AvatarFallback>{name.charAt(0)}</AvatarFallback>
    </Avatar>
    <h2 className="text-lg font-semibold">{name}</h2>
    <p className="text-sm text-muted-foreground">Ringing...</p>
    <CallControls onEnd={onEnd} />
  </div>
);
