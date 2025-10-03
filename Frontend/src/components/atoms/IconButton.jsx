import { cn } from "@/lib/utils";
import { Button } from "@/components/atoms/Button";

export const IconButton = ({ icon: Icon, className, ...props }) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("rounded-full p-2 hover:bg-muted", className)}
      {...props}
    >
      <Icon className="h-5 w-5 text-foreground" />
    </Button>
  );
};
