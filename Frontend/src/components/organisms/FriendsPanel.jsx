import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";

import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/Avatar";
import AddFriendModal from "@/components/organisms/AddFriend";
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

import { getMyFriends, removeFriend } from "@/api/friends";
import {
  getPendingRequests,
  respondToFriendRequest,
} from "@/api/friendRequests";

export default function FriendsPanel() {
  const [search, setSearch] = useState("");
  const [isModalOpen, setModalOpen] = useState(false);

  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  // Friend requests list (incoming)
  const { data: friendRequests = [] } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: async () => {
      const token = await getToken();
      return getPendingRequests({ token });
    },
    select: (response) => response?.requests || [],
    onError: (err) => {
      toast.error(
        err?.response?.data?.message || "Failed to load friend requests",
        { toastId: "friend-requests-error" }
      );
    },
  });

  // Friends list
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
    select: (response) => response?.friends || [],
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to load friends", {
        toastId: "friends-error",
      });
    },
  });

  // Remove friend
  const { mutate: removeFriendMutate, isPending } = useMutation({
    mutationFn: async (id) => {
      const token = await getToken();
      return removeFriend({ id, token });
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Friend removed", {
        toastId: "remove-friend-success",
      });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to remove friend", {
        toastId: "remove-friend-error",
      });
    },
  });

  // Accept / decline friend request
  const { mutate: respondRequestMutate, isPending: isResponding } = useMutation(
    {
      mutationFn: async ({ id, action }) => {
        const token = await getToken();
        return respondToFriendRequest({ id, action, token });
      },
      onSuccess: (data) => {
        toast.success(data?.message || "Request updated", {
          toastId: "friend-request-success",
        });
        queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
        queryClient.invalidateQueries({ queryKey: ["friends"] });
      },
      onError: (err) => {
        toast.error(
          err?.response?.data?.message || "Failed to update friend request",
          { toastId: "friend-request-error" }
        );
      },
    }
  );

  function handleUnfollow(id) {
    removeFriendMutate(id);
  }

  function handleRequestAction(id, action) {
    respondRequestMutate({ id, action });
  }

  const filteredFriends = friends.filter((friend) => {
    const q = search.toLowerCase();
    return (
      friend.fullName?.toLowerCase().includes(q) ||
      friend.username?.toLowerCase().includes(q)
    );
  });

  const hasFriends = !isLoading && !isError && friends.length > 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header: sticky */}
      <div className="flex justify-between items-center bg-card sticky top-0 z-10 py-4 px-6 border-b border-border">
        <div className="flex flex-col">
          <div className="flex items-baseline gap-2">
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              Friends
              {hasFriends && (
                <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground">
                  {friends.length}
                </span>
              )}
            </h1>
          </div>
          {hasFriends && (
            <span className="text-xs text-muted-foreground">
              You have {friends.length} friend
              {friends.length === 1 ? "" : "s"}
            </span>
          )}
        </div>

        <div className="flex gap-2 w-full max-w-md">
          <Input
            placeholder="Search Friends..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
          <Button onClick={() => setModalOpen(true)}>Add</Button>
        </div>
      </div>

      {/* Scrollable content (requests + friends) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {/* Friend Requests UI */}
        {friendRequests.length > 0 && (
          <div className="border border-border rounded-lg bg-card">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h2 className="font-semibold text-foreground text-sm">
                Friend Requests
              </h2>
              <span className="text-xs text-muted-foreground">
                {friendRequests.length} pending
              </span>
            </div>

            <div className="max-h-64 overflow-y-auto custom-scrollbar">
              {friendRequests.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center justify-between gap-3 px-4 py-3 border-b last:border-b-0 border-border"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage
                        src={req.profileImageUrl}
                        alt={req.fullName}
                      />
                      <AvatarFallback className={getAvatarGradient(req.id)}>
                        {req.fullName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <div className="font-medium text-foreground text-sm">
                        {req.fullName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        @{req.username}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleRequestAction(req.id, "accept")}
                      disabled={isResponding}
                    >
                      Accept
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRequestAction(req.id, "decline")}
                      disabled={isResponding}
                    >
                      Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Friends List */}
        <div className="space-y-2">
          {isLoading && (
            <div className="flex items-center justify-center gap-2 text-muted-foreground py-2">
              <Spinner className="size-20 text-accent" />
            </div>
          )}

          {!isLoading && !isError && (
            <>
              {filteredFriends.length > 0 ? (
                filteredFriends.map((friend) => (
                  <div
                    key={friend._id}
                    className="flex items-center justify-between gap-3 py-2 border-b border-border relative"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage
                          src={friend.profileImageUrl}
                          alt={friend.fullName}
                        />
                        <AvatarFallback
                          className={getAvatarGradient(friend._id)}
                        >
                          {friend.fullName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-foreground">
                          {friend.fullName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          @{friend.username}
                        </div>
                      </div>
                    </div>

                    {/* Three dots menu button */}
                    <div className="relative">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 flex items-center justify-center rounded-full 
                   hover:bg-gray-200 dark:hover:bg-gray-700 
                   focus-visible:outline-none focus-visible:ring-0"
                          >
                            <MoreVertical className="h-5 w-5 text-card-foreground" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-36">
                          <DropdownMenuItem
                            onClick={() => handleUnfollow(friend._id)}
                            disabled={isPending}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <span>
                              {isPending ? "Removing..." : "Unfriend"}
                            </span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground text-sm">
                  No friends yet. Try adding some.
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <AddFriendModal isModalOpen={isModalOpen} setModalOpen={setModalOpen} />
    </div>
  );
}
