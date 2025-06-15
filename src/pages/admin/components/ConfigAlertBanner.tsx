
import React from "react";
import { AlertCircle } from "lucide-react";

export function ConfigAlertBanner({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="bg-yellow-100 text-yellow-900 p-3 rounded mb-3 flex items-center gap-2 border border-yellow-300 animate-fade-in">
      <AlertCircle size={19} /> <span className="font-semibold">{message}</span>
    </div>
  );
}
