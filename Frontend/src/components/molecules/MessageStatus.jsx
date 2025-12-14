import { Check, CheckCheck, Clock, XCircle } from "lucide-react";

export function MessageStatus({ status }) {
  if (status === "sending")
    return <Clock className="w-4 h-4 text-muted-foreground" />;

  if (status === "sent")
    return <Check className="w-4 h-4 text-muted-foreground" />;

  if (status === "delivered")
    return <CheckCheck className="w-4 h-4 text-muted-foreground" />;

  if (status === "read")
    return <CheckCheck className="w-4 h-4 text-blue-600" />;

  if (status === "failed") return <XCircle className="w-4 h-4 text-red-500" />;

  return null;
}
