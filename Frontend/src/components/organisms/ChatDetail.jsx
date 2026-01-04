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
import { BellOff, Pin, PinOff, Send } from "lucide-react";

/* =========================
   Socket
========================= */
import { MessageStatus } from "../molecules/MessageStatus";
import { useOutletContext } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

export default function ChatDetail() {
  /* =========================
     CONTEXT
  ========================= */
  const { activeChat } = useOutletContext();

  const queryClient = useQueryClient();
  const conversations =
    queryClient
      .getQueryData(["conversations"])
      ?.pages.flatMap((p) => p.conversations) || [];

  const liveChat = conversations.find(
    (c) => c.conversationId === activeChat?.conversationId
  );

  const chat = liveChat?.partner || activeChat?.partner;

  /* =========================
     CHAT HOOK
  ========================= */
  const {
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
      <div className="flex items-center justify-between border-b p-2.5">
        <div className="flex items-center gap-2">
          <Avatar className="w-12 h-12">
            <AvatarImage src={chat.profileImageUrl} />
            <AvatarFallback>{chat.fullName?.charAt(0)}</AvatarFallback>
          </Avatar>

          <div className="flex flex-col">
            <span className="font-semibold truncate max-w-48">
              {chat.fullName}
            </span>
            <span className="text-sm text-accent">
              {isTyping ? (
                <span className="italic">typing...</span>
              ) : chat.isOnline ? (
                "Online"
              ) : (
                `Last seen ${formatLastSeen(chat.lastSeen)}`
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <ChatSearch messages={messages} />
          <CallPopover type="audio" />
          <CallPopover type="video" />

          <MoreOptionsPopover
            options={
              [
                // {
                //   label: pinnedUsers.some(
                //     (p) => p.conversationId === activeChat.conversationId
                //   )
                //     ? "Unpin"
                //     : "Pin",
                //   icon: {
                //     component: pinnedUsers.some(
                //       (p) => p.conversationId === activeChat.conversationId
                //     )
                //       ? PinOff
                //       : Pin,
                //   },
                //   onClick: () =>
                //     pinnedUsers.some(
                //       (p) => p.conversationId === activeChat.conversationId
                //     )
                //       ? removePin(activeChat.conversationId)
                //       : addPin(activeChat),
                // },
                // {
                //   label: mutedUsers.includes(activeChat.conversationId)
                //     ? "Unmute"
                //     : "Mute",
                //   icon: { component: BellOff },
                //   onClick: () => toggleMute(activeChat),
                // },
              ]
            }
          />
        </div>
      </div>

      {/* ================= MESSAGES ================= */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <div ref={topRef} />

        {messages.map((msg, i) => {
          const showTime =
            !messages[i + 1] ||
            formatTime(messages[i + 1].timestamp) !== formatTime(msg.timestamp);

          return (
            <div
              key={msg._id}
              className={`flex flex-col ${
                msg.sender._id === userId ? "items-end" : "items-start"
              }`}
            >
              {/* Text */}
              {msg.content && (
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg ${
                    msg.sender._id === userId
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {msg.content}
                </div>
              )}

              {/* Media */}
              {msg.media?.length > 0 && (
                <>
                  <div className="mt-1 flex gap-2 flex-wrap">
                    {msg.media
                      .filter((m) => m.type === "image" || m.type === "video")
                      .slice(0, 5)
                      .map((m, idx) =>
                        m.type === "image" ? (
                          <ImageAttachment
                            key={idx}
                            url={m.thumbnail}
                            isUploading={m.isOptimistic}
                            onClick={() => handleOpenGallery(msg.media, idx)}
                          />
                        ) : (
                          <VideoAttachment
                            key={idx}
                            thumbnail={m.thumbnail}
                            isUploading={m.isOptimistic}
                            onClick={() => handleOpenGallery(msg.media, idx)}
                          />
                        )
                      )}
                  </div>

                  <div className="mt-2 space-y-2">
                    {msg.media.map((m, idx) => {
                      if (m.type === "document")
                        return (
                          <DocumentAttachment
                            key={idx}
                            {...m}
                            isUploading={m.isOptimistic}
                          />
                        );

                      if (m.type === "audio" && m.isVoice)
                        return (
                          <VoicePlayer
                            key={idx}
                            audioSrc={m.url}
                            isUploading={m.isOptimistic}
                          />
                        );

                      if (m.type === "audio")
                        return (
                          <AudioPlayer
                            key={idx}
                            {...m}
                            isUploading={m.isOptimistic}
                            isActive={
                              activeMediaId === `audio-${msg._id}-${idx}`
                            }
                            onPlay={() =>
                              setActiveMediaId(`audio-${msg._id}-${idx}`)
                            }
                          />
                        );

                      return null;
                    })}
                  </div>
                </>
              )}

              {/* Time + Status */}
              {showTime && (
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-muted-foreground">
                    {formatTime(msg.timestamp)}
                  </span>
                  {msg.sender._id === userId && (
                    <MessageStatus status={msg.status} />
                  )}
                </div>
              )}
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* ================= INPUT ================= */}
      <div className="p-2 flex items-center gap-2">
        <MediaPickerPopover onSelect={handleSendMedia} />
        <EmojiPopover onSelect={(e) => setMessage(message + e)} />
        <VoiceMessageSender onVoiceSend={(m) => handleSendMedia([m])} />

        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onFocus={() => handleTyping("typing_start")}
          onBlur={() => handleTyping("typing_stop")}
          placeholder="Type a message..."
          className="flex-1"
        />

        <Button onClick={handleSendText} size="icon">
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
