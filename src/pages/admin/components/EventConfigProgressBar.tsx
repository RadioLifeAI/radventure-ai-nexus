
import React from "react";
import { cn } from "@/lib/utils";
export function EventConfigProgressBar({ percent }: { percent: number }) {
  return (
    <div className="h-2 w-full bg-gray-200 rounded overflow-hidden mb-2">
      <div className={cn(
        "h-full transition-all bg-gradient-to-r from-sky-400 to-indigo-600",
        percent >= 100 && "rounded"
      )}
        style={{ width: percent + "%" }} />
    </div>
  );
}
