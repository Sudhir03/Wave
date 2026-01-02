import { MessageSquare } from "lucide-react";

export default function EmptyChatScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground select-none p-4">
      <MessageSquare className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 mb-4" />
      <h2 className="text-lg sm:text-2xl md:text-3xl font-semibold mb-2">
        Welcome to Wave
      </h2>
      <p className="text-sm sm:text-base max-w-sm mx-auto">
        Select a conversation from the left or start a new one to begin
        chatting.
      </p>
    </div>
  );
}
