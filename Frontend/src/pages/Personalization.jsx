import React, { useEffect, useState } from "react";
import { Switch } from "@/components/atoms/Switch";

const THEME_KEY = "theme";

function Personalization() {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem(THEME_KEY) === "dark";
  });

  // =======================
  // Apply + persist theme
  // =======================
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem(THEME_KEY, "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem(THEME_KEY, "light");
    }
  }, [isDark]);

  return (
    <div
      className="p-6 space-y-4 rounded-md shadow"
      style={{
        backgroundColor: "var(--card)",
        color: "var(--card-foreground)",
      }}
    >
      <h2 className="text-xl font-bold">Personalization</h2>

      <div className="flex items-center justify-between max-w-sm">
        <span className="font-medium">Dark Theme</span>
        <Switch checked={isDark} onCheckedChange={setIsDark} />
      </div>

      <p className="text-sm text-muted-foreground">
        Selected theme: {isDark ? "Dark" : "Light"}
      </p>
    </div>
  );
}

export default Personalization;
