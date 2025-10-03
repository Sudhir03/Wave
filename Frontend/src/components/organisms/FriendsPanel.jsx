import { useState } from "react";
import { Input } from "../atoms/Input";
import { Button } from "../atoms/Button";
import { Avatar, AvatarFallback, AvatarImage } from "../atoms/Avatar";
import AddFriendModal from "./AddFriend";
import { getAvatarGradient } from "@/lib/colorGradient";

const friendsData = [
  { _id: 1, name: "Sophia Carter", username: "sophia.carter" },
  { _id: 2, name: "Ethan Bennett", username: "ethan.bennett" },
  { _id: 3, name: "Olivia Hayes", username: "olivia.hayes" },
  { _id: 4, name: "Liam Foster", username: "liam.foster" },
  { _id: 5, name: "Ava Harper", username: "ava.harper" },
  { _id: 6, name: "Noah Parker", username: "noah.parker" },
  { _id: 7, name: "Isabella Reed", username: "isabella.reed" },
  { _id: 8, name: "Jackson Cole", username: "jackson.cole" },
  { _id: 9, name: "Mia Brooks", username: "mia.brooks" },
  { _id: 10, name: "Lucas Gray", username: "lucas.gray" },
  { _id: 11, name: "Amelia Scott", username: "amelia.scott" },
  { _id: 12, name: "Benjamin Ross", username: "benjamin.ross" },
  { _id: 13, name: "Charlotte Ward", username: "charlotte.ward" },
  { _id: 14, name: "Daniel Hughes", username: "daniel.hughes" },
  { _id: 15, name: "Emily Turner", username: "emily.turner" },
];

export default function FriendsPanel() {
  const [search, setSearch] = useState("");
  const [friends, setFriends] = useState(friendsData);
  const [isModalOpen, setModalOpen] = useState(false);
  const [menuOpenFor, setMenuOpenFor] = useState(null); // Track which friend's menu is open

  function handleUnfollow(id) {
    setFriends((prev) => prev.filter((friend) => friend._id !== id));
    setMenuOpenFor(null);
  }

  const filteredFriends = friends.filter(
    (friend) =>
      friend.name.toLowerCase().includes(search.toLowerCase()) ||
      friend.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-card sticky top-0 z-10 py-4 border-b border-border -mt-6">
        <h1 className="text-xl font-bold text-foreground">Friends</h1>
        <div className="flex gap-2 w-full max-w-md">
          <Input
            placeholder="Search Friends..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button onClick={() => setModalOpen(true)}>Add</Button>
        </div>
      </div>

      {/* Friends List */}
      <div className="mt-4">
        {filteredFriends.map((friend) => (
          <div
            key={friend._id}
            className="flex items-center justify-between gap-3 py-2 border-b border-border relative"
          >
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={friend.picture} alt={friend.name} />
                <AvatarFallback className={getAvatarGradient(friend._id)}>
                  {friend.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold text-foreground">
                  {friend.name}
                </div>
                <div className="text-sm text-muted-foreground">
                  @{friend.username}
                </div>
              </div>
            </div>

            {/* Three dots menu button */}
            <div className="relative">
              <button
                onClick={() =>
                  setMenuOpenFor(menuOpenFor === friend._id ? null : friend._id)
                }
                className="p-2 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                ⋮
              </button>

              {/* Menu */}
              {menuOpenFor === friend._id && (
                <div className="absolute right-0 mt-2 w-32 bg-card border border-border rounded shadow-lg z-20">
                  <button
                    onClick={() => handleUnfollow(friend._id)}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Unfollow
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {filteredFriends.length === 0 && (
          <div className="text-muted-foreground">No friends found</div>
        )}
      </div>

      <AddFriendModal isModalOpen={isModalOpen} setModalOpen={setModalOpen} />
    </div>
  );
}
