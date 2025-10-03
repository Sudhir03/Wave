import { CallControls } from "@/components/molecules/CallControls";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/atoms/Avatar";

export const VideoCallWindow = ({ name, img, onEnd }) => (
  <div className="relative w-full h-full bg-muted flex flex-col">
    {/* Top bar */}
    <div className="flex justify-between items-center px-4 py-2 bg-card border-b border-border">
      <span className="font-medium">{name}</span>
    </div>

    {/* Remote video placeholder */}
    <div className="flex-1 bg-muted relative flex items-center justify-center">
      <span className="text-muted-foreground">Video Stream</span>

      {/* Local video (bottom-right corner) */}
      <div className="absolute bottom-4 right-4 w-32 h-24 border border-border rounded-md overflow-hidden">
        <Avatar className="w-full h-full">
          <AvatarImage src={img} />
          <AvatarFallback>{name.charAt(0)}</AvatarFallback>
        </Avatar>
      </div>
    </div>

    {/* Call controls */}
    <CallControls onEnd={onEnd} />
  </div>
);
