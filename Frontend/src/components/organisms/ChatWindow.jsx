import { Link, Outlet, useParams } from "react-router-dom";
import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/atoms/Avatar";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";
import { ChevronUp, ChevronDown } from "lucide-react";

import aliceImg from "@/assets/images/alice.jpg";

function formatTimestamp(date) {
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHrs = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffSec < 60) return `${diffSec} sec ago`;
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHrs < 24) return `${diffHrs} hr ago`;
  if (diffDays === 1) return `Yesterday`;
  return `${diffDays} days ago`;
}

const pinnedUsers = [
  {
    id: 1,
    name: "Alice",
    picture: aliceImg,
  },
  { id: 2, name: "Bob", picture: "" },
  { id: 3, name: "Charlie", picture: "" },
];

const chats = [
  {
    id: 1,
    name: "Alice",
    picture: aliceImg,
    lastMessage: "Hey!",
    timestamp: formatTimestamp("2025-08-20T23:45:00"),
  },
  {
    id: 2,
    name: "Bob",
    picture: "",
    lastMessage:
      "Let's meet. vcxfd fdfdfff gfggfgfdgg gfffffgfgfd ggffgfdggfgf",
    timestamp: formatTimestamp("2025-08-20T19:20:00"),
  },
  {
    id: 3,
    name: "Charlie",
    picture: "",
    lastMessage: "Got it",
    timestamp: formatTimestamp("2025-08-20T06:30:00"),
  },
  {
    id: 4,
    name: "David",
    picture: "",
    lastMessage: "See you",
    timestamp: formatTimestamp("2025-08-19T12:00:00"),
  },
  {
    id: 5,
    name: "Eve",
    picture: "",
    lastMessage: "Thanks!",
    timestamp: formatTimestamp("2025-08-18T15:45:00"),
  },
  {
    id: 6,
    name: "Frank",
    picture: "",
    lastMessage: "OK",
    timestamp: formatTimestamp("2025-08-18T11:15:00"),
  },
  {
    id: 7,
    name: "Grace",
    picture: "",
    lastMessage: "Sure",
    timestamp: formatTimestamp("2025-08-17T20:00:00"),
  },
  {
    id: 8,
    name: "Heidi",
    picture: "",
    lastMessage: "No problem",
    timestamp: formatTimestamp("2025-08-17T08:30:00"),
  },
  {
    id: 9,
    name: "Ivan",
    picture: "",
    lastMessage: "Let's go",
    timestamp: formatTimestamp("2025-08-16T14:50:00"),
  },
  {
    id: 10,
    name: "Judy",
    picture: "",
    lastMessage: "Gotcha",
    timestamp: formatTimestamp("2025-08-16T09:10:00"),
  },
  {
    id: 11,
    name: "Karl",
    picture: "",
    lastMessage: "Fine",
    timestamp: formatTimestamp("2025-08-15T18:25:00"),
  },
  {
    id: 12,
    name: "Leo",
    picture: "",
    lastMessage: "Thanks",
    timestamp: formatTimestamp("2025-08-15T11:40:00"),
  },
  {
    id: 13,
    name: "Mallory",
    picture: "",
    lastMessage: "Cool",
    timestamp: formatTimestamp("2025-08-14T16:30:00"),
  },
  {
    id: 14,
    name: "Nina",
    picture: "",
    lastMessage: "See you soon",
    timestamp: formatTimestamp("2025-08-14T08:10:00"),
  },
  {
    id: 15,
    name: "Oscar",
    picture: "",
    lastMessage: "Alright",
    timestamp: formatTimestamp("2025-08-13T22:50:00"),
  },
];

const avatarGradients = [
  "bg-gradient-to-r from-pink-500 to-red-500 text-white",
  "bg-gradient-to-r from-indigo-500 to-blue-500 text-white",
  "bg-gradient-to-r from-green-400 to-emerald-600 text-white",
  "bg-gradient-to-r from-purple-500 to-pink-600 text-white",
  "bg-gradient-to-r from-orange-400 to-red-500 text-white",
  "bg-gradient-to-r from-teal-400 to-cyan-500 text-white",
  "bg-gradient-to-r from-amber-500 to-yellow-400 text-black",
  "bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white",
  "bg-gradient-to-r from-lime-400 to-green-600 text-black",
];

function getAvatarGradient(id) {
  return avatarGradients[id % avatarGradients.length];
}

export default function ChatWindow() {
  const [search, setSearch] = useState("");
  const [showPinned, setShowPinned] = useState(true);
  const [showChats, setShowChats] = useState(true);
  const { chatId: activeChatId } = useParams();

  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-full overflow-hidden shadow">
      {/* Left Panel */}
      <div className="w-80 flex flex-col gap-0.5 bg-background text-foreground shadow">
        <div className="p-4 shadow bg-card text-card-foreground">
          <Input
            placeholder="Search chats..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="h-screen p-4 shadow bg-card text-card-foreground">
          {/* Pinned Header */}
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-card-foreground">
              Pinned ({pinnedUsers.length})
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-background hover:text-foreground w-7 h-7"
              onClick={() => setShowPinned(!showPinned)}
            >
              {showPinned ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Pinned Users */}
          {showPinned && (
            <div className="flex mb-4 space-x-3 overflow-x-auto">
              {pinnedUsers.map((user) => (
                <div key={user.id} className="flex flex-col items-center">
                  <Avatar className="w-12 h-12">
                    {console.log(user.picture)}
                    <AvatarImage src={user.picture} alt={user.name} />
                    <AvatarFallback className={getAvatarGradient(user.id)}>
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="mt-1 text-xs text-muted-foreground">
                    {user.name}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* All Chats Header */}
          <div className="flex items-center justify-between mt-2 mb-2">
            <span className="font-semibold text-foreground">
              All Chats {filteredChats.length}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-background hover:text-foreground w-7 h-7"
              onClick={() => setShowChats(!showChats)}
            >
              {showChats ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Chat List */}
          {showChats && (
            <div className="flex-1 h-screen overflow-y-auto">
              {filteredChats.map((chat) => {
                const isActive = String(chat.id) === activeChatId;
                return (
                  <Link
                    key={chat.id}
                    to={`chat/${chat.id}`}
                    className="flex items-center p-3 transition-colors rounded-md cursor-pointer hover:bg-accent/10 last:mb-60"
                  >
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={chat.picture} alt={chat.name} />
                      <AvatarFallback className={getAvatarGradient(chat.id)}>
                        {chat.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex flex-col flex-1 ml-3 min-w-0">
                      {/* Name + Timestamp */}
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground">
                          {chat.name}
                        </span>
                        <span
                          className={`text-xs ${
                            isActive ? "text-primary" : "text-muted-foreground"
                          }`}
                        >
                          {chat.timestamp}
                        </span>
                      </div>
                      {/* Last message */}
                      <span
                        className={`text-sm overflow-hidden whitespace-nowrap truncate ${
                          isActive ? "text-primary" : "text-muted-foreground"
                        }`}
                      >
                        {chat.lastMessage}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}
