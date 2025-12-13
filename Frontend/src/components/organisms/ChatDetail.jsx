import { useEffect, useRef, useState } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/atoms/Avatar";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";
import { EmojiPopover } from "@/components/molecules/EmojiPopover";
import { MediaPickerPopover } from "@/components/molecules/MediaPickerPopover";
import { BellOff, Pin, PinOff, Send, UserX } from "lucide-react";
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

// Sample chat list
const chats = [
  {
    id: 1,
    name: "Alice",
    picture: "/alice.png",
    isOnline: true,
    lastSeen: new Date(),
  },
  {
    id: 2,
    name: "Bob",
    picture: "/bob.png",
    isOnline: false,
    lastSeen: new Date("2025-09-07T21:30:00"),
  },
  {
    id: 3,
    name: "Charlie",
    picture: "",
    isOnline: false,
    lastSeen: new Date("2025-09-06T18:15:00"),
  },
];

// Initial messages
const initialMessages = [
  {
    id: 1,
    text: "Hey",
    sender: "other",
    timestamp: new Date("2025-09-08T09:15:05"),
    media: [],
  },
  {
    id: 2,
    text: "Check out these files",
    sender: "other",
    timestamp: new Date("2025-09-08T09:15:40"),
    media: [
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1538998073820-4dfa76300194?q=80&w=300",
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1538998073820-4dfa76300194?q=80&w=300",
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1538998073820-4dfa76300194?q=80&w=300",
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1538998073820-4dfa76300194?q=80&w=300",
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1538998073820-4dfa76300194?q=80&w=300",
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1538998073820-4dfa76300194?q=80&w=300",
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1538998073820-4dfa76300194?q=80&w=300",
      },
    ],
  },
  {
    id: 3,
    text: "I’m good, thanks!",
    sender: "me",
    timestamp: new Date("2025-09-08T09:16:10"),
    media: [
      {
        type: "video",
        url: "https://www.w3schools.com/html/mov_bbb.mp4",
        poster:
          "https://peach.blender.org/wp-content/uploads/title_anouncement.jpg",
      },
      {
        type: "video",
        url: "https://www.w3schools.com/html/mov_bbb.mp4",
        poster:
          "https://peach.blender.org/wp-content/uploads/title_anouncement.jpg",
      },
      {
        type: "video",
        url: "https://www.w3schools.com/html/mov_bbb.mp4",
        poster:
          "https://peach.blender.org/wp-content/uploads/title_anouncement.jpg",
      },
      {
        type: "video",
        url: "https://www.w3schools.com/html/mov_bbb.mp4",
        poster:
          "https://peach.blender.org/wp-content/uploads/title_anouncement.jpg",
      },
      {
        type: "video",
        url: "https://www.w3schools.com/html/mov_bbb.mp4",
        poster:
          "https://peach.blender.org/wp-content/uploads/title_anouncement.jpg",
      },
      {
        type: "video",
        url: "https://www.w3schools.com/html/mov_bbb.mp4",
        poster:
          "https://peach.blender.org/wp-content/uploads/title_anouncement.jpg",
      },
    ],
  },
  {
    id: 4,
    text: "Check out these files",
    sender: "other",
    timestamp: new Date("2025-09-08T09:15:40"),
    media: [
      {
        type: "video",
        url: "https://www.w3schools.com/html/mov_bbb.mp4",
        poster:
          "https://peach.blender.org/wp-content/uploads/title_anouncement.jpg",
      },
      {
        type: "video",
        url: "https://www.w3schools.com/html/mov_bbb.mp4",
        poster:
          "https://peach.blender.org/wp-content/uploads/title_anouncement.jpg",
      },
      {
        type: "video",
        url: "https://www.w3schools.com/html/mov_bbb.mp4",
        poster:
          "https://peach.blender.org/wp-content/uploads/title_anouncement.jpg",
      },
      {
        type: "video",
        url: "https://www.w3schools.com/html/mov_bbb.mp4",
        poster:
          "https://peach.blender.org/wp-content/uploads/title_anouncement.jpg",
      },
      {
        type: "video",
        url: "https://www.w3schools.com/html/mov_bbb.mp4",
        poster:
          "https://peach.blender.org/wp-content/uploads/title_anouncement.jpg",
      },
      {
        type: "video",
        url: "https://www.w3schools.com/html/mov_bbb.mp4",
        poster:
          "https://peach.blender.org/wp-content/uploads/title_anouncement.jpg",
      },
    ],
  },
  {
    id: 5,
    text: "I’m good, thanks!",
    sender: "me",
    timestamp: new Date("2025-09-08T09:16:10"),
    media: [
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1538998073820-4dfa76300194?q=80&w=300",
      },
    ],
  },
];

const formatTime = (date) =>
  date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export default function ChatDetail() {
  const { chatId, friendId } = useParams();

  const {
    pinnedUsers,
    addPin,
    removePin,
    mutedUsers,
    toggleMute,
    blockedUsers,
    toggleBlock,
  } = useOutletContext();

  const chat = chats.find((c) => c.id.toString() === chatId);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(initialMessages);

  const messagesEndRef = useRef(null);

  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryMedia, setGalleryMedia] = useState([]);
  const [galleryStartIndex, setGalleryStartIndex] = useState(0);

  const [activeMediaId, setActiveMediaId] = useState(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleOpenGallery = (msgMedia, startIndex = 0) => {
    const formattedMedia = msgMedia.map((m, i) => ({
      id: i,
      type: m.type,
      src: m.url,
      thumbnail: m.poster || m.url,
    }));

    setGalleryMedia(formattedMedia);
    setGalleryStartIndex(startIndex);
    setIsGalleryOpen(true);
  };

  const handleSend = (mediaFiles = []) => {
    if (!message.trim() && mediaFiles.length === 0) return;

    setMessages([
      ...messages,
      {
        id: Date.now(),
        text: message,
        sender: "me",
        timestamp: new Date(),
        media: mediaFiles,
      },
    ]);
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
            <AvatarImage src={chat.picture} alt={chat.name} />
            <AvatarFallback className="bg-linear-to-r from-fuchsia-500 to-purple-600 text-white font-medium">
              {chat.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col leading-tight">
            <span className="font-semibold text-foreground max-w-48 truncate">
              {chat.name}
            </span>
            <span className="text-sm text-secondary">
              {chat.isOnline
                ? "Online"
                : `Last seen ${formatLastSeen(chat.lastSeen)}`}
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
                label: pinnedUsers.some((u) => u.id === chat.id)
                  ? "Unpin"
                  : "Pin",
                icon: {
                  component: pinnedUsers.some((u) => u.id === chat.id)
                    ? PinOff
                    : Pin,
                },
                onClick: () => {
                  if (pinnedUsers.some((u) => u.id === chat.id))
                    removePin(chat.id);
                  else
                    addPin({
                      id: chat.id,
                      name: chat.name,
                      picture: chat.picture,
                    });
                },
              },
              {
                label: mutedUsers.includes(chat.id) ? "Unmute" : "Mute",
                icon: { component: BellOff },
                onClick: () => toggleMute(chat),
              },
              {
                label: blockedUsers.includes(chat.id) ? "Unblock" : "Block",
                icon: { component: UserX, props: { color: "red" } },
                onClick: () => toggleBlock(chat),
              },
            ]}
          />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 bg-background overflow-y-auto p-4 space-y-2 custom-scrollbar">
        {messages.map((msg, i) => {
          const isLastInMinute =
            !messages[i + 1] ||
            formatTime(messages[i + 1].timestamp) !== formatTime(msg.timestamp);

          return (
            <div
              key={msg.id}
              id={`message-${msg.id}`}
              className={`flex flex-col ${
                msg.sender === "me" ? "items-end" : "items-start"
              } space-y-1`}
            >
              {/* Message text */}
              {msg?.text && (
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg ${
                    msg.sender === "me"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {msg.text}
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
                                activeMediaId === `audio-${msg.id}-${idx}`
                              }
                              onPlay={() =>
                                setActiveMediaId(`audio-${msg.id}-${idx}`)
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
                    msg.sender === "me" ? "text-right" : "text-left"
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
          onChange={(e) => setMessage(e.target.value)}
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
