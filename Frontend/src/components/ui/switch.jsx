import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

function Switch({ className, ...props }) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        `
        peer
        inline-flex h-[1.15rem] w-8 items-center rounded-full
        border transition-all shadow-xs outline-none
        focus-visible:ring-[3px] focus-visible:ring-ring/50
        disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer

        data-[state=checked]:bg-primary
        data-[state=checked]:border-primary
        data-[state=unchecked]:bg-muted
        data-[state=unchecked]:border-border
        dark:data-[state=checked]:bg-primary
        dark:data-[state=checked]:border-primary
        dark:data-[state=unchecked]:bg-input/80
        dark:data-[state=unchecked]:border-border
      `,
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          `
          block size-4 rounded-full ring-0 transition-transform
          data-[state=checked]:translate-x-[calc(100%-2px)]
          data-[state=unchecked]:translate-x-0
          bg-card-foreground
          dark:data-[state=checked]:bg-primary-foreground
          dark:data-[state=unchecked]:bg-foreground
          pointer-events-none
          shadow-sm
        `
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
