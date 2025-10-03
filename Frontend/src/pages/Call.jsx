import { Outlet } from "react-router-dom";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";
import { ContactItem } from "@/components/molecules/ContactItem";

export const Call = () => {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const calls = [
    {
      id: "1",
      name: "Alice",
      type: "voice",
      img: "/avatars/1.png",
      callStatus: "missed",
      date: "2025-09-18T14:32:00",
    },
    {
      id: "2",
      name: "Bob",
      type: "video",
      img: "/avatars/2.png",
      callStatus: "ongoing",
      date: "2025-09-18T15:10:00",
    },
    {
      id: "3",
      name: "Charlie",
      type: "voice",
      img: "/avatars/3.png",
      callStatus: "incoming",
      date: "2025-09-17T18:45:00",
    },
    {
      id: "4",
      name: "Diana",
      type: "video",
      img: "/avatars/4.png",
      callStatus: "missed",
      date: "2025-09-16T21:05:00",
    },
  ];

  const filteredCalls =
    filter === "all" ? calls : calls.filter((c) => c.type === filter);

  return (
    <div className="flex-col ">
      {/* Sidebar */}
      <div className="flex justify-between items-center bg-card sticky top-0 z-10 py-4 px-6 border-b border-border">
        {/* Title */}
        <h1 className="text-xl font-bold text-foreground">Call History</h1>

        {/* Search input with icon button */}
        <div className="flex w-full max-w-md gap-2">
          <Input
            placeholder="Search History..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
          <Button className="p-2" variant="default">
            <Search className="w-5 h-5 text-muted-foreground" />
          </Button>
        </div>
      </div>
      <div className="flex ">
        <aside className="w-72 border-r border-border  flex flex-col">
          {/* Filter Nav */}
          <div className="flex justify-around p-2">
            <button
              onClick={() => setFilter("all")}
              className={cn(
                "px-3 py-1 rounded-md text-sm border-b-2 border-transparent hover:border-primary",
                filter === "all" && "border-primary text-primary"
              )}
            >
              All
            </button>
            <button
              onClick={() => setFilter("voice")}
              className={cn(
                "px-3 py-1 rounded-md text-sm border-b-2 border-transparent hover:border-primary",
                filter === "voice" && "border-primary text-primary"
              )}
            >
              Voice
            </button>
            <button
              onClick={() => setFilter("video")}
              className={cn(
                "px-3 py-1 rounded-md text-sm border-b-2 border-transparent hover:border-primary",
                filter === "video" && "border-primary text-primary"
              )}
            >
              Video
            </button>
          </div>

          {/* Call history list */}
          <ul className="flex-1 overflow-y-auto p-4 space-y-2">
            {filteredCalls.map((c, index) => (
              <ContactItem c={c} index={index} />
            ))}
          </ul>
        </aside>

        {/* Right side */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
