import React, { useState } from "react";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/Avatar";
import { X, MoreVertical } from "lucide-react";
import { getAvatarGradient } from "@/lib/colorGradient";
import { Spinner } from "@/components/atoms/Spinner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/atoms/DropdownMenu";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "react-toastify";

import { searchUsers } from "@/api/users";
import {
  sendFriendRequest,
  getSentFriendRequests,
  cancelFriendRequest,
  getPendingRequests,
  respondToFriendRequest,
} from "@/api/friends";
import { blockUser } from "@/api/block";

export default function PeopleSearch({ isModalOpen, setModalOpen }) {
  const [search, setSearch] = useState("");

  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  /* =========================
     QUERIES
  ========================= */

  const { data: searchResults = [], isLoading: isSearching } = useQuery({
    queryKey: ["searchUsers", search],
    queryFn: async () => {
      const token = await getToken();
      return searchUsers({ query: search, token });
    },
    select: (res) => res?.users || [],
    enabled: search.length > 0 && isModalOpen,
    cacheTime: 0,
  });

  const { data: sentRequests = [] } = useQuery({
    queryKey: ["sentFriendRequests"],
    queryFn: async () => {
      const token = await getToken();
      return getSentFriendRequests({ token });
    },
    select: (res) => res?.requests || [],
    enabled: isModalOpen,
  });

  const { data: pendingRequests = [] } = useQuery({
    queryKey: ["pendingFriendRequests"],
    queryFn: async () => {
      const token = await getToken();
      return getPendingRequests({ token });
    },
    select: (res) => res?.requests || [],
    enabled: isModalOpen,
  });

  /* =========================
     MUTATIONS
  ========================= */

  const { mutate: sendRequest } = useMutation({
    mutationFn: async (receiverId) => {
      const token = await getToken();
      return sendFriendRequest({ receiverId, token });
    },
    onSuccess: () => {
      toast.success("Request sent");
      queryClient.invalidateQueries({ queryKey: ["sentFriendRequests"] });
    },
  });

  const { mutate: cancelRequest } = useMutation({
    mutationFn: async (requestId) => {
      const token = await getToken();
      return cancelFriendRequest({ requestId, token });
    },
    onSuccess: () => {
      toast.success("Request cancelled");
      queryClient.invalidateQueries({ queryKey: ["sentFriendRequests"] });
    },
  });

  const { mutate: acceptRequest } = useMutation({
    mutationFn: async (requestId) => {
      const token = await getToken();
      return respondToFriendRequest({ id: requestId, action: "accept", token });
    },
    onSuccess: () => {
      toast.success("Friend request accepted");
      queryClient.invalidateQueries({ queryKey: ["pendingFriendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
  });

  const { mutate: blockUserMutate } = useMutation({
    mutationFn: async (userId) => {
      const token = await getToken();
      return blockUser({ userId, token });
    },
    onSuccess: () => {
      toast.success("User blocked");

      queryClient.invalidateQueries({ queryKey: ["searchUsers"] });
      queryClient.invalidateQueries({ queryKey: ["sentFriendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["pendingFriendRequests"] });
    },
  });

  /* =========================
     HELPERS 
  ========================= */

  const sentMap = {};
  sentRequests.forEach((r) => (sentMap[r.receiverId] = r.id));

  const incomingMap = {};
  pendingRequests.forEach((r) => (incomingMap[r.senderId] = r.id));

  /* =========================
     RENDER
  ========================= */

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-xl p-6 w-96 max-h-[80vh] overflow-y-auto relative">
        <button
          className="absolute top-3 right-3"
          onClick={() => setModalOpen(false)}
        >
          <X />
        </button>

        <h2 className="text-xl font-bold mb-4 text-center">Find People</h2>

        <Input
          placeholder="Search people..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4"
        />

        {isSearching && <Spinner />}

        <div className="space-y-2">
          {searchResults.map((user) => {
            const outgoing = sentMap[user._id];
            const incoming = incomingMap[user._id];

            return (
              <div
                key={user._id}
                className="flex items-center justify-between p-3 rounded hover:bg-muted"
              >
                <div className="flex gap-3 items-center">
                  <Avatar>
                    <AvatarImage src={user.profileImageUrl} />
                    <AvatarFallback className={getAvatarGradient(user._id)}>
                      {user.fullName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{user.fullName}</div>
                    <div className="text-xs text-muted-foreground">
                      @{user.username}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {outgoing ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => cancelRequest(outgoing)}
                    >
                      Requested
                    </Button>
                  ) : incoming ? (
                    <Button size="sm" onClick={() => acceptRequest(incoming)}>
                      Accept
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => sendRequest(user._id)}>
                      Add
                    </Button>
                  )}

                  {/* ⋮ MORE */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          blockUserMutate(user._id);
                        }}
                      >
                        Block
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
