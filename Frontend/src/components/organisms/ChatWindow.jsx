import { useInfiniteQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { getMyConversations } from "@/api/chat";
import { useEffect, useRef, useState } from "react";

import { NavLink, Outlet, useNavigate, useParams } from "react-router-dom";
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

import { getAvatarGradient } from "@/lib/colorGradient";
import EmptyChatScreen from "./EmptyChatScreen";
import { Spinner } from "@/components/atoms/Spinner";

/* ------------------ Helper ------------------ */
function formatTimestamp(date) {
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffMin = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHrs < 24) return `${diffHrs} hr ago`;
  if (diffDays === 1) return "Yesterday";
  return `${diffDays} days ago`;
}

/* ------------------ Component ------------------ */
export default function ChatWindow() {
  const { chatId, friendId } = useParams();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [showPinned, setShowPinned] = useState(true);
  const [showChats, setShowChats] = useState(true);
  const [pinnedUsers, setPinnedUsers] = useState([]);
  const [mutedUsers, setMutedUsers] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);

  const { getToken } = useAuth();
  const loadMoreRef = useRef(null);

  /* ------------------ Conversations Query ------------------ */
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["conversations"],
      queryFn: async ({ pageParam }) => {
        const token = await getToken();
        return getMyConversations({ pageParam, token });
      },
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      staleTime: 1000 * 60 * 2,
      cacheTime: 1000 * 60 * 10,
      refetchOnWindowFocus: false,
    });

  const chats = data?.pages.flatMap((page) => page.conversations) || [];

  /* ------------------ Infinite Scroll ------------------ */
  useEffect(() => {
    if (!hasNextPage) return;

    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && fetchNextPage(),
      { threshold: 1 }
    );

    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage]);

  /* ------------------ Filters ------------------ */
  const filteredChats = chats.filter((chat) =>
    chat.partner.fullName.toLowerCase().includes(search.toLowerCase())
  );

  const visibleChats = filteredChats.filter(
    (chat) => !blockedUsers.includes(chat.conversationId)
  );

  /* ------------------ Actions ------------------ */
  const addPin = (chat) =>
    setPinnedUsers((prev) =>
      prev.some((c) => c.conversationId === chat.conversationId)
        ? prev
        : [chat, ...prev]
    );

  const removePin = (id) =>
    setPinnedUsers((prev) => prev.filter((c) => c.conversationId !== id));

  const toggleMute = (chat) =>
    setMutedUsers((prev) =>
      prev.includes(chat.conversationId)
        ? prev.filter((id) => id !== chat.conversationId)
        : [...prev, chat.conversationId]
    );

  const toggleBlock = (chat) =>
    setBlockedUsers((prev) =>
      prev.includes(chat.conversationId)
        ? prev.filter((id) => id !== chat.conversationId)
        : [...prev, chat.conversationId]
    );

  const closeChat = () => navigate(-1);

  /* ------------------ UI ------------------ */
  return (
    <div className="flex h-full overflow-hidden">
      {/* Left Panel */}
      <div className="w-80 flex flex-col border-r-2 border-border">
        <div className="p-4">
          <Input
            placeholder="Search chats..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="p-4 flex-1 overflow-hidden">
          {/* All Chats */}
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold">
              All Chats ({visibleChats.length})
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowChats(!showChats)}
            >
              {showChats ? <ChevronUp /> : <ChevronDown />}
            </Button>
          </div>

          {showChats && (
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {isLoading && <Spinner />}

              {visibleChats.map((chat, index) => (
                <NavLink
                  key={chat.conversationId}
                  to={`/chat/${chat.conversationId}`}
                  className={({ isActive }) =>
                    `flex items-center p-3 rounded-md hover:bg-accent/10 ${
                      isActive ? "bg-accent/20" : ""
                    }`
                  }
                >
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={chat.partner.profileImageUrl} />
                    <AvatarFallback className={getAvatarGradient(index)}>
                      {chat.partner.fullName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 ml-3 min-w-0">
                    <div className="flex justify-between">
                      <span className="font-medium truncate">
                        {chat.partner.fullName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(chat.updatedAt)}
                      </span>
                    </div>
                    <span className="text-sm truncate text-muted-foreground">
                      {chat.lastMessage?.content || "No messages yet"}
                    </span>
                  </div>

                  {mutedUsers.includes(chat.conversationId) && (
                    <VolumeX className="w-4 h-4 text-primary" />
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => e.preventDefault()}
                      >
                        <MoreVertical />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() =>
                          pinnedUsers.some(
                            (c) => c.conversationId === chat.conversationId
                          )
                            ? removePin(chat.conversationId)
                            : addPin(chat)
                        }
                      >
                        {pinnedUsers.some(
                          (c) => c.conversationId === chat.conversationId
                        ) ? (
                          <>
                            <PinOff size={16} /> Unpin
                          </>
                        ) : (
                          <>
                            <Pin size={16} /> Pin
                          </>
                        )}
                      </DropdownMenuItem>

                      <DropdownMenuItem onClick={() => toggleMute(chat)}>
                        {mutedUsers.includes(chat.conversationId) ? (
                          <>
                            <Volume size={16} /> Unmute
                          </>
                        ) : (
                          <>
                            <VolumeX size={16} /> Mute
                          </>
                        )}
                      </DropdownMenuItem>

                      <DropdownMenuItem onClick={() => toggleBlock(chat)}>
                        <UserX size={16} /> Block
                      </DropdownMenuItem>

                      {chatId === chat.conversationId && (
                        <DropdownMenuItem onClick={closeChat}>
                          <X size={16} /> Close
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </NavLink>
              ))}

              {hasNextPage && (
                <div ref={loadMoreRef} className="py-4 text-center">
                  {isFetchingNextPage && <Spinner />}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1">
        {chatId || friendId ? (
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
