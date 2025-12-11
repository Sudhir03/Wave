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
    {
      _id: "5",
      name: "Ethan",
      type: "voice",
      img: "/avatars/5.png",
      callStatus: "outgoing",
      date: "2025-09-29T10:20:00",
      duration: "3m 15s",
    },
    {
      _id: "6",
      name: "Fiona",
      type: "video",
      img: "/avatars/6.png",
      callStatus: "incoming",
      date: "2025-09-28T14:50:00",
      duration: "18m 30s",
    },
    {
      _id: "7",
      name: "George",
      type: "voice",
      img: "/avatars/7.png",
      callStatus: "missed",
      date: "2025-09-27T09:10:00",
      duration: "7m 0s",
    },
    {
      _id: "8",
      name: "Hannah",
      type: "video",
      img: "/avatars/8.png",
      callStatus: "outgoing",
      date: "2025-09-26T16:40:00",
      duration: "22m 5s",
    },
    {
      _id: "9",
      name: "Ian",
      type: "voice",
      img: "/avatars/9.png",
      callStatus: "incoming",
      date: "2025-09-25T11:55:00",
      duration: "6m 50s",
    },
    {
      _id: "10",
      name: "Julia",
      type: "video",
      img: "/avatars/10.png",
      callStatus: "missed",
      date: "2025-09-24T20:30:00",
      duration: "15m 10s",
    },
    {
      _id: "11",
      name: "Kevin",
      type: "voice",
      img: "/avatars/11.png",
      callStatus: "outgoing",
      date: "2025-09-23T08:15:00",
      duration: "4m 45s",
    },
    {
      _id: "12",
      name: "Laura",
      type: "video",
      img: "/avatars/12.png",
      callStatus: "incoming",
      date: "2025-09-22T19:25:00",
      duration: "9m 20s",
    },
    {
      _id: "13",
      name: "Michael",
      type: "voice",
      img: "/avatars/13.png",
      callStatus: "missed",
      date: "2025-09-21T13:50:00",
      duration: "11m 0s",
    },
    {
      _id: "14",
      name: "Nina",
      type: "video",
      img: "/avatars/14.png",
      callStatus: "outgoing",
      date: "2025-09-20T17:05:00",
      duration: "20m 30s",
    },
    {
      _id: "15",
      name: "Oscar",
      type: "voice",
      img: "/avatars/15.png",
      callStatus: "incoming",
      date: "2025-09-19T12:40:00",
      duration: "5m 55s",
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
    <div className="flex flex-col h-full">
      {/* Top Bar */}
      <div className="flex justify-between items-center bg-card sticky top-0 z-10 py-4 px-6 border-b border-border">
        <h1 className="text-xl font-bold text-foreground">Call History</h1>
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

      <div className="flex flex-1 h-[calc(100%-72px)]">
        {/* Left Sidebar */}
        <aside className="w-80 border-r border-border flex flex-col">
          {/* Filter Nav */}
          <div className="flex justify-around border-b py-2 px-4 shrink-0 bg-card z-10">
            <button
              onClick={() => setFilter("all")}
              className={cn(
                "px-3 py-1 rounded-md text-sm border-b-2 border-transparent hover:border-primary cursor-pointer",
                filter === "all" && "border-primary text-primary"
              )}
            >
              All
            </button>
            <button
              onClick={() => setFilter("voice")}
              className={cn(
                "px-3 py-1 rounded-md text-sm border-b-2 border-transparent hover:border-primary cursor-pointer",
                filter === "voice" && "border-primary text-primary"
              )}
            >
              Voice
            </button>
            <button
              onClick={() => setFilter("video")}
              className={cn(
                "px-3 py-1 rounded-md text-sm border-b-2 border-transparent hover:border-primary cursor-pointer",
                filter === "video" && "border-primary text-primary"
              )}
            >
              Video
            </button>
          </div>

          {/* Scrollable Call History */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
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
        </aside>

        {/* Right Panel */}
        <main className="flex-1 overflow-auto py-2">
          <Outlet />
        </main>
      </div>
    </div>
  );
};