import { useParams } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/atoms/Avatar";
import { useState } from "react";
import {
  Mic,
  MoreHorizontal,
  Paperclip,
  Phone,
  Search,
  Send,
  Smile,
  Video,
} from "lucide-react";
import { Input } from "../atoms/Input";
import { Button } from "../atoms/Button";

const chats = [
  {
    id: 1,
    name: "Alice",
    picture: "/alice.png",
    isOnline: true,
    lastSeen: new Date(),
  },
  {
    id: 2,
    name: "Bob",
    picture: "/bob.png",
    isOnline: false,
    lastSeen: new Date("2025-09-07T21:30:00"),
  },
  {
    id: 3,
    name: "Charlie",
    picture: "",
    isOnline: false,
    lastSeen: new Date("2025-09-06T18:15:00"),
  },
];

// Dummy messages
const initialMessages = [
  {
    id: 1,
    text: "Hey",
    sender: "other",
    timestamp: new Date("2025-09-08T09:15:05"),
  },
  {
    id: 2,
    text: "How are you?",
    sender: "other",
    timestamp: new Date("2025-09-08T09:15:40"),
  },
  {
    id: 3,
    text: "I’m good",
    sender: "me",
    timestamp: new Date("2025-09-08T09:16:10"),
  },
  {
    id: 4,
    text: "Working on project",
    sender: "me",
    timestamp: new Date("2025-09-08T09:16:55"),
  },
  {
    id: 5,
    text: "Nice, keep me posted",
    sender: "other",
    timestamp: new Date("2025-09-08T09:18:20"),
  },
];

const formatTime = (date) =>
  date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export default function ChatDetail() {
  const { chatId } = useParams();
  const chat = chats.find((c) => c.id.toString() === chatId);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(initialMessages);

  const handleSend = () => {
    if (!message.trim()) return;
    setMessages([
      ...messages,
      { id: Date.now(), text: message, sender: "me", timestamp: new Date() },
    ]);
    setMessage("");
  };

  const formatLastSeen = (date) => {
    return date.toLocaleString("en-US", {
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!chat) {
    return <div className="p-4">Chat not found</div>;
  }

  return (
    <div className="h-full flex flex-col pb-1">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-border p-2.5">
        <div className="flex items-center gap-2">
          <Avatar className="w-12 h-12">
            <AvatarImage src={chat.picture} alt={chat.name} />
            <AvatarFallback className="bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white font-medium">
              {chat.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col leading-tight">
            <span className="font-semibold text-foreground max-w-48 truncate">
              {chat.name}
            </span>
            <span className="text-sm text-muted-foreground">
              {chat.isOnline
                ? "Online"
                : `Last seen ${formatLastSeen(chat.lastSeen)}`}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-foreground">
          <Search className="w-5 h-5 cursor-pointer" />
          <Phone className="w-5 h-5 cursor-pointer" />
          <Video className="w-5 h-5 cursor-pointer" />
          <MoreHorizontal className="w-5 h-5 cursor-pointer" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 bg-background overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {messages.map((msg, i) => {
          const isLastInMinute =
            !messages[i + 1] ||
            formatTime(messages[i + 1].timestamp) !== formatTime(msg.timestamp);

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.sender === "me" ? "items-end" : "items-start"
              }`}
            >
              {/* bubble */}
              <div
                className={`relative max-w-xs px-3 py-2 rounded-lg ${
                  msg.sender === "me"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                {msg.text}

                {/* incoming bubble ke andar right-bottom time */}
                {msg.sender === "other" && isLastInMinute && (
                  <span className="absolute -bottom-5 right-0 text-xs text-muted-foreground">
                    {formatTime(msg.timestamp)}
                  </span>
                )}
              </div>

              {/* outgoing ke liye time bubble ke niche */}
              {msg.sender === "me" && isLastInMinute && (
                <span className="text-xs text-muted-foreground mt-1 self-end">
                  {formatTime(msg.timestamp)}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Panel */}
      <div className="p-2 flex items-center gap-2">
        {/* Attach */}
        <button className="p-2 text-muted-foreground hover:text-foreground cursor-pointer">
          <Paperclip className="w-5 h-5" />
        </button>

        {/* Emoji */}
        <button className="p-2 text-muted-foreground hover:text-foreground cursor-pointer">
          <Smile className="w-5 h-5" />
        </button>

        {/* Mic */}
        <button className="p-2 text-muted-foreground hover:text-foreground cursor-pointer">
          <Mic className="w-5 h-5" />
        </button>

        {/* Input */}
        <Input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1"
        />

        {/* Send */}
        <Button
          onClick={handleSend}
          size="icon"
          className="rounded-full cursor-pointer"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
