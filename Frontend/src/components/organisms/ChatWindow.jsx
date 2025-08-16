import { Outlet } from "react-router-dom";
import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/atoms/Avatar";
import { Input } from "@/components/atoms/Input";
import { ChevronUp, ChevronDown } from "lucide-react";

const pinnedUsers = [
  { id: 1, name: "Alice", picture: "/alice.png" },
  { id: 2, name: "Bob", picture: "/bob.png" },
  { id: 3, name: "Charlie", picture: "" },
];

const chats = [
  {
    id: 1,
    name: "Alice",
    picture: "/alice.png",
    lastMessage: "Hey, how are you?",
    timestamp: "10:45 AM",
  },
  {
    id: 2,
    name: "Bob",
    picture: "/bob.png",
    lastMessage: "Let's meet tomorrow",
    timestamp: "Yesterday",
  },
  {
    id: 3,
    name: "Charlie",
    picture: "",
    lastMessage: "Got it, thanks!",
    timestamp: "2 days ago",
  },
];

export default function ChatWindow() {
  const [search, setSearch] = useState("");
  const [showPinned, setShowPinned] = useState(true);
  const [showChats, setShowChats] = useState(true);

  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-full">
      {/* Left Panel */}
      <div className="w-80 flex flex-col border-r border-border p-4">
        <Input
          placeholder="Search chats..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4"
        />

        {/* Pinned Header */}
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-foreground">
            Pinned ({pinnedUsers.length})
          </span>
          <button
            onClick={() => setShowPinned(!showPinned)}
            className="p-1 rounded hover:bg-accent/20 transition-colors"
          >
            {showPinned ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Pinned Users */}
        {showPinned && (
          <div className="mb-4 flex space-x-4 overflow-x-auto">
            {pinnedUsers.map((user) => (
              <div key={user.id} className="flex flex-col items-center">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={user.picture} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-xs mt-1 text-muted-foreground">
                  {user.name}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* All Chats Header */}
        <div className="flex items-center justify-between mb-2 mt-2">
          <span className="font-semibold text-foreground">
            All Chats ({filteredChats.length})
          </span>
          <button
            onClick={() => setShowChats(!showChats)}
            className="p-1 rounded hover:bg-accent/20 transition-colors"
          >
            {showChats ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Chat List */}
        {showChats && (
          <div className="flex-1 overflow-y-auto">
            {filteredChats.map((chat) => (
              <a
                key={chat.id}
                href={`chat/${chat.id}`}
                className="flex items-center justify-between p-3 rounded-md hover:bg-accent/10 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={chat.picture} alt={chat.name} />
                    <AvatarFallback>{chat.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">
                      {chat.name}
                    </span>
                    <span className="text-sm text-muted-foreground truncate max-w-xs">
                      {chat.lastMessage}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {chat.timestamp}
                </span>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Right Panel */}
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}
