import { useState } from "react";
import { useParams } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/atoms/Avatar";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";
import { EmojiPopover } from "@/components/molecules/EmojiPopover";
import { MediaPickerPopover } from "@/components/molecules/MediaPickerPopover";
import {
  Mic,
  MoreHorizontal,
  Phone,
  Play,
  Search,
  Send,
  Video,
} from "lucide-react";
import { MediaGallery } from "@/components/organisms/MediaGallery";

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
  const { chatId } = useParams(); // replace with router param if using Next.js
  const chat = chats.find((c) => c.id.toString() === chatId);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(initialMessages);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryMedia, setGalleryMedia] = useState([]);
  const [galleryStartIndex, setGalleryStartIndex] = useState(0);

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
            <AvatarFallback className="bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white font-medium">
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
        <div className="flex items-center gap-3 text-foreground">
          <Search className="w-5 h-5 cursor-pointer" />
          <Phone className="w-5 h-5 cursor-pointer" />
          <Video className="w-5 h-5 cursor-pointer" />
          <MoreHorizontal className="w-5 h-5 cursor-pointer" />
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
              className={`flex flex-col ${
                msg.sender === "me" ? "items-end" : "items-start"
              } space-y-1`}
            >
              {/* Message text */}
              <div
                className={`max-w-xs px-3 py-2 rounded-lg ${
                  msg.sender === "me"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                {msg.text}
              </div>

              {/* Media */}
              {msg.media && msg.media.length > 0 && (
                <div className="mt-1 flex gap-2">
                  {(() => {
                    const visible = msg.media.slice(0, 5);
                    const remaining = msg.media.length - visible.length;

                    return visible.map((m, idx) => (
                      <div
                        key={idx}
                        className="relative w-16 h-16 rounded overflow-hidden flex items-center justify-center
                   bg-[theme('colors.bg')] dark:bg-[theme('colors.bg-dark')] cursor-pointer"
                        onClick={() => handleOpenGallery(msg.media, idx)} // open at clicked media
                      >
                        {m.type === "image" && (
                          <img
                            src={m.url}
                            alt="Shared Image"
                            className="w-full h-full object-cover rounded"
                          />
                        )}

                        {m.type === "video" && (
                          <div
                            className="relative w-full h-full cursor-pointer"
                            onClick={() => handleOpenGallery(msg.media, idx)}
                          >
                            <img
                              src={m.poster}
                              alt="Video thumbnail"
                              className="w-full h-full object-cover rounded"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Play className="w-5 h-5 text-white opacity-80 pointer-events-none" />
                            </div>
                          </div>
                        )}

                        {/* +X more */}
                        {idx === visible.length - 1 && remaining > 0 && (
                          <div
                            className="absolute inset-0 flex items-center justify-center rounded
               bg-muted text-muted-foreground text-sm font-medium cursor-pointer"
                            onClick={() =>
                              handleOpenGallery(msg.media, visible.length)
                            } // dynamic
                          >
                            +{remaining}
                          </div>
                        )}
                      </div>
                    ));
                  })()}
                </div>
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
      </div>

      {/* Bottom panel */}
      <div className="p-2 flex items-center gap-2">
        <MediaPickerPopover onSelect={(mediaFiles) => handleSend(mediaFiles)} />
        <EmojiPopover onSelect={(emoji) => setMessage(message + emoji)} />
        <button className="p-2 text-muted-foreground hover:text-foreground cursor-pointer">
          <Mic className="w-5 h-5" />
        </button>
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
