import React, { useState, useEffect } from "react";
import { Switch } from "@/components/atoms/Switch";

function Personalization() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
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
      <div className="flex items-center gap-4">
        <span>Dark Theme</span>
        <Switch checked={isDark} onCheckedChange={setIsDark} />
      </div>
      <p className="text-sm text-muted-foreground">
        Selected theme: {isDark ? "Dark" : "Light"}
      </p>
    </div>
  );
}

export default Personalization;
