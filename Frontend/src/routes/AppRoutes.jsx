import { createBrowserRouter, RouterProvider } from "react-router-dom";

// Pages
import Home from "@/pages/Home";

// Routes configuration
const routesConfig = [
  {
    path: "/",
    element: <Home />,
  },
];

const router = createBrowserRouter(routesConfig);

export default function AppRoutes() {
  return <RouterProvider router={router} />;
}
