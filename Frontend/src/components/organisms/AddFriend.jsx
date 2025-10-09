import React, { useState } from "react";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/Avatar";
import { X } from "lucide-react";
import { getAvatarGradient } from "@/lib/colorGradient";

export default function AddFriendModal({ isModalOpen, setModalOpen }) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);

  const dummyData = [
    { _id: 1, name: "John Doe", username: "john" },
    { _id: 2, name: "Jane Smith", username: "jane" },
    { _id: 3, name: "Alice Johnson", username: "alice" },
    { _id: 4, name: "Bob Williams", username: "bob" },
    { _id: 5, name: "Charlie Brown", username: "charlie" },
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
          <div className="bg-card text-card-foreground rounded-xl shadow-2xl p-6 w-96 max-h-[80vh] overflow-y-auto relative">
            {/* Close Button */}
            <button
              className="absolute top-3 right-3 p-2 rounded-full hover:bg-muted transition-colors cursor-pointer"
              onClick={() => setModalOpen(false)}
            >
              <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
            </button>

            {/* Title */}
            <h2 className="text-2xl font-bold mb-4 text-center">
              Add New Friend
            </h2>

            {/* Search Input */}
            <Input
              placeholder="Search by name or username"
              value={search}
              onChange={handleSearch}
              className="mb-4"
            />

            {/* Results List */}
            <div className="space-y-2">
              {results.length > 0 ? (
                results.map((user) => (
                  <div
                    key={user.id}
                    className="flex justify-between items-center p-3 hover:bg-muted rounded-xl transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={user.picture} alt={user.name} />
                        <AvatarFallback className={getAvatarGradient(user._id)}>
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">
                          @{user.username}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:opacity-90"
                    >
                      Add
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-center text-sm text-muted-foreground mt-4">
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
