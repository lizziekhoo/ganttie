"use client";

import { useState } from "react";
import { Trash2, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeleteBarProps {
  count: number;
  onDelete: () => void;
  onComplete: () => void;
  visible: boolean;
}

export function DeleteBar({ count, onDelete, onComplete, visible }: DeleteBarProps) {
  const [confirming, setConfirming] = useState(false);

  const handleDeleteClick = () => {
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 3000);
    } else {
      onDelete();
      setConfirming(false);
    }
  };

  if (!visible && confirming) setConfirming(false);

  return (
    <div
      className={cn(
        "fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999]",
        "transition-all duration-300 ease-out",
        visible
          ? "translate-y-0 opacity-100 pointer-events-auto"
          : "translate-y-20 opacity-0 pointer-events-none"
      )}
    >
      <div className="flex items-center gap-3 bg-white border border-neutral-200 rounded-full shadow-2xl shadow-black/15 px-5 py-2.5">
        {/* Count */}
        <span className="text-sm font-medium text-neutral-500 whitespace-nowrap pl-1">
          {count} {count === 1 ? "project" : "projects"} selected
        </span>

        <div className="w-px h-5 bg-neutral-200" />

        {/* Complete button */}
        <button
          onClick={() => { onComplete(); setConfirming(false); }}
          className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold bg-neutral-900 text-white hover:bg-neutral-700 transition-all duration-200 select-none"
        >
          <CheckCheck className="h-4 w-4" />
          <span>Complete</span>
        </button>

        <div className="w-px h-5 bg-neutral-200" />

        {/* Delete button — two-tap confirm */}
        <button
          onClick={handleDeleteClick}
          className={cn(
            "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 select-none",
            confirming
              ? "bg-red-500 text-white hover:bg-red-600 scale-105"
              : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
          )}
        >
          <Trash2 className={cn("h-4 w-4 transition-transform duration-300", confirming ? "rotate-12" : "")} />
          <span>{confirming ? "Confirm delete" : "Delete"}</span>
        </button>

        {/* Cancel — only in confirm state */}
        <div className={cn("transition-all duration-200 overflow-hidden", confirming ? "max-w-[60px] opacity-100" : "max-w-0 opacity-0")}>
          <button
            onClick={() => setConfirming(false)}
            className="text-xs text-neutral-400 hover:text-neutral-700 transition-colors whitespace-nowrap pr-1"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}