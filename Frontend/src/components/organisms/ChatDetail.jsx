import { useOutletContext } from "react-router-dom";

/* =========================
   hooks
========================= */
import { useChatDetail } from "@/features/hooks";

/* =========================
   UI Components
========================= */
import { Avatar, AvatarImage, AvatarFallback } from "@/components/atoms/Avatar";
import { Textarea } from "@/components/atoms/Textarea";
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
import { MoreOptionsPopover } from "@/components/molecules/MoreOptionsPopover";
import { CallPopover } from "@/components/molecules/CallPopover";
import { MessageStatus } from "@/components/molecules/MessageStatus";
import { formatLastSeen } from "@/lib/utils";

/* =========================
   Icons
========================= */
import { Grip, Send } from "lucide-react";

import { useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";

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
      <div className="flex items-center border-b p-2.5 gap-2">
        {/* LEFT SECTION — priority */}
        <div className="flex items-center gap-2 flex-1 overflow-hidden">
          <Avatar className="w-10 h-10 shrink-0">
            <AvatarImage src={chat.profileImageUrl} />
            <AvatarFallback>{chat.fullName?.charAt(0)}</AvatarFallback>
          </Avatar>

          <div className="flex flex-col">
            <span className="font-semibold whitespace-nowrap">
              {chat.fullName}
            </span>

            <span className="text-sm text-accent whitespace-nowrap">
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

        {/* RIGHT SECTION — can shrink */}
        <div className="flex items-center gap-0 shrink">
          <CallPopover type="audio" peer={chat} />
          <CallPopover type="video" peer={chat} />
          <MoreOptionsPopover options={[]} />
        </div>
      </div>

      {/* ================= MESSAGES ================= */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-3">
        <div ref={topRef} />

        {messages.map((msg, i) => {
          return (
            <div
              key={msg._id}
              className={`flex flex-col ${
                msg.sender._id === userId ? "items-end" : "items-start"
              }`}
            >
              {/* TEXT */}
              {msg.content && (
                <div
                  className={`relative max-w-[65%] sm:max-w-[85%] md:max-w-xs lg:max-w-sm px-3 sm:px-4 py-2 text-sm sm:text-base rounded-2xl break-all  whitespace-pre-wrap leading-relaxed transition-all duration-200 ease-out
                  ${
                    msg.sender._id === userId
                      ? "bg-primary text-primary-foreground ml-auto"
                      : "bg-muted mr-auto"
                  }`}
                >
                  {msg.content}
                </div>
              )}

              {/* MEDIA */}
              {msg.media?.length > 0 && (
                <>
                  <div
                    className={`mt-1 flex flex-wrap gap-1 sm:gap-2 max-w-fit ${
                      msg.sender._id === userId
                        ? "self-end justify-end"
                        : "self-start justify-start"
                    }`}
                  >
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

                  <div className="mt-2 space-y-3">
                    {msg.media.map((m, idx) => {
                      if (m.type === "document")
                        return (
                          <DocumentAttachment
                            key={idx}
                            {...m}
                            isMine={msg.sender._id === userId}
                            isUploading={m.isOptimistic}
                          />
                        );

                      if (m.type === "audio" && m.isVoice)
                        return (
                          <VoicePlayer
                            key={idx}
                            audioSrc={m.url}
                            isMine={msg.sender._id === userId}
                            isUploading={m.isOptimistic}
                          />
                        );

                      if (m.type === "audio")
                        return (
                          <AudioPlayer
                            key={idx}
                            {...m}
                            audioUrl={m.url}
                            isUploading={m.isOptimistic}
                            isActive={
                              activeMediaId === `audio-${msg._id}-${idx}`
                            }
                            isMine={msg.sender._id === userId}
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

              {/* TIME + STATUS */}
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs text-muted-foreground">
                  {formatTime(msg.timestamp)}
                </span>
                {msg.sender._id === userId && (
                  <MessageStatus status={msg.status} />
                )}
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* ================= INPUT ================= */}
      {/* ================= INPUT ================= */}
      <div className="px-2 sm:px-12 py-2 mb-4 sm:mb-6 flex gap-2 items-end">
        {/* LEFT ICONS — DESKTOP */}
        <div className="hidden sm:flex items-end gap-1 sm:gap-2 shrink-0">
          <MediaPickerPopover onSelect={handleSendMedia} />
          <EmojiPopover onSelect={(e) => setMessage(message + e)} />
          <VoiceMessageSender onVoiceSend={(m) => handleSendMedia([m])} />
        </div>

        {/* LEFT ICONS — MOBILE */}
        <div className="flex sm:hidden items-end shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="h-11 w-11">
                <Grip className="!w-7 !h-7" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="start"
              side="top"
              className="bg-background border border-border rounded-md p-2 flex gap-2"
            >
              <MediaPickerPopover onSelect={handleSendMedia} />
              <EmojiPopover onSelect={(e) => setMessage(message + e)} />
              <VoiceMessageSender onVoiceSend={(m) => handleSendMedia([m])} />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* TEXTAREA */}
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onFocus={() => handleTyping("typing_start")}
          onBlur={() => handleTyping("typing_stop")}
          placeholder="Type a message..."
          rows={1}
          className="flex-1 resize-none overflow-y-auto max-h-24 min-h-10 leading-5 text-sm sm:text-base break-all whitespace-pre-wrap border border-border focus:border-border focus-visible:ring-0 focus-visible:outline-none shadow-none custom-scrollbar"
        />

        {/* SEND BUTTON */}
        <div className="flex items-end shrink-0">
          <Button
            onClick={handleSendText}
            size="icon"
            className="h-10 w-10 sm:h-10 sm:w-10"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
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
