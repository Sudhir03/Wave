import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { User, Bell, Sliders, HelpCircle, LogOut, Ban } from "lucide-react";
import ConfirmationModal from "../molecules/ConfirmationModal";
import { useClerk } from "@clerk/clerk-react";
import { Button } from "../atoms/Button";

function ProfileSidebar() {
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const { signOut } = useClerk();
  const location = useLocation();

  const handleLogout = () => {
    signOut({ redirectUrl: "/" });
    setConfirmOpen(false);
  };

  const links = [
    { to: "account", text: "Account", icon: User },
    { to: "personalization", text: "Personalization", icon: Sliders },
    { to: "blocked", text: "Blocked Users", icon: Ban },
    { to: "help", text: "Help", icon: HelpCircle },
  ];

  return (
    <div className="w-full border-r-2 border-border py-4 flex flex-col justify-between h-full">
      <nav className="flex flex-col gap-1 px-2">
        {links.map(({ to, text, icon: Icon }) => {
          // ✅ Index route should highlight Account
          const isIndexAccount =
            to === "account" && location.pathname === "/dashboard";

          return (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => {
                const active = isActive || isIndexAccount;

                return `flex items-center gap-3 px-3 py-2 rounded-md transition-colorstext-muted-foreground
              ${
                active
                  ? "lg:bg-accent lg:text-accent-foreground"
                  : "lg:hover:bg-accent/20"
              }`;
              }}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="text-sm font-medium">{text}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 mt-4">
        <Button
          variant="outline"
          className="w-full justify-start gap-2 text-red-500 hover:bg-red-500/10"
          onClick={() => setConfirmOpen(true)}
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>

      {isConfirmOpen && (
        <ConfirmationModal
          text="Are you sure you want to logout?"
          onConfirm={handleLogout}
          onCancel={() => setConfirmOpen(false)}
        />
      )}
    </div>
  );
}

export default ProfileSidebar;
