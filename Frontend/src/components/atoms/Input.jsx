import { Input as ShadInput } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const Input = ({ className, ...props }) => {
  return (
    <ShadInput
      className={cn(
        "bg-background text-foreground border border-border px-3 py-1 text-sm rounded-md " +
          "focus-visible:border-2 focus-visible:border-border focus-visible:ring-0 focus-visible:outline-none shadow-none " +
          "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
};
