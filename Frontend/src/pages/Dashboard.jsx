import ProfileSidebar from "@/components/organisms/ProfileSidebar";
import { useEffect, useRef } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

export default function Dashboard() {
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Correct logic
  const isRootDashboard = location.pathname === "/dashboard";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        navigate("/");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [navigate]);

  return (
    <div className="fixed inset-0 z-50 bg-black/50">
      <div
        ref={dropdownRef}
        className="
          absolute bottom-2 left-2
          bg-card text-card-foreground shadow-lg overflow-hidden
          w-full h-full
          sm:w-[600px] sm:h-[600px] sm:rounded-md
          sm:flex
        "
      >
        {/* SIDEBAR */}
        <div
          className={`
            sm:block
            ${isRootDashboard ? "block" : "hidden"}
          `}
        >
          <ProfileSidebar />
        </div>

        {/* CONTENT */}
        <div
          className={`
            flex-1
            sm:block
            ${isRootDashboard ? "hidden" : "block"}
          `}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
}
