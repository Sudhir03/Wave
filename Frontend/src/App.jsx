import {
  SignedIn,
  SignedOut,
  RedirectToSignIn,
  useAuth,
} from "@clerk/clerk-react";
import AppRoutes from "@/routes/AppRoutes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getMyProfile } from "./api/users";
import socket from "@/socket";
import { useEffect } from "react";

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

  useEffect(() => {
    if (!user?._id) return;

    socket.connect();

    socket.emit("register_user", {
      userId: user._id,
    });

    return () => {
      socket.disconnect(); // 👈 yahi se offline trigger hoga
    };
  }, [user?._id]);

  useEffect(() => {
    const showToken = async () => {
      const token = await getToken({ template: "backend-api" });
      console.log("JWT Token:", token);
    };
    showToken();
  }, [getToken]);

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
