import { useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
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

/* =========================================================
   Chat Detail Hook
========================================================= */
export function useChatDetail() {
  const { chatId } = useParams();
  const location = useLocation();

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
    staleTime: Infinity,
    cacheTime: 0, // 5 minutes
  });

  /* =========================
     Flatten Messages
  ========================= */
  const messages =
    data?.pages
      .flatMap((page) => page.messages)
      .sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      ) || [];

  /* =========================
     Typing Indicator (Receive only)
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
     Auto Scroll
  ========================= */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* =========================
     Socket: Join & Receive
  ========================= */
  useEffect(() => {
    if (!chatId || !userId) return;
    const handleReceiveMessage = (data) => {
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
                status: data.status || m.status, // 🔥 keep best status
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

    socket.emit("join_chat", {
      chatId,
      userId,
    });

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.emit("leave_chat", {
        chatId,
        userId,
      });

      socket.off("receive_message", handleReceiveMessage);
    };
  }, [chatId, userId]);

  useEffect(() => {
    const handleStatusUpdate = ({ messageIds, status }) => {
      queryClient.setQueryData(["messages", chatId], (old) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            messages: page.messages.map((m) =>
              messageIds.includes(m._id) && m.sender._id === userId
                ? { ...m, status }
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
  }, [chatId]);

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

    // IMPORTANT: socket is the source of truth
    onSuccess: () => {},

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

  // typing stub (safe)
  const handleTyping = () => {};

  const handleSend = (mediaFiles = []) => {
    if (!message.trim() && mediaFiles.length === 0) return;

    const clientId = `client-${Date.now()}`;

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
