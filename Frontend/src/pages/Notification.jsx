import React, { useState } from "react";
import { Switch } from "@/components/atoms/Switch"; // Adjust the import path as needed

function Notification() {
  const [isEnabled, setIsEnabled] = useState(true);

  const toggleNotification = () => {
    setIsEnabled((prev) => !prev);
  };

  return (
    <div
      className="p-6 space-y-4 rounded-md shadow"
      style={{
        backgroundColor: "var(--card)",
        color: "var(--card-foreground)",
      }}
    >
      <h2 className="text-xl font-bold">Notification Settings</h2>
      <div className="flex items-center gap-4">
        <span>Enable Notifications</span>
        <Switch checked={isEnabled} onCheckedChange={toggleNotification} />
      </div>
      <p className="text-sm text-muted-foreground">
        Notifications are {isEnabled ? "enabled" : "disabled"}.
      </p>
    </div>
  );
}

export default Notification;
