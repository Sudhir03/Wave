import { NavLink, Outlet, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/atoms/Avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/atoms/DropdownMenu";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";
import {
  ChevronUp,
  ChevronDown,
  MoreVertical,
  X,
  PinOff,
  Pin,
  Trash2,
  UserX,
  VolumeX,
  Volume,
} from "lucide-react";

import aliceImg from "@/assets/images/alice.jpg";
import { getAvatarGradient } from "@/lib/colorGradient";
import EmptyChatScreen from "./EmptyChatScreen";

/* ------------------ Helper ------------------ */
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

/* ------------------ Component ------------------ */
export default function ChatWindow() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [showPinned, setShowPinned] = useState(true);
  const [pinnedUsers, setPinnedUsers] = useState([
    { id: 1, name: "Alice", picture: aliceImg },
    { id: 2, name: "Bob", picture: "" },
    { id: 3, name: "Charlie", picture: "" },
  ]);
  const [mutedUsers, setMutedUsers] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [showChats, setShowChats] = useState(true);
  const [chats, setChats] = useState([
    {
      id: 1,
      name: "Alice",
      picture: aliceImg,
      lastMessage: "Hey!",
      timestamp: formatTimestamp("2025-08-20T23:45:00"),
    },
    {
      id: 2,
      name: "Sudhir Sharma",
      picture: "",
      lastMessage: "Let's meet tomorrow",
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
      lastMessage: "See you soon",
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
  ]);

  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(search.toLowerCase())
  );

  const visibleChats = filteredChats.filter(
    (chat) => !blockedUsers.includes(chat.id)
  );

  const addPin = (chatToPin) => {
    setPinnedUsers((pinnedUsers) => [chatToPin, ...pinnedUsers]);
  };

  const removePin = (userId) => {
    setPinnedUsers((prev) => prev.filter((user) => user.id !== userId));
  };

  const toggleMute = (chat) => {
    setMutedUsers((prev) =>
      prev.includes(chat.id)
        ? prev.filter((id) => id !== chat.id)
        : [...prev, chat.id]
    );
  };

  const toggleBlock = (chat) => {
    setBlockedUsers((prev) => {
      if (prev.includes(chat.id)) {
        // Unblock
        return prev.filter((id) => id !== chat.id);
      } else {
        // Block → remove from pinned
        setPinnedUsers((pins) => pins.filter((user) => user.id !== chat.id));
        return [...prev, chat.id];
      }
    });
  };

  const deleteChat = (chatId) => {
    setChats((prev) => prev.filter((chat) => chat.id !== chatId));

    setPinnedUsers((prev) => prev.filter((user) => user.id !== chatId));
  };

  const closeChat = () => {
    navigate("/", { replace: true });
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left Panel */}
      <div className="w-80 h-full flex flex-col bg-background text-foreground border-r-2 border-border">
        {/* Search */}
        <div className="p-4 bg-card text-card-foreground">
          <Input
            placeholder="Search chats..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Pinned + Chats Wrapper */}
        <div className="p-4 bg-card text-card-foreground border-t-2 border-border flex-1 flex flex-col overflow-hidden">
          {/* Pinned Users */}
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold">Pinned ({pinnedUsers.length})</span>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full w-7 h-7"
              onClick={() => setShowPinned(!showPinned)}
            >
              {showPinned ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </div>

          {showPinned && (
            <div className="flex mb-4 space-x-1 overflow-x-auto flex-nowrap">
              {pinnedUsers.map((user, index) => (
                <div key={user.id} className="relative group">
                  {/* Wrap in div with relative positioning */}
                  <NavLink
                    to={`chat/${user.id}`}
                    className="flex flex-col items-center gap-1 p-1 rounded-sm transition-colors cursor-default"
                  >
                    {({ isActive }) => (
                      <div className="flex flex-col items-center gap-1">
                        <Avatar className="w-12 h-12 border border-border shadow-sm cursor-pointer">
                          <AvatarImage src={user.picture} alt={user.name} />
                          <AvatarFallback
                            className={`flex items-center justify-center font-medium ${getAvatarGradient(
                              index
                            )}`}
                          >
                            {user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>

                        <span
                          className={`text-xs truncate max-w-[60px] text-center block ${
                            isActive
                              ? "text-card-foreground border-b-2 border-accent"
                              : "text-card-foreground"
                          }`}
                        >
                          {user.name}
                        </span>
                      </div>
                    )}
                  </NavLink>
                  {/* Unpin badge - appears on hover */}
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={(e) => {
                      e.preventDefault(); // Prevent navigation
                      removePin(user.id);
                    }}
                    className="absolute top-0 right-0 h-5 w-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    title="Unpin chat"
                  >
                    <X size={12} />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* All Chats Header */}
          <div className="flex items-center justify-between mt-2 mb-2">
            <span className="font-semibold">
              All Chats ({visibleChats.length})
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full w-7 h-7"
              onClick={() => setShowChats(!showChats)}
            >
              {showChats ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Scrollable Chat List */}
          {showChats && (
            <div className="flex-1 overflow-y-auto pb-16 custom-scrollbar">
              {visibleChats.map((chat, index) => (
                <NavLink
                  key={chat.id}
                  to={`chat/${chat.id}`}
                  className={({ isActive }) =>
                    `flex items-center p-3 transition-colors rounded-md cursor-pointer hover:bg-accent/10 ${
                      isActive ? "bg-accent/20 text-accent-content" : ""
                    }`
                  }
                >
                  <Avatar className="w-12 h-12 border border-border shadow-sm">
                    <AvatarImage src={chat.picture} alt={chat.name} />
                    <AvatarFallback
                      className={`flex items-center justify-center font-medium ${getAvatarGradient(
                        index
                      )}`}
                    >
                      {chat.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex flex-col flex-1 ml-3 min-w-0">
                    <div className="flex items-center justify-between">
                      {/* <span className="font-medium">{chat.name}</span> */}
                      <span
                        className="font-medium truncate block max-w-[80px]"
                        title={chat.name}
                      >
                        {chat.name.split(" ").slice(0, 2).join(" ")}
                      </span>

                      <span className="text-xs text-muted-foreground">
                        {chat.timestamp}
                      </span>
                    </div>
                    <span className="text-sm overflow-hidden whitespace-nowrap truncate text-muted-foreground">
                      {chat.lastMessage}
                    </span>
                  </div>

                  {/* Muted Badge Icon */}
                  {mutedUsers.includes(chat.id) && (
                    <VolumeX className="w-4 h-4 text-primary" />
                  )}

                  {/* More menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full hover:bg-card 
             focus-visible:ring-0 focus-visible:outline-none 
             data-[state=open]:bg-transparent"
                        onClick={(e) => e.preventDefault()} // prevent NavLink click
                      >
                        <MoreVertical className="h-5 w-5 text-card-foreground" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                      {/* Pin/Unpin */}
                      <DropdownMenuItem
                        onClick={() => {
                          if (pinnedUsers.some((user) => user.id === chat.id)) {
                            removePin(chat.id);
                          } else {
                            addPin(chat);
                          }
                        }}
                        className="flex items-center gap-2"
                      >
                        {pinnedUsers.some((user) => user.id === chat.id) ? (
                          <>
                            <PinOff size={16} className="text-primary" />
                            <span>Unpin</span>
                          </>
                        ) : (
                          <>
                            <Pin size={16} className="text-primary" />
                            <span>Pin</span>
                          </>
                        )}
                      </DropdownMenuItem>

                      {/* Mute / Unmute */}
                      <DropdownMenuItem
                        onClick={() => toggleMute(chat)}
                        className="flex items-center gap-2"
                      >
                        {mutedUsers.includes(chat.id) ? (
                          <>
                            <Volume size={16} className="text-green-600" />
                            <span>Unmute</span>
                          </>
                        ) : (
                          <>
                            <VolumeX size={16} className="text-red-600" />
                            <span>Mute</span>
                          </>
                        )}
                      </DropdownMenuItem>

                      {/* Block (only if not already blocked) */}
                      {!blockedUsers.includes(chat.id) && (
                        <DropdownMenuItem
                          onClick={() => toggleBlock(chat)}
                          className="flex items-center gap-2"
                        >
                          <UserX size={16} className="text-red-600" />
                          <span>Block</span>
                        </DropdownMenuItem>
                      )}

                      {/* Delete */}
                      <DropdownMenuItem
                        onClick={() => deleteChat(chat.id)}
                        className="flex items-center gap-2"
                      >
                        <Trash2 size={16} className="text-destructive" />
                        <span>Delete</span>
                      </DropdownMenuItem>

                      {/* Close (only if active chat) */}
                      {chatId === String(chat.id) && (
                        <DropdownMenuItem
                          onClick={() => closeChat()}
                          className="flex items-center gap-2"
                        >
                          <X size={16} className="text-primary" />
                          <span>Close</span>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </NavLink>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1">
        {chatId ? (
          <Outlet
            context={{
              pinnedUsers,
              addPin,
              removePin,
              mutedUsers,
              toggleMute,
              blockedUsers,
              toggleBlock,
            }}
          />
        ) : (
          <EmptyChatScreen />
        )}
      </div>
    </div>
  );
}
