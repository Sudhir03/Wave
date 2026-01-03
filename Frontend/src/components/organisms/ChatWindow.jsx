// =======================
// Imports – React & Router
// =======================
import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useParams } from "react-router-dom";

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
import EmptyChatScreen from "./EmptyChatScreen";
import { formatLastSeen } from "@/lib/utils";

// =======================
// Chat Window Component
// =======================
export default function ChatWindow() {
  // =======================
  // Route Params
  // =======================
  const { chatId, friendId } = useParams();

  // =======================
  // Local UI State
  // =======================
  const [search, setSearch] = useState("");
  const [pinnedUsers, setPinnedUsers] = useState([]);
  const [mutedUsers, setMutedUsers] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);

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
    .filter((c) => !blockedUsers.includes(c.conversationId))
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  // =======================
  // UI Render
  // =======================
  return (
    <div className="flex h-full overflow-hidden">
      {/* Left Panel */}
      <div className="w-80 border-r-2 border-border flex flex-col">
        <div className="p-4">
          <Input
            placeholder="Search chats..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
          {isLoading && <Spinner />}

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

                  {chat.unreadCount > 0 && (
                    <span className="bg-green-500 text-white text-xs px-2 rounded-full">
                      {chat.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </NavLink>
          ))}

          {hasNextPage && (
            <div ref={loadMoreRef} className="text-center py-3">
              {isFetchingNextPage && <Spinner />}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1">
        {chatId || friendId ? (
          <Outlet
            context={{
              activeChat,
              pinnedUsers,
              setPinnedUsers,
              mutedUsers,
              setMutedUsers,
              blockedUsers,
              setBlockedUsers,
            }}
          />
        ) : (
          <EmptyChatScreen />
        )}
      </div>
    </div>
  );
}
