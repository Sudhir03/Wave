import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/atoms/Button";
import { Logo } from "@/components/atoms/Logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/Avatar";
import { MessageSquare, Phone, UserCog, Users } from "lucide-react";

export default function Sidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const links = [
    { to: "/chat", icon: MessageSquare },
    { to: "/call", icon: Phone },
    { to: "/friend", icon: Users },
  ];

  const isActiveLink = (to) => {
    if (to === "/") {
      return pathname === "/" || pathname.startsWith("/chat");
    }
    return pathname.startsWith(to);
  };

  return (
    <div className="h-full shrink-0">
      <div className="flex flex-col items-center w-16 sm:w-20 pt-4 pb-4 space-y-6 bg-card text-card-foreground h-full border-r border-border">
        {/* Logo */}
        <Logo />

        {/* Navigation */}
        <nav className="flex flex-col flex-grow gap-4">
          {links.map(({ to, icon: Icon }) => {
            const isActive = isActiveLink(to);

            return (
              <NavLink key={to} to={to}>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`${
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground"
                  } transition-colors`}
                >
                  <Icon className="h-5 w-5" />
                </Button>
              </NavLink>
            );
          })}
        </nav>

        {/* Avatar */}
        <div className="mt-auto">
          <Avatar
            className="w-9 h-9 sm:w-10 sm:h-10 cursor-pointer"
            onClick={() => navigate("/dashboard")}
          >
            <AvatarImage />
            <AvatarFallback className="bg-gradient-to-r from-primary via-secondary to-accent text-white">
              <UserCog />
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  );
}
