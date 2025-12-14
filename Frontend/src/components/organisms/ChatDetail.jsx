/* =========================
   React & Router Imports
========================= */
import { useEffect, useRef, useState } from "react";
import { useOutletContext, useParams } from "react-router-dom";

/* =========================
   UI Components
========================= */
import { Avatar, AvatarImage, AvatarFallback } from "@/components/atoms/Avatar";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";

/* =========================
   Feature Components
========================= */
import { EmojiPopover } from "@/components/molecules/EmojiPopover";
import { MediaPickerPopover } from "@/components/molecules/MediaPickerPopover";
import { MediaGallery } from "@/components/organisms/MediaGallery";
import { ImageAttachment } from "@/components/molecules/media/ImageAttachment";
import { VideoAttachment } from "@/components/molecules/media/VideoAttachment";
import { DocumentAttachment } from "@/components/molecules/media/DocumentAttachment";
import { AudioPlayer } from "@/components/molecules/media/AudioPlayer";
import { VoicePlayer } from "@/components/molecules/media/VoicePlayer";
import { VoiceMessageSender } from "@/components/molecules/VoiceMessageSender";
import { ChatSearch } from "@/components/molecules/ChatSearch";
import { MoreOptionsPopover } from "@/components/molecules/MoreOptionsPopover";
import { CallPopover } from "@/components/molecules/CallPopover";

/* =========================
   Icons
========================= */
import { BellOff, Pin, PinOff, Send, UserX } from "lucide-react";

/* =========================
   Data & State Management
========================= */
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { getMessages, sendMessage } from "@/api/chat";

/* =========================
   Socket
========================= */
import socket from "@/socket";

/* =========================
   Helpers
========================= */
const formatTime = (date) =>
  new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

/* =========================================================
   Chat Detail Component
========================================================= */
export default function ChatDetail() {
  /* =========================
     Route & Context
  ========================= */
  const { chatId } = useParams();

  const {
    pinnedUsers,
    addPin,
    removePin,
    mutedUsers,
    toggleMute,
    blockedUsers,
    toggleBlock,
  } = useOutletContext();

  /* =========================
     Static Chat (Mock)
  ========================= */
  const chat = {
    _id: 1,
    name: "Alice",
    picture: "/alice.png",
    isOnline: true,
    lastSeen: new Date(),
  };

  /* =========================
     Local State
  ========================= */
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryMedia, setGalleryMedia] = useState([]);
  const [galleryStartIndex, setGalleryStartIndex] = useState(0);
  const [activeMediaId, setActiveMediaId] = useState(null);

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
     Messages Query (Infinite)
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

    staleTime: 30 * 1000,
    cacheTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  /* =========================
     Flatten Messages
  ========================= */
  const messages =
    data?.pages.flatMap((page) =>
      page.messages.map((m) => ({
        ...m,
        id: m._id,
      }))
    ) || [];

  /* =========================
     Socket: Typing Indicator
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
     Infinite Scroll (Top)
  ========================= */
  useEffect(() => {
    if (!hasNextPage || !topRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && fetchNextPage(),
      { threshold: 1 }
    );

    observer.observe(topRef.current);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage]);

  /* =========================
     Auto Scroll to Bottom
  ========================= */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* =========================
     Socket: Join & Receive Messages
  ========================= */
  useEffect(() => {
    if (!chatId) return;

    socket.emit("join_chat", chatId);

    socket.on("receive_message", (data) => {
      if (data.sender?._id === userId) return;

      queryClient.setQueryData(["messages", chatId], (old) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page, idx) =>
            idx === old.pages.length - 1
              ? {
                  ...page,
                  messages: page.messages.some((m) => m._id === data._id)
                    ? page.messages
                    : [...page.messages, data],
                }
              : page
          ),
        };
      });
    });

    return () => {
      socket.emit("leave_chat", chatId);
      socket.off("receive_message");
    };
  }, [chatId, queryClient, userId]);

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

  const handleOpenGallery = (msgMedia, startIndex = 0) => {
    setGalleryMedia(
      msgMedia.map((m, i) => ({
        id: i,
        type: m.type,
        src: m.url,
        thumbnail: m.poster || m.url,
      }))
    );
    setGalleryStartIndex(startIndex);
    setIsGalleryOpen(true);
  };

  /* =========================
     sending
  ========================= */

  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, media }) => {
      const token = await getToken();

      return sendMessage({
        token,
        conversationId: chatId,
        content,
        media,
      });
    },

    onSuccess: (data) => {
      const savedMessage = {
        ...data.sentMessage,
        sender: {
          _id: userId,
          profileImageUrl: profile?.user?.profileImageUrl,
        },
      };

      queryClient.setQueryData(["messages", chatId], (old) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page, idx) =>
            idx === old.pages.length - 1
              ? {
                  ...page,
                  messages: [...page.messages, savedMessage],
                }
              : page
          ),
        };
      });
    },
  });

  const handleSend = (mediaFiles = []) => {
    if (!message.trim() && mediaFiles.length === 0) return;

    socket.emit("typing_stop", chatId);

    sendMessageMutation.mutate({
      content: message,
      media: mediaFiles,
    });

    setMessage("");
  };

  const formatLastSeen = (date) =>
    date.toLocaleString("en-US", {
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="h-full flex flex-col pb-1">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-border p-2.5">
        <div className="flex items-center gap-2">
          <Avatar className="w-12 h-12">
            <AvatarImage src={chat?.picture} alt={chat?.name} />
            <AvatarFallback className="bg-linear-to-r from-fuchsia-500 to-purple-600 text-white font-medium">
              {chat?.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col leading-tight">
            <span className="font-semibold text-foreground max-w-48 truncate">
              {chat?.name}
            </span>
            <span className="text-sm text-secondary">
              {isTyping ? (
                <span className="italic text-primary">typing...</span>
              ) : chat?.isOnline ? (
                "Online"
              ) : (
                `Last seen ${formatLastSeen(chat?.lastSeen)}`
              )}
            </span>
          </div>
        </div>
        <div className="flex items-center text-foreground">
          <ChatSearch messages={messages} />

          <CallPopover type="audio" />

          <CallPopover type="video" />

          <MoreOptionsPopover
            options={[
              {
                label: pinnedUsers.some((u) => u.id === chat._id)
                  ? "Unpin"
                  : "Pin",
                icon: {
                  component: pinnedUsers.some((u) => u.id === chat._id)
                    ? PinOff
                    : Pin,
                },
                onClick: () => {
                  if (pinnedUsers.some((u) => u.id === chat._id))
                    removePin(chat._id);
                  else
                    addPin({
                      id: chat._id,
                      name: chat.name,
                      picture: chat.picture,
                    });
                },
              },
              {
                label: mutedUsers.includes(chat._id) ? "Unmute" : "Mute",
                icon: { component: BellOff },
                onClick: () => toggleMute(chat),
              },
              {
                label: blockedUsers.includes(chat._id) ? "Unblock" : "Block",
                icon: { component: UserX, props: { color: "red" } },
                onClick: () => toggleBlock(chat),
              },
            ]}
          />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 bg-background overflow-y-auto p-4 space-y-2 custom-scrollbar">
        <div ref={topRef} />
        {messages.map((msg, i) => {
          const isLastInMinute =
            !messages[i + 1] ||
            formatTime(messages[i + 1].timestamp) !== formatTime(msg.timestamp);

          return (
            <div
              key={i}
              id={`message-${msg._id}`}
              className={`flex flex-col ${
                msg.sender._id === userId ? "items-end" : "items-start"
              } space-y-1`}
            >
              {/* Message text */}
              {msg?.content && (
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg ${
                    msg.sender._id === userId
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {msg.content}
                </div>
              )}

              {/* Media */}
              {msg.media && msg.media.length > 0 && (
                <>
                  {/* Images + Videos (grid style) */}
                  <div className="mt-1 flex gap-2 flex-wrap">
                    {msg.media
                      .filter((m) => m.type === "image" || m.type === "video")
                      .slice(0, 5)
                      .map((m, idx, arr) => {
                        const remaining =
                          msg.media.filter(
                            (x) => x.type === "image" || x.type === "video"
                          ).length - arr.length;

                        if (m.type === "image") {
                          return (
                            <ImageAttachment
                              key={idx}
                              url={m.url}
                              onClick={() => handleOpenGallery(msg.media, idx)}
                              showRemaining={
                                idx === arr.length - 1 && remaining > 0
                              }
                              remaining={remaining}
                            />
                          );
                        }

                        if (m.type === "video") {
                          return (
                            <VideoAttachment
                              key={idx}
                              poster={m.poster}
                              onClick={() => handleOpenGallery(msg.media, idx)}
                              showRemaining={
                                idx === arr.length - 1 && remaining > 0
                              }
                              remaining={remaining}
                            />
                          );
                        }

                        return null;
                      })}
                  </div>

                  {/* Docs / Audio / Voice (list style) */}
                  <div className="mt-2 flex flex-col gap-2">
                    {msg.media
                      .filter(
                        (m) =>
                          m.type === "document" ||
                          m.type === "audio" ||
                          m.type === "voice"
                      )
                      .map((m, idx) => {
                        if (m.type === "document") {
                          console.log(m);

                          return (
                            <DocumentAttachment
                              key={idx}
                              fileName={m.fileName}
                              fileSize={m.fileSize}
                              url={m.url}
                            />
                          );
                        }

                        if (m.type === "audio") {
                          console.log(m);

                          return (
                            <AudioPlayer
                              key={idx}
                              fileName={m.fileName}
                              fileSize={m.fileSize}
                              audioUrl={m.url}
                              isActive={
                                activeMediaId === `audio-${msg._id}-${idx}`
                              }
                              onPlay={() =>
                                setActiveMediaId(`audio-${msg._id}-${idx}`)
                              }
                              onMenuClick={() =>
                                console.log("Audio menu clicked")
                              }
                            />
                          );
                        }

                        if (m.type === "voice") {
                          return <VoicePlayer key={idx} audioSrc={m.url} />;
                        }

                        return null;
                      })}
                  </div>
                </>
              )}

              {/* Timestamp */}
              {isLastInMinute && (
                <div
                  className={`text-xs text-muted-foreground mt-1 ${
                    msg.sender._id === userId ? "text-right" : "text-left"
                  }`}
                >
                  {formatTime(msg.timestamp)}
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
        {/* Spacer element at the bottom to scroll into view */}
      </div>

      {/* Bottom panel */}
      <div className="p-2 flex items-center gap-2">
        <MediaPickerPopover onSelect={(mediaFiles) => handleSend(mediaFiles)} />
        <EmojiPopover onSelect={(emoji) => setMessage(message + emoji)} />
        <VoiceMessageSender
          onVoiceSend={(mediaItem) => handleSend([mediaItem])}
        />
        <Input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => {
            const value = e.target.value;
            setMessage(value);
            handleTyping(value);
          }}
          onBlur={() => socket.emit("typing_stop", chatId)}
          className="flex-1"
        />

        <Button
          onClick={() => handleSend()}
          size="icon"
          className="rounded-full cursor-pointer bg-accent text-accent-foreground hover:bg-accent/90"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
      {isGalleryOpen && (
        <MediaGallery
          media={galleryMedia}
          initialIndex={galleryStartIndex}
          isOpen={isGalleryOpen}
          setIsOpen={setIsGalleryOpen}
        />
      )}
    </div>
  );
}
