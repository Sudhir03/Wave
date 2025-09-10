import Sidebar from "@/components/organisms/Sidebar";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="flex h-screen bg-card text-card-foreground border-2 border-border">
      <Sidebar />
      <div className="flex-1 overflow-y-auto border-l-2 border-border">
        <Outlet />
      </div>
    </div>
  );
}
