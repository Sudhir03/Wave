import { useState } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Search } from "lucide-react";

export function ChatSearch({ messages = [] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  // Filter only if user types something
  const filtered = query
    ? messages.filter(
        (m) => m.text && m.text.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const handleSelect = (msg) => {
    // Close search popover
    setOpen(false);
    setQuery("");

    // Scroll to message in chat
    const el = document.getElementById(`message-${msg.id}`);
    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost">
          <Search className="w-5 h-5" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-72 sm:w-96 max-h-80 flex flex-col p-2">
        {/* Search input */}
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search messages"
          className="mb-2"
        />

        {/* Results / placeholder */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {query && filtered.length === 0 && (
            <div className="text-center text-gray-500 text-sm py-4">
              No results
            </div>
          )}

          {!query && (
            <div className="text-center text-gray-400 text-sm py-4">
              Start typing to search messages
            </div>
          )}

          {filtered.map((msg) => (
            <button
              key={msg.id}
              onClick={() => handleSelect(msg)}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 text-sm"
            >
              <div className="truncate">{msg.text}</div>
              <div className="text-xs text-gray-500">
                {new Date(msg.timestamp).toLocaleString()}
              </div>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
