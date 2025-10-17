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
      _id: "1",
      name: "Alice",
      type: "voice",
      img: "/avatars/1.png",
      callStatus: "missed",
      date: "2025-10-03T14:32:00",
      duration: "5m 23s",
    },
    {
      _id: "2",
      name: "Bob",
      type: "video",
      img: "/avatars/2.png",
      callStatus: "ongoing",
      date: "2025-10-03T15:10:00",
      duration: "12m 45s",
    },
    {
      _id: "3",
      name: "Charlie",
      type: "voice",
      img: "/avatars/3.png",
      callStatus: "incoming",
      date: "2025-10-02T18:45:00",
      duration: "8m 10s",
    },
    {
      _id: "4",
      name: "Diana",
      type: "video",
      img: "/avatars/4.png",
      callStatus: "missed",
      date: "2025-09-30T21:05:00",
      duration: "25m 0s",
    },
  ];

  // Filter by type
  const filteredCalls =
    filter === "all" ? calls : calls.filter((c) => c.type === filter);

  // Filter by search
  const searchedCalls = filteredCalls.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  // ✅ Group calls by day with Today/Yesterday
  const groupCallsByDay = (calls) => {
    return calls.reduce((acc, call) => {
      const date = new Date(call.date);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      let dayLabel;
      if (date.toDateString() === today.toDateString()) {
        dayLabel = "Today";
      } else if (date.toDateString() === yesterday.toDateString()) {
        dayLabel = "Yesterday";
      } else {
        dayLabel = date.toLocaleDateString([], {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      }

      if (!acc[dayLabel]) acc[dayLabel] = [];
      acc[dayLabel].push(call);
      return acc;
    }, {});
  };

  const groupedCalls = groupCallsByDay(
    searchedCalls.sort((a, b) => new Date(b.date) - new Date(a.date))
  );

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left Panel */}
      <div className="w-80 h-full flex flex-col bg-background text-foreground border-r-2 border-border">
        {/* Search */}
        <div className="p-4 bg-card text-card-foreground">
          <Input
            placeholder="Search calls..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Calls History */}
        <div className="p-4 bg-card text-card-foreground border-t-2 border-border flex-1 flex flex-col overflow-hidden">
          {/* Filter Nav */}
          <div className="flex items-center justify-evenly mb-2">
            <Button
              onClick={() => setFilter("all")}
              className={`${
                filter === "all" ? "" : "bg-card text-card-foreground"
              }`}
            >
              All
            </Button>
            <Button
              onClick={() => setFilter("voice")}
              className={`${
                filter === "voice" ? " " : "bg-card text-card-foreground"
              }`}
            >
              Voice
            </Button>
            <Button
              onClick={() => setFilter("video")}
              className={`${
                filter === "video" ? " " : "bg-card text-card-foreground"
              }`}
            >
              Video
            </Button>
          </div>

          {/* Call history grouped by day */}
          {Object.entries(groupedCalls).map(([day, calls]) => (
            <div key={day} className="py-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                {day}
              </h3>
              <ul className="space-y-2">
                {calls.map((c, index) => (
                  <ContactItem key={c._id} c={c} index={index} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <main className="flex-1 overflow-auto py-2">
        <Outlet />
      </main>
    </div>
  );
};
