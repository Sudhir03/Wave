import React from "react";
import { Button } from "../atoms/Button";
import { X } from "lucide-react";

export default function ConfirmationModal({ text, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-card text-card-foreground rounded-xl shadow-2xl p-6 w-96 max-w-full">
        {/* Text */}
        <p className="text-center text-lg font-medium mb-6">{text}</p>

        {/* Buttons */}
        <div className="flex justify-center gap-4">
          <Button
            variant="default"
            className="bg-red-500 hover:bg-red-400 text-white"
            onClick={onConfirm}
          >
            Confirm
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
