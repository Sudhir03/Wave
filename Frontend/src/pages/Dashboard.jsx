import ProfileSidebar from "@/components/organisms/ProfileSidebar";
import { useEffect, useRef } from "react";
import { Outlet, useNavigate } from "react-router-dom";

export default function Dashboard() {
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        navigate("/");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [navigate]);

  return (
    // Full-screen dark overlay
    <div className="fixed inset-0 z-50 bg-black/50">
      {/* Modal box anchored bottom-left */}
      <div
        ref={dropdownRef}
        className="absolute bottom-2 left-2 flex bg-card px-2 text-card-foreground w-[600px] h-[600px] rounded-md shadow-lg overflow-hidden"
      >
        {/* Sidebar */}
        <ProfileSidebar />

        {/* Main content */}
        <div className="h-full w-full">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
