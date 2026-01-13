import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";

// Layout
import MainLayout from "@/components/templates/MainLayout";

// Pages
import Account from "@/pages/Account";
import Personalization from "@/pages/Personalization";
import Help from "@/pages/Help";
import { Call } from "@/pages/Call";
import Dashboard from "@/pages/Dashboard";

// Panels
import ChatWindow from "@/components/organisms/ChatWindow";
import ChatDetail from "@/components/organisms/ChatDetail";
import FriendsPanel from "@/components/organisms/FriendsPanel";

// Calls
import { CallHistoryPage } from "@/components/templates/CallHistoryPage";
import BlockedUsersList from "@/pages/BlockedUsersList";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Navigate to="/chat" replace /> },
      {
        path: "chat",
        element: <ChatWindow />,
        children: [
          { path: ":chatId", element: <ChatDetail /> },
          { path: "new/:friendId", element: <ChatDetail /> },
        ],
      },
      { path: "friend", element: <FriendsPanel /> },
      {
        path: "dashboard",
        element: <Dashboard />,
        children: [
          { index: true, element: <Account /> },
          { path: "account", element: <Account /> },
          { path: "personalization", element: <Personalization /> },
          { path: "blocked", element: <BlockedUsersList /> },
          { path: "help", element: <Help /> },
        ],
      },
      {
        path: "call",
        element: <Call />,
        children: [
          { index: true, element: <CallHistoryPage /> },
          { path: ":id", element: <CallHistoryPage /> },
        ],
      },
    ],
  },
]);

export default function AppRoutes() {
  return <RouterProvider router={router} />;
}
