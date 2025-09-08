import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

export default function ProfileDropdown({ open, setOpen }) {
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
        event.stopPropagation();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div className="fixed inset-0  z-40">
      <div
        ref={dropdownRef}
        onClick={(e) => e.stopPropagation()}
        className="absolute bottom-10 left-10 z-[1000] w-48 divide-y divide-border overflow-hidden rounded-md border border-border bg-popover shadow-lg"
      >
        <Link to="/dashboard" onClick={() => setOpen(false)}>
          <div className="flex items-center gap-x-2 px-4 py-3 text-sm text-popover-foreground hover:bg-muted hover:text-foreground cursor-pointer transition-colors">
            Dashboard
          </div>
        </Link>
        <div
          onClick={() => setOpen(false)}
          className="flex items-center gap-x-2 px-4 py-3 text-sm text-popover-foreground hover:bg-muted hover:text-foreground cursor-pointer transition-colors"
        >
          Logout
        </div>
      </div>
    </div>
  );
}
