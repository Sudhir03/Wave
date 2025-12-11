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
    <div className="relative">
      <div className="flex flex-col items-center w-20 pt-4 space-y-6 pb-4 bg-card text-card-foreground relative h-full z-50">
        {/* Top Logo */}
        <Logo />

        {/* Nav Icons */}
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
                  <Icon className="!h-5 !w-5 stroke-current" />
                </Button>
              </NavLink>
            );
          })}
        </nav>

        {/* Avatar at bottom */}
        <div className="mt-auto relative">
          <Avatar
            className="w-10 h-10 rounded cursor-pointer"
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
