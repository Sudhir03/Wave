import { useState } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/atoms/Button";
import { MoreHorizontal } from "lucide-react";

export function MoreOptionsPopover({ options = [] }) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="p-2">
          <MoreHorizontal className="w-5 h-5" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-40 flex flex-col p-1">
        {options.map((opt, idx) => {
          const IconComponent = opt.icon?.component;
          const iconProps = opt.icon?.props || {};

          return (
            <button
              key={idx}
              onClick={() => {
                opt.onClick();
                setOpen(false);
              }}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-md hover:bg-gray-100 text-sm text-foreground"
            >
              {IconComponent && (
                <IconComponent
                  size={iconProps.size || 16}
                  color={iconProps.color || "currentColor"}
                  {...iconProps}
                />
              )}
              <span>{opt.label}</span>
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
