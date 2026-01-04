import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Button } from "../atoms/Button";
import { User, Bell, Sliders, HelpCircle, LogOut, Ban } from "lucide-react";
import ConfirmationModal from "../molecules/ConfirmationModal";
import { useClerk } from "@clerk/clerk-react";

function ProfileSidebar() {
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const { signOut } = useClerk();

  const handleLogout = () => {
    signOut({ redirectUrl: "/" });
    setConfirmOpen(false);
  };

  const links = [
    { to: ".", text: "Account", icon: <User className="w-4 h-4" /> },
    {
      to: "notification",
      text: "Notification",
      icon: <Bell className="w-4 h-4" />,
    },
    {
      to: "personalization",
      text: "Personalization",
      icon: <Sliders className="w-4 h-4" />,
    },
    {
      to: "blocked",
      text: "Blocked Users",
      icon: <Ban className="w-4 h-4" />,
    },
    { to: "help", text: "Help", icon: <HelpCircle className="w-4 h-4" /> },
  ];

  return (
    <div className="w-[30%] border-r-2 border-border py-4 flex flex-col justify-between h-full">
      {/* Navigation Links */}
      <nav className="flex flex-col gap-4 px-3">
        {links.map(({ to, text, icon }) => (
          <NavLink key={to} to={to} end>
            {({ isActive }) => (
              <Button
                variant="ghost"
                className={`w-full justify-start flex items-center gap-2 border-b ${
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                } transition-colors`}
              >
                {icon}
                {text}
              </Button>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="px-3 mt-4">
        <Button
          variant="outline"
          className="w-full justify-start flex items-center gap-2 text-red-500 hover:bg-red-400"
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
