import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatFileSize(bytes) {
  if (bytes === 0 || bytes == null) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(k)),
    sizes.length - 1
  );

  const value = bytes / Math.pow(k, i);

  return `${value % 1 === 0 ? value : value.toFixed(2)} ${sizes[i]}`;
}
