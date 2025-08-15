import React from "react";
import { Card } from "@/components/atoms/Card";

export const ChatMessage = ({ user, text }) => {
  return (
    <Card className="p-2">
      <strong>{user}:</strong> {text}
    </Card>
  );
};
