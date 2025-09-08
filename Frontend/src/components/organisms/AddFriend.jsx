import React, { useState } from "react";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";

export default function AddFriendModal({ isModalOpen, setModalOpen }) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);

  const dummyData = [
    { id: 1, name: "John Doe", username: "john" },
    { id: 2, name: "Jane Smith", username: "jane" },
    { id: 3, name: "Alice Johnson", username: "alice" },
  ];

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);

    setResults(
      dummyData.filter(
        (user) =>
          user.name.toLowerCase().includes(value.toLowerCase()) ||
          user.username.toLowerCase().includes(value.toLowerCase())
      )
    );
  };

  return (
    <>
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-card text-card-foreground rounded-lg shadow-lg p-6 w-96 max-h-[80vh] overflow-y-auto relative">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
              onClick={() => setModalOpen(false)}
            >
              ✕
            </Button>

            {/* Title */}
            <h2 className="text-lg font-bold mb-4">Add New Friend</h2>

            {/* Search Input */}
            <Input
              placeholder="Search by name or username"
              value={search}
              onChange={handleSearch}
              className="mb-3"
            />

            {/* Results List */}
            <div className="space-y-2">
              {results.length > 0 ? (
                results.map((user) => (
                  <div
                    key={user.id}
                    className="flex justify-between items-center p-2 hover:bg-muted rounded-md transition-colors cursor-pointer"
                  >
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        @{user.username}
                      </p>
                    </div>
                    <Button size="sm">Add</Button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  {search ? "No results found" : "Type to search for friends"}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
