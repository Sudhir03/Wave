import { useParams } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/atoms/Avatar";
import { useState } from "react";

const chats = [
  { id: 1, name: "Alice", picture: "/alice.png" },
  { id: 2, name: "Bob", picture: "/bob.png" },
  { id: 3, name: "Charlie", picture: "" },
];

export default function ChatDetail() {
  const { chatId } = useParams();
  const chat = chats.find((c) => c.id.toString() === chatId);
  const [message, setMessage] = useState("");

  if (!chat)
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        Chat not found
      </div>
    );

  const handleSend = () => {
    if (!message) return;
    console.log("Send message:", message);
    setMessage("");
  };

  return (
    <div className="h-full flex flex-col p-6">
      {/* Chat Header */}
      <div className="flex items-center gap-4 border-b border-border pb-4 mb-4">
        <Avatar className="w-12 h-12">
          <AvatarImage src={chat.picture} alt={chat.name} />
          <AvatarFallback>{chat.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <span className="font-semibold text-foreground">{chat.name}</span>
      </div>

      {/* Chat Messages Placeholder */}
      <div className="flex-1 bg-background rounded-md p-4 overflow-y-auto">
        <p className="text-muted-foreground">
          This is a temporary chat area for <strong>{chat.name}</strong>.
        </p>
      </div>

      {/* Input Field */}
      <div className="mt-4 flex gap-2">
        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 px-4 py-2 rounded-md border border-input bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
        />
        <button
          onClick={handleSend}
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
}
