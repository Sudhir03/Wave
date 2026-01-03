// =======================
// Imports – React & Router
// =======================
import { useEffect, useRef, useState } from "react";
import {
  NavLink,
  Outlet,
  replace,
  useNavigate,
  useParams,
} from "react-router-dom";

// =======================
// Imports – Data Fetching
// =======================
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";

// =======================
// Imports – Auth & Realtime
// =======================
import { useAuth } from "@clerk/clerk-react";
import socket from "@/socket";
import { getMyConversations } from "@/api/chat";

// =======================
// Imports – UI Components
// =======================
import { Avatar, AvatarImage, AvatarFallback } from "@/components/atoms/Avatar";
import { Input } from "@/components/atoms/Input";
import { Spinner } from "@/components/atoms/Spinner";

// =======================
// Imports – Utils & Screens
// =======================
import { getAvatarGradient } from "@/lib/colorGradient";
import EmptyChatScreen from "@/components/atoms/EmptyChatScreen";
import { formatLastSeen } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { Button } from "../atoms/Button";
import {
  MoreVertical,
  Pin,
  PinOff,
  Trash2,
  Volume,
  VolumeX,
  X,
} from "lucide-react";

// =======================
// Chat Window Component
// =======================
export default function ChatWindow() {
  // =======================
  // Route Params
  // =======================
  const { chatId, friendId } = useParams();
  const navigate = useNavigate();

  // =======================
  // Local UI State
  // =======================
  const [search, setSearch] = useState("");
  const [pinnedUsers, setPinnedUsers] = useState([]);
  const [mutedUsers, setMutedUsers] = useState([]);

  // =======================
  // Auth, Query & Refs
  // =======================
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const loadMoreRef = useRef(null);

  // =======================
  // Fetch Conversations (Paginated)
  // =======================
  const { data, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery(
    {
      queryKey: ["conversations"],
      queryFn: async ({ pageParam }) => {
        const token = await getToken();
        return getMyConversations({ pageParam, token });
      },
      getNextPageParam: (last) => last.nextCursor ?? undefined,
    }
  );

  // =======================
  // Derived Chat Data
  // =======================
  const chats = data?.pages.flatMap((p) => p.conversations) || [];
  const activeChat = chats.find((c) => c.conversationId === chatId);

  // -----------------------
  // Helpers
  // -----------------------
  const isPinned = (id) => pinnedUsers.includes(id);
  const isMuted = (id) => mutedUsers.includes(id);

  const togglePin = (id) =>
    setPinnedUsers((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : [id, ...p]
    );

  const toggleMute = (id) =>
    setMutedUsers((m) =>
      m.includes(id) ? m.filter((x) => x !== id) : [...m, id]
    );

  // =======================
  // Socket Listeners (Merged)
  // - conversation_update
  // - conversation_read
  // - presence_update
  // =======================
  useEffect(() => {
    // 🔹 Update last message, time & unread count
    const handleConversationUpdate = ({
      conversationId,
      lastMessage,
      updatedAt,
      unreadCount,
    }) => {
      queryClient.setQueryData(["conversations"], (old) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            conversations: page.conversations.map((c) =>
              c.conversationId === conversationId
                ? { ...c, lastMessage, updatedAt, unreadCount }
                : c
            ),
          })),
        };
      });
    };

    // 🔹 Mark conversation as read (unread = 0)
    const handleConversationRead = ({ conversationId }) => {
      queryClient.setQueryData(["conversations"], (old) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            conversations: page.conversations.map((c) =>
              c.conversationId === conversationId ? { ...c, unreadCount: 0 } : c
            ),
          })),
        };
      });
    };

    // 🔹 Update partner online / last seen status
    const handlePresenceUpdate = ({ userId, status, lastSeen }) => {
      queryClient.setQueryData(["conversations"], (old) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            conversations: page.conversations.map((c) =>
              c.partner._id === userId
                ? {
                    ...c,
                    partner: {
                      ...c.partner,
                      isOnline: status === "online" || status === "in_chat",
                      lastSeen: lastSeen ?? c.partner.lastSeen,
                    },
                  }
                : c
            ),
          })),
        };
      });
    };

    // =======================
    // Register Socket Events
    // =======================
    socket.on("conversation_update", handleConversationUpdate);
    socket.on("conversation_read", handleConversationRead);
    socket.on("presence_update", handlePresenceUpdate);

    // =======================
    // Cleanup
    // =======================
    return () => {
      socket.off("conversation_update", handleConversationUpdate);
      socket.off("conversation_read", handleConversationRead);
      socket.off("presence_update", handlePresenceUpdate);
    };
  }, [queryClient]);

  // =======================
  // Filters + Sorting
  // =======================
  const visibleChats = chats
    .filter((c) =>
      c.partner.fullName.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  // =======================
  // UI Render
  // =======================
  return (
    <div className="flex h-full overflow-hidden">
      {/* LEFT */}
      <div className="w-80 border-r-2 border-border flex flex-col">
        {/* Search */}
        <div className="p-4">
          <Input
            placeholder="Search chats..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Pinned */}
        {pinnedUsers.length > 0 && (
          <div className="px-3 pb-1">
            <div className="text-xs font-semibold mb-2">
              Pinned ({pinnedUsers.length})
            </div>

            <div className="flex gap-3 py-2 overflow-x-auto">
              {pinnedUsers.map((id, i) => {
                const chat = chats.find((c) => c.conversationId === id);
                if (!chat) return null;

                return (
                  <div key={id} className="relative group pt-1 pr-1">
                    <NavLink
                      to={`/chat/${id}`}
                      className="flex flex-col items-center gap-1"
                    >
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={chat.partner.profileImageUrl} />
                        <AvatarFallback className={getAvatarGradient(i)}>
                          {chat.partner.fullName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs truncate max-w-[60px]">
                        {chat.partner.fullName.split(" ")[0]}
                      </span>
                    </NavLink>

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        togglePin(id);
                      }}
                      className="
                        absolute top-1 right-2
                        translate-x-1/3 -translate-y-1/3
                        h-5 w-5 rounded-full
                        bg-destructive text-white text-xs
                        flex items-center justify-center
                        opacity-0 group-hover:opacity-100
                        transition-opacity
                      "
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Chats Header */}
        {visibleChats.length > 0 && (
          <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground">
            Chats ({visibleChats.length})
          </div>
        )}

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
          {isLoading && <Spinner />}

          {!isLoading && visibleChats.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground px-6">
              <p className="text-sm font-medium mb-1">No chats yet</p>
              <p className="text-xs">Add a friend to start a conversation</p>
            </div>
          )}

          {visibleChats.map((chat, i) => (
            <NavLink
              key={chat.conversationId}
              to={`/chat/${chat.conversationId}`}
              className={({ isActive }) =>
                `flex items-center p-3 rounded-md hover:bg-accent/10 ${
                  isActive ? "bg-accent/20" : ""
                }`
              }
            >
              <Avatar>
                <AvatarImage src={chat.partner.profileImageUrl} />
                <AvatarFallback className={getAvatarGradient(i)}>
                  {chat.partner.fullName[0]}
                </AvatarFallback>
              </Avatar>

              <div className="ml-3 flex-1 min-w-0">
                <div className="flex justify-between">
                  <span className="truncate font-medium">
                    {chat.partner.fullName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {chat.lastMessage?.timestamp
                      ? formatLastSeen(chat.lastMessage.timestamp)
                      : ""}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm truncate text-muted-foreground">
                    {chat.lastMessage?.content || "No messages"}
                  </span>

                  <div className="flex items-center gap-2">
                    {isMuted(chat.conversationId) && (
                      <VolumeX className="w-4 h-4" />
                    )}
                    {chat.unreadCount > 0 && (
                      <span className="bg-green-500 text-white text-xs px-2 rounded-full">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => e.preventDefault()}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="bg-background border border-border shadow-md rounded-md p-1"
                >
                  <DropdownMenuItem
                    onClick={() => togglePin(chat.conversationId)}
                  >
                    <div className="flex items-center gap-2">
                      {isPinned(chat.conversationId) ? (
                        <>
                          <PinOff size={14} />
                          <span>Unpin</span>
                        </>
                      ) : (
                        <>
                          <Pin size={14} />
                          <span>Pin</span>
                        </>
                      )}
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => toggleMute(chat.conversationId)}
                  >
                    <div className="flex items-center gap-2">
                      {isMuted(chat.conversationId) ? (
                        <>
                          <Volume size={14} />
                          <span>Unmute</span>
                        </>
                      ) : (
                        <>
                          <VolumeX size={14} />
                          <span>Mute</span>
                        </>
                      )}
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => deleteChat(chat.conversationId)}
                  >
                    <div className="flex items-center gap-2 text-destructive">
                      <Trash2 size={14} />
                      <span>Delete</span>
                    </div>
                  </DropdownMenuItem>
                  {chatId === chat.conversationId && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.preventDefault();
                        navigate("..", { replace: true });
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <X size={14} />
                        <span>Close chat</span>
                      </div>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </NavLink>
          ))}

          {hasNextPage && (
            <div ref={loadMoreRef} className="text-center py-3">
              {isFetchingNextPage && <Spinner />}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex-1">
        {chatId || friendId ? (
          <Outlet
            context={{
              activeChat,
              pinnedUsers,
              setPinnedUsers,
              mutedUsers,
              setMutedUsers,
            }}
          />
        ) : (
          <EmptyChatScreen />
        )}
      </div>
    </div>
  );
}
