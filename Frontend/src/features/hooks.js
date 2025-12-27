import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import socket from "@/socket";
import { getMessages, sendMessage } from "@/api/chat";

/* =========================
   Helpers
========================= */
const formatLastSeen = (date) =>
  new Date(date).toLocaleString("en-US", {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

const statusRank = {
  sending: 0,
  sent: 1,
  delivered: 2,
  read: 3,
};

/* =========================================================
   Chat Detail Hook
========================================================= */
export function useChatDetail() {
  const { chatId } = useParams();

  /* =========================
     Local State
  ========================= */
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  /* =========================
     Refs
  ========================= */
  const messagesEndRef = useRef(null);
  const topRef = useRef(null);

  /* =========================
     Auth & Query
  ========================= */
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const profile = queryClient.getQueryData(["myProfile"]);
  const userId = profile?.user?._id;

  /* =====================================================
     🔥 HARD RESET cache on chat switch (CRITICAL)
  ===================================================== */
  useEffect(() => {
    if (!chatId) return;

    queryClient.removeQueries({
      queryKey: ["messages", chatId],
      exact: true,
    });
  }, [chatId]);

  /* =========================
     Messages (Infinite Query)
  ========================= */
  const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
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
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    cacheTime: 2 * 60 * 1000,
  });

  /* =========================
     Flatten Messages
  ========================= */
  const messages =
    data?.pages
      ?.flatMap((page) => page.messages)
      .sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      ) || [];

  /* =========================
     Auto Scroll
  ========================= */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* =====================================================
     🔥 JOIN / LEAVE CHAT (SEEN LOGIC)
  ===================================================== */
  useEffect(() => {
    if (!chatId || !userId) return;

    socket.emit("join_chat", { chatId, userId });

    return () => {
      socket.emit("leave_chat", { chatId, userId });
    };
  }, [chatId, userId]);

  /* =========================
     Socket: Receive Message
  ========================= */
  useEffect(() => {
    if (!chatId) return;

    const handleReceiveMessage = (data) => {
      if (data.conversationId !== chatId) return; // 🔥 isolate chat

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
          const last = pages.length - 1;
          pages[last] = {
            ...pages[last],
            messages: [...pages[last].messages, data],
          };
        }

        return { ...old, pages };
      });
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [chatId]);

  /* =========================
     Socket: Status Updates
  ========================= */
  useEffect(() => {
    if (!chatId) return;

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

    socket.on("message_status_update", handleStatusUpdate);

    return () => {
      socket.off("message_status_update", handleStatusUpdate);
    };
  }, [chatId, userId]);

  /* =========================
     Typing Indicator
  ========================= */
  useEffect(() => {
    socket.on("user_typing_start", () => setIsTyping(true));
    socket.on("user_typing_stop", () => setIsTyping(false));

    return () => {
      socket.off("user_typing_start");
      socket.off("user_typing_stop");
    };
  }, []);

  /* =========================
     Send Message (Optimistic)
  ========================= */
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

    onMutate: async ({ content, media, clientId }) => {
      await queryClient.cancelQueries(["messages", chatId]);

      const optimisticMessage = {
        _id: clientId,
        clientId,
        content,
        media,
        timestamp: new Date().toISOString(),
        sender: { _id: userId },
        status: "sending",
      };

      queryClient.setQueryData(["messages", chatId], (old) => {
        if (!old) return old;

        const pages = [...old.pages];
        const last = pages.length - 1;

        pages[last] = {
          ...pages[last],
          messages: [...pages[last].messages, optimisticMessage],
        };

        return { ...old, pages };
      });

      return { clientId };
    },

    onError: (_e, _v, ctx) => {
      queryClient.setQueryData(["messages", chatId], (old) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            messages: page.messages.map((m) =>
              m.clientId === ctx.clientId ? { ...m, status: "failed" } : m
            ),
          })),
        };
      });
    },
  });

  /* =========================
     Handlers
  ========================= */
  const handleTyping = (value) => {
    if (value.trim().length > 0) {
      socket.emit("typing_start", chatId);
    } else {
      socket.emit("typing_stop", chatId);
    }
  };

  const handleSend = (mediaFiles = []) => {
    if (!message.trim() && mediaFiles.length === 0) return;

    const clientId = `client-${Date.now()}`;
    socket.emit("typing_stop", chatId);

    sendMessageMutation.mutate({
      content: message,
      media: mediaFiles,
      clientId,
    });

    setMessage("");
  };

  /* =========================
     Expose Hook API
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

    handleTyping,
    handleSend,

    formatLastSeen,
  };
}
