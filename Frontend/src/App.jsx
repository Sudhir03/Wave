import {
  SignedIn,
  SignedOut,
  RedirectToSignIn,
  useAuth,
} from "@clerk/clerk-react";
import AppRoutes from "@/routes/AppRoutes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getMyProfile } from "./api/users";
import socket, { attachUserToSocket } from "@/socket";

function App() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["myProfile"],
    queryFn: async () => {
      const token = await getToken();
      return getMyProfile({ token });
    },
    select: (res) => res.user,
  });

  // 🔥 DELIVERED STATUS HANDLER (GLOBAL)
  useEffect(() => {
    if (!user?._id) return;

    attachUserToSocket(user._id);

    socket.on("message_delivered", ({ conversationId, messageId }) => {
      queryClient.setQueryData(["messages", conversationId], (old) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            messages: page.messages.map((m) =>
              m._id === messageId && m.status === "sent"
                ? { ...m, status: "delivered" }
                : m
            ),
          })),
        };
      });
    });

    return () => {
      socket.off("message_delivered");
    };
  }, [user, queryClient]);

  return (
    <>
      <SignedIn>
        <AppRoutes />
        <ToastContainer position="top-right" autoClose={2500} limit={1} />
      </SignedIn>

      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}

export default App;
