import { NavLink } from "react-router-dom";
import { Button } from "@/components/atoms/Button";
import { Logo } from "@/components/atoms/Logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/Avatar";
import { MessageSquare, Phone, Users } from "lucide-react";

export default function Sidebar() {
  return (
    <div className="w-20 bg-sidebar text-sidebar-foreground flex flex-col items-center py-4 space-y-6">
      {/* Top Logo */}
      <div className="mb-8">
        <Logo />
      </div>

      {/* Nav Icons */}
      <nav className="flex flex-col gap-4 flex-grow">
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
                    ? "bg-sidebar-icon-active text-sidebar-icon-active-foreground"
                    : "text-sidebar-foreground"
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
          <Avatar className="h-10 w-10 cursor-pointer rounded">
            <AvatarImage src="/me.png" alt="User Avatar" />
            <AvatarFallback>👤</AvatarFallback>
          </Avatar>
        </NavLink>
      </div>
    </div>
  );
}
