import { createBrowserRouter, RouterProvider } from "react-router-dom";

// Routes wrapper
import ProtectedRoute from "./ProtectedRoute";

// Layout
import MainLayout from "@/components/templates/MainLayout";

// Pages
import Account from "@/pages/Account";
import Notification from "@/pages/Notification";
import Personalization from "@/pages/Personalization";
import Help from "@/pages/Help";
import Dashboard from "@/pages/Dashboard";

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
      {
        path: "dashboard",
        element: <Dashboard />,
        children: [
          { index: true, element: <Account /> },
          { path: "notification", element: <Notification /> },
          { path: "personalization", element: <Personalization /> },
          { path: "help", element: <Help /> },
        ],
      },
    ],
  },
]);

export default function AppRoutes() {
  return <RouterProvider router={router} />;
}
