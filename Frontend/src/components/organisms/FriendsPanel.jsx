import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/Avatar";
import PeopleSearchModal from "@/components/organisms/PeopleSearch";
import { getAvatarGradient } from "@/lib/colorGradient";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/atoms/DropdownMenu";

import { toast } from "react-toastify";
import { Spinner } from "@/components/atoms/Spinner";
import { MoreVertical } from "lucide-react";

import {
  getMyFriends,
  removeFriend,
  getPendingRequests,
  respondToFriendRequest,
} from "@/api/friends";
import { createConversation } from "@/api/conversation";
import { blockUser } from "@/api/block";

export default function FriendsPanel() {
  const [search, setSearch] = useState("");
  const [isModalOpen, setModalOpen] = useState(false);

  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  const navigate = useNavigate();

  /* =========================
     Incoming Friend Requests
  ========================= */
  const { data: friendRequests = [] } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: async () => {
      const token = await getToken();
      return getPendingRequests({ token });
    },
    select: (res) => res?.requests || [],
  });

  /* =========================
     Friends List
  ========================= */
  const {
    data: friends = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["friends"],
    queryFn: async () => {
      const token = await getToken();
      return getMyFriends({ token });
    },
    select: (res) => res?.friends || [],
  });

  /* =========================
     Mutations
  ========================= */

  // Remove friend
  const { mutate: removeFriendMutate, isPending: isRemoving } = useMutation({
    mutationFn: async (id) => {
      const token = await getToken();
      return removeFriend({ id, token });
    },
    onSuccess: () => {
      toast.success("Friend removed");
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
  });

  // Accept / Decline request
  const { mutate: respondRequestMutate, isPending: isResponding } = useMutation(
    {
      mutationFn: async ({ id, action }) => {
        const token = await getToken();
        return respondToFriendRequest({ id, action, token });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
        queryClient.invalidateQueries({ queryKey: ["friends"] });
      },
    }
  );

  // ✅ Block user (from request)
  const { mutate: blockUserMutate, isPending: isBlocking } = useMutation({
    mutationFn: async (userId) => {
      const token = await getToken();
      return blockUser({ userId, token });
    },
    onSuccess: () => {
      toast.success("User blocked");
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to block user");
    },
  });

  /* =========================
     Handlers
  ========================= */
  const handleOpenChat = async (friend) => {
    if (friend.conversationId) {
      navigate(`/chat/${friend.conversationId}`);
      return;
    }

    const token = await getToken();
    const res = await createConversation({ friendId: friend._id, token });

    if (res?.conversationId) {
      navigate(`/chat/${res.conversationId}`);
    }
  };

  const filteredFriends = friends.filter((f) => {
    const q = search.toLowerCase();
    return (
      f.fullName?.toLowerCase().includes(q) ||
      f.username?.toLowerCase().includes(q)
    );
  });

  /* =========================
     RENDER
  ========================= */
  return (
    <div className="flex flex-col h-full">
      {/* ================= HEADER ================= */}
      <div
        className="
      flex flex-col md:flex-row
      md:justify-between md:items-center
      gap-4
      bg-card sticky top-0 z-10
      py-4 px-4 md:px-6
      border-b border-border
    "
      >
        {/* LEFT */}
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            Friends
            {friends.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground">
                {friends.length}
              </span>
            )}
          </h1>

          {friends.length > 0 && (
            <p className="text-xs text-muted-foreground">
              You have {friends.length} friend{friends.length > 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* RIGHT (Search + Button) */}
        <div
          className="
        flex flex-col sm:flex-row
        gap-2
        w-full md:max-w-md
      "
        >
          <Input
            placeholder="Search friends..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />

          <Button
            onClick={() => setModalOpen(true)}
            className="w-full sm:w-auto"
          >
            Find People
          </Button>
        </div>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-4 custom-scrollbar">
        {/* -------- Incoming Requests -------- */}
        {friendRequests.length > 0 && (
          <div className="border rounded-lg bg-card">
            <div className="px-4 py-3 border-b font-semibold text-sm">
              Friend Requests ({friendRequests.length})
            </div>

            {friendRequests.map((req) => (
              <div
                key={req.id}
                className="
              flex flex-col sm:flex-row
              sm:items-center sm:justify-between
              gap-3
              px-4 py-3
              border-b last:border-0
            "
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={req.profileImageUrl} />
                    <AvatarFallback className={getAvatarGradient(req.id)}>
                      {req.fullName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <div className="font-medium">{req.fullName}</div>
                    <div className="text-xs text-muted-foreground">
                      @{req.username}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() =>
                      respondRequestMutate({ id: req.id, action: "accept" })
                    }
                    disabled={isResponding}
                  >
                    Accept
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      respondRequestMutate({ id: req.id, action: "decline" })
                    }
                    disabled={isResponding}
                  >
                    Decline
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="text-destructive"
                        disabled={isBlocking}
                        onClick={() => {
                          respondRequestMutate({
                            id: req.id,
                            action: "decline",
                          });
                          blockUserMutate(req.senderId);
                        }}
                      >
                        Block user
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* -------- Friends List -------- */}
        {isLoading && <Spinner />}

        {!isLoading && !isError && filteredFriends.length === 0 && (
          <p className="text-sm text-muted-foreground">No friends found.</p>
        )}

        {filteredFriends.map((friend) => (
          <div
            key={friend._id}
            onClick={() => handleOpenChat(friend)}
            className="
          flex items-center justify-between
          p-3 md:p-2
          rounded
          hover:bg-muted
          cursor-pointer
        "
          >
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={friend.profileImageUrl} />
                <AvatarFallback className={getAvatarGradient(friend._id)}>
                  {friend.fullName?.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div>
                <div className="font-medium">{friend.fullName}</div>
                <div className="text-xs text-muted-foreground">
                  @{friend.username}
                </div>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFriendMutate(friend._id);
                  }}
                  disabled={isRemoving}
                >
                  Unfriend
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    blockUserMutate(friend._id);
                  }}
                  disabled={isBlocking}
                >
                  Block
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>

      {/* ================= PEOPLE SEARCH ================= */}
      <PeopleSearchModal
        isModalOpen={isModalOpen}
        setModalOpen={setModalOpen}
      />
    </div>
  );
}
