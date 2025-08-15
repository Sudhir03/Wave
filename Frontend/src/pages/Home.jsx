import React, { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { ChatMessage } from "@/components/molecules/ChatMessage";

export default function Home() {
  const [messages, setMessages] = useState([
    { user: "Alice", text: "Hello!" },
    { user: "Bob", text: "Hi there!" },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages([...messages, { user: "You", text: input }]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 p-6">
      {/* Chat header */}
      <header className="mb-4 text-center">
        <h1 className="text-2xl font-bold">My Chat App</h1>
      </header>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-2">
        {messages.map((msg, idx) => (
          <ChatMessage key={idx} user={msg.user} text={msg.text} />
        ))}
      </div>

      {/* Input area */}
      <div className="flex gap-2">
        <Input
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1"
        />
        <Button onClick={sendMessage}>Send</Button>
      </div>
    </div>
  );
}
