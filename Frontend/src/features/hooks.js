// =======================
// Imports – React & Router
// =======================
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

// =======================
// Imports – React Query
// =======================
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

// =======================
// Imports – Auth & Realtime
// =======================
import { useAuth } from "@clerk/clerk-react";
import socket from "@/socket";
import { getMessages, sendTextMessage, sendMediaMessage } from "@/api/chat";

// =======================
// Message Status Priority
// =======================
const statusRank = {
  sending: 0,
  sent: 1,
  delivered: 2,
  read: 3,
};

/* =========================================================
   Hook
export function useChatDetail() {
  // =======================
  // Route Params
  // =======================
  const { chatId } = useParams();

  // =======================
  // Local State
  // =======================
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // =======================
  // Refs
  // =======================
  const messagesEndRef = useRef(null);
  const topRef = useRef(null);

  // =======================
  // Auth & Query Setup
  // =======================
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const profile = queryClient.getQueryData(["myProfile"]);
  const userId = profile?.user?._id;

  // =======================
  // Reset State on Chat Change
  // =======================
  useEffect(() => {
    if (!chatId) return;

    setMessage("");
    socket.emit("typing_stop", { chatId, userId });
  }, [chatId, userId]);

  // =======================
  // Fetch Messages (Paginated)
  // =======================
  /* =========================
     Reset cache on chat switch
  ========================= */
  useEffect(() => {
    if (!chatId) return;
    queryClient.removeQueries({ queryKey: ["messages", chatId], exact: true });
  }, [chatId]);

  /* =========================
     Messages
  ========================= */
  const { data } = useInfiniteQuery({
    queryKey: ["messages", chatId],
    enabled: !!chatId,
    queryFn: async ({ pageParam }) => {
      const token = await getToken();
      return getMessages({
        conversationId: chatId,
        cursor: pageParam,
        token,
      });
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  // =======================
  // Normalize & Sort Messages
  // =======================
  const messages =
    data?.pages
      ?.flatMap((p) => p.messages)
      .sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      ) || [];

  // =======================
  // Auto Scroll to Bottom
  // =======================
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* =========================
     Join / Leave chat
  ========================= */
  useEffect(() => {
    if (!chatId || !userId) return;

    socket.emit("join_chat", { chatId, userId });
    return () => socket.emit("leave_chat", { chatId, userId });
  }, [chatId, userId]);

  // =======================
  // Socket Listeners (Merged)
  // - receive_message
  // - message_status_update
  // - typing indicators
  // =======================
  /* =========================
     Receive message
  ========================= */
  useEffect(() => {
    if (!chatId) return;

    // 🔹 Receive new or optimistic-confirmed messages
    const handleReceiveMessage = (data) => {
      if (data.conversationId !== chatId) return;

      queryClient.setQueryData(["messages", chatId], (old) => {
        if (!old) return old;

        let replaced = false;

        const pages = old.pages.map((page) => ({
          ...page,
          messages: page.messages.map((m) => {
            if (m.clientId && m.clientId === data.clientId) {
              replaced = true;
              return {
                ...m,
                ...data,
                status:
                  statusRank[data.status] > statusRank[m.status]
                    ? data.status
                    : m.status,
              };
            }
            return m;
          }),
        }));

        if (!replaced) {
          pages[pages.length - 1].messages.push(data);
        }

        return { ...old, pages };
      });
    };

    // 🔹 Update delivery / read status
    const handleStatusUpdate = ({ messageIds, status }) => {
      queryClient.setQueryData(["messages", chatId], (old) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            messages: page.messages.map((m) =>
              messageIds.includes(m._id) && m.sender._id === userId
                ? {
                    ...m,
                    status:
                      statusRank[status] > statusRank[m.status]
                        ? status
                        : m.status,
                  }
                : m
            ),
          })),
        };
      });
    };

    // 🔹 Typing indicators
    const handleTypingStart = ({ userId: typingUser }) => {
      if (typingUser !== userId) setIsTyping(true);
    };

    const handleTypingStop = ({ userId: stoppedUser }) => {
      if (stoppedUser !== userId) setIsTyping(false);
    };

    // =======================
    // Register Socket Events
    // =======================
    socket.on("receive_message", handleReceiveMessage);
    socket.on("message_status_update", handleStatusUpdate);
    socket.on("user_typing_start", handleTypingStart);
    socket.on("user_typing_stop", handleTypingStop);

    // =======================
    // Cleanup
    // =======================
    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("message_status_update", handleStatusUpdate);
      socket.off("user_typing_start", handleTypingStart);
      socket.off("user_typing_stop", handleTypingStop);
    };
  }, [chatId, userId, queryClient]);

  // =======================
  // Emit Typing Events
  // =======================
  const handleTyping = (value) => {
    if (!chatId) return;

    if (value.trim().length > 0) {
      socket.emit("typing_start", { chatId, userId });
    } else {
      socket.emit("typing_stop", { chatId, userId });
    }
  };

  // =======================
  // Send Message Mutation
  // =======================
  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, media, clientId }) => {
      const token = await getToken();
      return sendMessage({
        token,
        conversationId: chatId,
        content,
        media,
        clientId,
      });
    },
  });

  // =======================
  // Handle Send (Optimistic UI)
  // =======================
  const handleSend = (mediaFiles = []) => {
    if (!message.trim() && mediaFiles.length === 0) return;

    socket.emit("typing_stop", { chatId, userId });

    const clientId = `client-${Date.now()}`;

    const optimisticMessage = {
      _id: clientId,
      clientId,
      content: message,
      sender: { _id: userId },
      status: "sending",
      timestamp: new Date().toISOString(),
    };

    queryClient.setQueryData(["messages", chatId], (old) => {
      if (!old) return old;

      return {
        ...old,
        pages: old.pages.map((p, i) =>
          i === old.pages.length - 1
            ? { ...p, messages: [...p.messages, optimisticMessage] }
            : p
        ),
      };
    });

  const handleSendMedia = (mediaItems) => {
    if (!mediaItems?.length) return;

    const clientId = `m-${Date.now()}`;

    sendMediaMutation.mutate({
      clientId,
      files: mediaItems.map((m) => m.file),
    });
  };

  const handleOpenGallery = (media, index) => {
    setGalleryMedia(media);
    setGalleryStartIndex(index);
    setIsGalleryOpen(true);
  };

  /* =========================
     Expose API
  ========================= */
  return {
    chatId,
    userId,
    message,
    setMessage,
    isTyping,
    messages,
    messagesEndRef,
    topRef,

    // gallery
    isGalleryOpen,
    setIsGalleryOpen,
    galleryMedia,
    galleryStartIndex,
    activeMediaId,
    setActiveMediaId,

    handleTyping,
    handleSendText,
    handleSendMedia,
    handleOpenGallery,

    formatLastSeen,
  };
}
