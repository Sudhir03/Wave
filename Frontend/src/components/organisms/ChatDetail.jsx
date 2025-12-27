/* =========================
hooks
========================= */
import { useChatDetail } from "@/features/hooks";

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
import { formatLastSeen } from "@/lib/utils";

/* =========================
   Icons
========================= */
import { BellOff, Pin, PinOff, Send, UserX } from "lucide-react";

/* =========================
   Socket
========================= */
import socket from "@/socket";
import { MessageStatus } from "../molecules/MessageStatus";
import { useOutletContext } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

export default function ChatDetail() {
  /* =========================
     GET REAL CHAT DATA
  ========================= */
  const {
    activeChat,
    pinnedUsers,
    addPin,
    removePin,
    mutedUsers,
    toggleMute,
    blockedUsers,
    toggleBlock,
  } = useOutletContext();

  const queryClient = useQueryClient();
  const conversations =
    queryClient
      .getQueryData(["conversations"])
      ?.pages.flatMap((p) => p.conversations) || [];

  const liveChat = conversations.find(
    (c) => c.conversationId === activeChat?.conversationId
  );

  const chat = liveChat?.partner || activeChat?.partner;

  const {
    chatId,
    userId,

    message,
    setMessage,
    isTyping,

    messages,
    messagesEndRef,
    topRef,

    // 🔥 gallery state
    isGalleryOpen,
    setIsGalleryOpen,
    galleryMedia,
    galleryStartIndex,

    handleTyping,
    handleSendText,
    handleSendMedia,
    handleOpenGallery,
  } = useChatDetail();

  if (!chat) return null;

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="h-full flex flex-col pb-1">
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between border-b-2 border-border p-2.5">
        <div className="flex items-center gap-2">
          <Avatar className="w-12 h-12">
            <AvatarImage src={chat.profileImageUrl} alt={chat.fullName} />
            <AvatarFallback className="bg-linear-to-r from-fuchsia-500 to-purple-600 text-white font-medium">
              {chat.fullName.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col leading-tight">
            <span className="font-semibold text-foreground max-w-48 truncate">
              {chat.fullName}
            </span>

            <span className="text-sm text-secondary">
              {isTyping ? (
                <span className="italic text-primary">typing...</span>
              ) : chat.isOnline ? (
                "Online"
              ) : (
                `Last seen ${formatLastSeen(chat.lastSeen)}`
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
                label: pinnedUsers.some(
                  (p) => p.conversationId === activeChat.conversationId
                )
                  ? "Unpin"
                  : "Pin",
                icon: {
                  component: pinnedUsers.some(
                    (p) => p.conversationId === activeChat.conversationId
                  )
                    ? PinOff
                    : Pin,
                },
                onClick: () => {
                  if (
                    pinnedUsers.some(
                      (p) => p.conversationId === activeChat.conversationId
                    )
                  ) {
                    removePin(activeChat.conversationId);
                  } else {
                    addPin(activeChat);
                  }
                },
              },
              {
                label: mutedUsers.includes(activeChat.conversationId)
                  ? "Unmute"
                  : "Mute",
                icon: { component: BellOff },
                onClick: () => toggleMute(activeChat),
              },
              {
                label: blockedUsers.includes(activeChat.conversationId)
                  ? "Unblock"
                  : "Block",
                icon: { component: UserX, props: { color: "red" } },
                onClick: () => toggleBlock(activeChat),
              },
            ]}
          />
        </div>
      </div>

      {/* ================= MESSAGES ================= */}
      <div className="flex-1 bg-background overflow-y-auto p-4 space-y-2 custom-scrollbar">
        <div ref={topRef} />

        {messages.map((msg, i) => (
          <div
            key={msg._id}
            className={`flex flex-col ${
              msg.sender._id === userId ? "items-end" : "items-start"
            } space-y-1`}
          >
            {msg.content && (
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

            <div
              className={`flex items-center gap-1 ${
                msg.sender._id === userId ? "justify-end" : "justify-start"
              }`}
            >
              <span className="text-xs text-muted-foreground">
                {formatTime(msg.timestamp)}
              </span>
              {msg.sender._id === userId && (
                <MessageStatus status={msg.status} />
              )}
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* ================= INPUT ================= */}
      <div className="p-2 flex items-center gap-2">
        <MediaPickerPopover onSelect={(files) => handleSend(files)} />
        <EmojiPopover onSelect={(emoji) => setMessage(message + emoji)} />
        <VoiceMessageSender onVoiceSend={(m) => handleSend([m])} />

        <Input
          placeholder="Type a message..."
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            handleTyping(e.target.value);
          }}
          onBlur={() => socket.emit("typing_stop", { chatId, userId })}
          className="flex-1"
        />

        <Button onClick={() => handleSend()} size="icon">
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
