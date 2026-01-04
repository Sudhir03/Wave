// =======================
// Imports – Auth & Routing
// =======================
import {
  SignedIn,
  SignedOut,
  RedirectToSignIn,
  useAuth,
} from "@clerk/clerk-react";

import AppRoutes from "@/routes/AppRoutes";

// =======================
// Imports – UI & Styling
// =======================
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// =======================
// Imports – Data & State
// =======================
import { useQuery } from "@tanstack/react-query";
import { getMyProfile } from "./api/users";

// =======================
// Imports – Real-Time (Socket)
// =======================
import socket from "@/socket";
import { useEffect } from "react";

function App() {
  // =======================
  // Auth & Query Setup
  // =======================
  const { getToken } = useAuth();

  // =======================
  // Fetch Logged-In User
  // =======================
  const { data: user } = useQuery({
    queryKey: ["myProfile"],
    queryFn: async () => {
      const token = await getToken();
      return getMyProfile({ token });
    },
    select: (res) => res.user,
  });

  // =======================
  // Socket Connection + Heartbeat
  // =======================
  useEffect(() => {
    // Do not connect socket until user exists
    if (!user?._id) return;

    // Establish socket connection
    socket.connect();

    // Register user for presence tracking
    socket.emit("register_user", {
      userId: user._id,
    });

    // Keep user online via heartbeat
    const heartbeatInterval = setInterval(() => {
      socket.emit("heartbeat", {
        userId: user._id,
      });
    }, 45000);

    // Cleanup on unmount or logout
    return () => {
      clearInterval(heartbeatInterval);
      socket.disconnect();
    };
  }, [user?._id]);

  return (
    <>
      {/* Render app only when authenticated */}
      <SignedIn>
        <AppRoutes />

        {/* Global toast notifications */}
        <ToastContainer position="top-right" autoClose={2500} limit={1} />
      </SignedIn>

      {/* Redirect unauthenticated users */}
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}

export default App;
