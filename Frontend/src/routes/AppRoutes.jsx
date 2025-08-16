import { createBrowserRouter, RouterProvider } from "react-router-dom";

// Routes wrapper
import ProtectedRoute from "./ProtectedRoute";

// Layout
import MainLayout from "@/components/templates/MainLayout";

// Pages
import Profile from "@/pages/Profile";

// Panels
import ChatWindow from "@/components/organisms/ChatWindow";
import ChatDetail from "@/components/organisms/ChatDetail";
import CallsPanel from "@/components/organisms/CallsPanel";
import FriendsPanel from "@/components/organisms/FriendsPanel";
import SettingsPanel from "@/components/organisms/SettingsPanel";

const router = createBrowserRouter([
  // Protected routes with layout
  {
    path: "/",
    element: (
      // <ProtectedRoute>
      <MainLayout />
      // </ProtectedRoute>
    ),

    children: [
      {
        path: "/",
        element: <ChatWindow />,
        children: [{ path: ":chat/:chatId", element: <ChatDetail /> }],
      },
      { path: "calls", element: <CallsPanel /> },
      { path: "friends", element: <FriendsPanel /> },
      { path: "settings", element: <SettingsPanel /> },
      { path: "profile", element: <Profile /> },
    ],
  },
]);

export default function AppRoutes() {
  return <RouterProvider router={router} />;
}
