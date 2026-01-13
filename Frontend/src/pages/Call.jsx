import { Outlet, useParams } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";

import { getMyCallHistory } from "@/api/call";
import { Input } from "@/components/atoms/Input";
import { ContactItem } from "@/components/molecules/ContactItem";
import { Spinner } from "@/components/atoms/Spinner";

export const Call = () => {
  const { getToken } = useAuth();
  const { id } = useParams(); // 👈 selected callId
  const [search, setSearch] = useState("");

  // =======================
  // Fetch call history
  // =======================
  const { data: calls = [], isLoading } = useQuery({
    queryKey: ["callHistory"],
    queryFn: async () => {
      const token = await getToken();
      return getMyCallHistory({ token });
    },
    select: (res) => res.data,
  });

  // =======================
  // Search by name
  // =======================
  const searchedCalls = calls.filter((c) =>
    `${c.otherUser.firstName} ${c.otherUser.lastName}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // =======================
  // Group by day
  // =======================
  const groupCallsByDay = (calls) => {
    return calls.reduce((acc, call) => {
      const date = new Date(call.startedAt);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      let label;
      if (date.toDateString() === today.toDateString()) {
        label = "Today";
      } else if (date.toDateString() === yesterday.toDateString()) {
        label = "Yesterday";
      } else {
        label = date.toLocaleDateString([], {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      }

      if (!acc[label]) acc[label] = [];
      acc[label].push(call);
      return acc;
    }, {});
  };

  const groupedCalls = groupCallsByDay(
    searchedCalls.sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt))
  );

  // =======================
  // UI
  // =======================
  return (
    <div className="flex flex-col h-full">
      {/* ================= TOP BAR ================= */}
      <div className="flex justify-between items-center bg-card sticky top-0 z-10 py-4 px-6 border-b border-border">
        <h1 className="text-xl font-bold">Call History</h1>

        {/* SEARCH (hide on mobile when id exists) */}
        <div
          className={`
            flex w-full max-w-md gap-2
            ${id ? "hidden md:flex" : "flex"}
          `}
        >
          <Input
            placeholder="Search calls"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="flex flex-1 overflow-hidden">
        {/* ================= LEFT PANEL (CALL LIST) ================= */}
        <aside
          className={`
            w-full md:w-80
            border-r border-border
            overflow-y-auto custom-scrollbar
            ${id ? "hidden md:block" : "block"}
          `}
        >
          <div className="p-4">
            {isLoading && (
              <div className="flex justify-center py-6">
                <Spinner />
              </div>
            )}

            {!isLoading && Object.keys(groupedCalls).length === 0 && (
              <p className="text-sm text-muted-foreground text-center">
                No call history
              </p>
            )}

            {Object.entries(groupedCalls).map(([day, calls]) => (
              <div key={day} className="mb-4">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                  {day}
                </h3>

                <ul className="space-y-2">
                  {calls.map((call, index) => (
                    <ContactItem key={call.callId} c={call} index={index} />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </aside>

        {/* ================= RIGHT PANEL (DETAILS) ================= */}
        <main
          className={`
            flex-1 overflow-auto py-2
            ${id ? "block" : "hidden md:block"}
          `}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};
