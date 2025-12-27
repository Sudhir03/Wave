import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatLastSeen(date) {
  if (!date) return "";

  // ✅ Normalize date (string OR number)
  const lastSeenTime =
    typeof date === "number"
      ? date
      : /^\d+$/.test(date)
      ? Number(date)
      : new Date(date).getTime();

  if (Number.isNaN(lastSeenTime)) return "";

  const now = Date.now();

  // ✅ guard against clock skew / future timestamps
  if (lastSeenTime > now) return "just now";

  const diff = now - lastSeenTime;
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);

  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  if (hrs < 24) return `${hrs} hr ago`;
  if (days === 1) return "yesterday";

  return `${days} days ago`;
}
