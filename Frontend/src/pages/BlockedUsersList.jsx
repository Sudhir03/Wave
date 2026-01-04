import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { getBlockedUsers, unblockUser } from "@/api/block";
import { Button } from "@/components/atoms/Button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/atoms/Avatar";
import { Spinner } from "@/components/atoms/Spinner";

export default function BlockedUsersList() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  // =======================
  // Fetch blocked users
  // =======================
  const { data: blockedUsers, isLoading } = useQuery({
    queryKey: ["blockedUsers"],
    queryFn: async () => {
      const token = await getToken();
      return getBlockedUsers({ token });
    },
    select: (res) => res.users,
  });

  // =======================
  // Unblock mutation
  // =======================
  const { mutate: unblock, isLoading: isUnblocking } = useMutation({
    mutationFn: async (userId) => {
      const token = await getToken();
      return unblockUser({ userId, token });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["blockedUsers"]);
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <Spinner />
      </div>
    );
  }

  if (!blockedUsers || blockedUsers.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-6">
        You haven’t blocked anyone.
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Blocked Users</h2>
        <p className="text-sm text-muted-foreground">
          You won’t receive messages or calls from users you block.
        </p>
      </div>

      {/* List */}
      <div className="space-y-2">
        {blockedUsers.map((user) => (
          <div
            key={user._id}
            className="
            flex items-center justify-between
            p-3 rounded-lg
            border border-border
            hover:bg-accent/10
            transition-colors
          "
          >
            <div className="flex items-center gap-3 min-w-0">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user.profileImageUrl} />
                <AvatarFallback>{user.fullName?.[0]}</AvatarFallback>
              </Avatar>

              <div className="flex flex-col min-w-0">
                <span className="font-medium truncate">{user.fullName}</span>
                <span className="text-xs text-muted-foreground truncate">
                  @{user.username}
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled={isUnblocking}
              onClick={() => unblock(user._id)}
            >
              Unblock
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
