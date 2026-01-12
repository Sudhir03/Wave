import { MessageSquare } from "lucide-react";

export default function EmptyChatScreen() {
  return (
    <div className="hidden md:flex h-full w-full flex-1 items-center justify-center">
      <div className="flex flex-col items-center text-center text-muted-foreground select-none p-4">
        <MessageSquare className="w-28 h-28 md:w-32 md:h-32 mb-4" />

        <h2 className="text-2xl md:text-3xl font-semibold mb-2">
          Welcome to Wave
        </h2>

        <p className="text-base max-w-sm">
          Select a conversation from the left or start a new one to begin
          chatting.
        </p>
      </div>
    </div>
  );
}
