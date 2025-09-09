import { NavLink } from "react-router-dom";
import { Button } from "../atoms/Button";
import { User, Bell, Sliders, HelpCircle } from "lucide-react";

function ProfileSidebar() {
  const links = [
    { to: ".", text: "Account", icon: <User className="w-4 h-4" /> }, // "." points to index (/profile)
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
    { to: "help", text: "Help", icon: <HelpCircle className="w-4 h-4" /> },
  ];

  return (
    <div className="w-[30%] border-r-2 border-border py-4">
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
    </div>
  );
}

export default ProfileSidebar;
