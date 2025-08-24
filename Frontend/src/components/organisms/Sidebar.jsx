import { NavLink } from "react-router-dom";
import { Button } from "@/components/atoms/Button";
import { Logo } from "@/components/atoms/Logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/Avatar";
import { MessageSquare, Phone, Users } from "lucide-react";

export default function Sidebar() {
  return (
    <div className="flex flex-col items-center w-20 py-4 space-y-6 shadow bg-card text-card-foreground">
      {/* Top Logo */}
      <Logo />

      {/* Nav Icons */}
      <nav className="flex flex-col flex-grow gap-4">
        {[
          { to: "/", icon: MessageSquare },
          { to: "/calls", icon: Phone },
          { to: "/friends", icon: Users },
        ].map(({ to, icon: Icon }) => (
          <NavLink key={to} to={to} end>
            {({ isActive }) => (
              <Button
                variant="ghost"
                size="icon"
                className={`${
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                } transition-colors`}
              >
                <Icon className="!h-5 !w-5 stroke-current" />
              </Button>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Avatar at bottom */}
      <div className="mt-auto">
        <NavLink to="/profile">
          <Avatar className="w-10 h-10 rounded cursor-pointer">
            <AvatarImage />
            <AvatarFallback>👤</AvatarFallback>
          </Avatar>
        </NavLink>
      </div>
    </div>
  );
}
