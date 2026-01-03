import React, { useState, useMemo } from "react";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/Avatar";
import { X } from "lucide-react";
import { getAvatarGradient } from "@/lib/colorGradient";
import { Spinner } from "@/components/atoms/Spinner";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "react-toastify";

import { searchUsers } from "@/api/users";
import { getMyFriends } from "@/api/friends";
import {
  sendFriendRequest,
  getSentFriendRequests,
  cancelFriendRequest,
  getPendingRequests,
  respondToFriendRequest,
} from "@/api/friends";

export default function AddFriendModal({ isModalOpen, setModalOpen }) {
  const [search, setSearch] = useState("");
  const [sendingFor, setSendingFor] = useState(null);
  const [cancellingFor, setCancellingFor] = useState(null);
  const [acceptingFor, setAcceptingFor] = useState(null);

  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  // Search users
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

  // Current friends (to hide them from search)
  const { data: friends = [] } = useQuery({
    queryKey: ["friends"],
    queryFn: async () => {
      const token = await getToken();
      return getMyFriends({ token });
    },
    select: (res) => res?.friends || [],
    enabled: isModalOpen,
  });

  const friendIdSet = useMemo(() => {
    const set = new Set();
    friends.forEach((f) => set.add(f._id));
    return set;
  }, [friends]);

  // Sent friend requests (outgoing: you → them)
  const { data: sentRequests = [] } = useQuery({
    queryKey: ["sentFriendRequests"],
    queryFn: async () => {
      const token = await getToken();
      const res = await getSentFriendRequests({ token });
      return res;
    },
    select: (res) => res?.requests || [],
    enabled: isModalOpen,
  });

  // Incoming pending requests (them → you)
  const { data: pendingRequests = [] } = useQuery({
    queryKey: ["pendingFriendRequests"],
    queryFn: async () => {
      const token = await getToken();
      const res = await getPendingRequests({ token });
      return res;
    },
    // controller must return: { id, senderId, ... }
    select: (res) => res?.requests || [],
    enabled: isModalOpen,
  });

  // receiverId -> outgoing requestId (you -> them)
  const sentMap = useMemo(() => {
    const map = {};
    sentRequests.forEach((req) => {
      // make sure your backend returns receiverId in getSentFriendRequests
      map[req.receiverId] = req.id;
    });
    return map;
  }, [sentRequests]);

  // senderId -> incoming requestId (them -> you)
  const incomingMap = useMemo(() => {
    const map = {};
    pendingRequests.forEach((req) => {
      // make sure your backend returns senderId in getPendingRequests
      map[req.senderId] = req.id;
    });
    return map;
  }, [pendingRequests]);

  // Filter out users who are already friends
  const results = useMemo(
    () => searchResults.filter((u) => !friendIdSet.has(u._id)),
    [searchResults, friendIdSet]
  );

  // Send request
  const { mutate: sendRequest, isPending: isSending } = useMutation({
    mutationFn: async (receiverId) => {
      const token = await getToken();
      return sendFriendRequest({ receiverId, token });
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Request sent", {
        toastId: "send-success",
      });
      queryClient.invalidateQueries({ queryKey: ["sentFriendRequests"] });
    },
    onError: (err) => {
      const msg = err?.response?.data?.message;
      toast.error(msg || "Failed to send request", {
        toastId: "send-error",
      });
    },
  });

  // Cancel outgoing request
  const { mutate: cancelRequest, isPending: isCancelling } = useMutation({
    mutationFn: async (requestId) => {
      const token = await getToken();
      return cancelFriendRequest({ requestId, token });
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Request cancelled", {
        toastId: "cancel-success",
      });
      queryClient.invalidateQueries({ queryKey: ["sentFriendRequests"] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to cancel request", {
        toastId: "cancel-error",
      });
    },
  });

  // Accept incoming request (use existing respondToFriendRequest with action)
  const { mutate: acceptRequest, isPending: isAccepting } = useMutation({
    mutationFn: async (requestId) => {
      const token = await getToken();
      // IMPORTANT: match your existing API signature
      return respondToFriendRequest({
        id: requestId,
        action: "accept",
        token,
      });
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Friend request accepted", {
        toastId: "accept-success",
      });
      queryClient.invalidateQueries({ queryKey: ["pendingFriendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to accept request", {
        toastId: "accept-error",
      });
    },
  });

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleSendClick = (receiverId) => {
    setSendingFor(receiverId);
    sendRequest(receiverId, {
      onSettled: () => {
        setSendingFor(null);
      },
    });
  };

  const handleCancelClick = (requestId) => {
    setCancellingFor(requestId);
    cancelRequest(requestId, {
      onSettled: () => {
        setCancellingFor(null);
      },
    });
  };

  const handleAcceptClick = (requestId) => {
    setAcceptingFor(requestId);
    acceptRequest(requestId, {
      onSettled: () => {
        setAcceptingFor(null);
      },
    });
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
              {isSearching && (
                <div className="flex justify-center items-center py-4">
                  <Spinner className="size-6 text-primary" />
                </div>
              )}

              {!isSearching && results.length > 0
                ? results.map((user) => {
                    const userId = user._id;

                    const outgoingRequestId = sentMap[userId]; // you → them
                    const incomingRequestId = incomingMap[userId]; // them → you

                    const hasOutgoing = Boolean(outgoingRequestId);
                    const hasIncoming = Boolean(incomingRequestId);

                    return (
                      <div
                        key={user._id}
                        className="flex justify-between items-center p-3 hover:bg-muted rounded-xl transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="w-12 h-12">
                            <AvatarImage
                              src={user.profileImageUrl}
                              alt={user.fullName}
                            />
                            <AvatarFallback
                              className={getAvatarGradient(user._id)}
                            >
                              {user.fullName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.fullName}</p>
                            <p className="text-sm text-muted-foreground">
                              @{user.username}
                            </p>
                          </div>
                        </div>

                        {/* Button logic:
                          - hasOutgoing: you sent -> Requested (Undo)
                          - !hasOutgoing && hasIncoming: they sent -> Approve
                          - else: Add
                      */}
                        {hasOutgoing ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancelClick(outgoingRequestId)}
                            disabled={
                              isCancelling &&
                              cancellingFor === outgoingRequestId
                            }
                            className="disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {isCancelling && cancellingFor === outgoingRequestId
                              ? "Undoing..."
                              : "Requested"}
                          </Button>
                        ) : hasIncoming ? (
                          <Button
                            size="sm"
                            onClick={() => handleAcceptClick(incomingRequestId)}
                            disabled={
                              isAccepting && acceptingFor === incomingRequestId
                            }
                            className="bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {isAccepting && acceptingFor === incomingRequestId
                              ? "Approving..."
                              : "Approve"}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleSendClick(userId)}
                            disabled={isSending && sendingFor === userId}
                            className="bg-linear-to-r from-blue-500 to-purple-500 text-white hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {isSending && sendingFor === userId
                              ? "Sending..."
                              : "Add"}
                          </Button>
                        )}
                      </div>
                    );
                  })
                : !isSearching && (
                    <p className="text-center text-sm text-muted-foreground mt-4">
                      {search
                        ? "No results found"
                        : "Type to search for friends"}
                    </p>
                  )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
