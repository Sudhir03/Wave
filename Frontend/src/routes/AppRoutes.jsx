import { createBrowserRouter, RouterProvider } from "react-router-dom";

// Layout
import MainLayout from "@/components/templates/MainLayout";

// Pages
import Account from "@/pages/Account";
import Notification from "@/pages/Notification";
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

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <ChatWindow />,
      },
      {
        path: "/",
        element: <ChatWindow />,
        children: [{ path: ":chat/:chatId", element: <ChatDetail /> }],
      },
      { path: "friends", element: <FriendsPanel /> },
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
      {
        path: "calls",
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
