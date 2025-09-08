import Sidebar from "@/components/organisms/Sidebar";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="flex h-screen bg-background text-foreground border-2 border-border gap-0.5">
      <Sidebar />
      <div className="flex-1 overflow-y-auto bg-card text-card-foreground scrollbar">
        <Outlet />
      </div>
    </div>
  );
}
