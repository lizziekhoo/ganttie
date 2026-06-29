"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function FullscreenCalendar() {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString("default", { month: "long" });

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () =>
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const startOffset = (firstDayOfMonth + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells: { day: number; currentMonth: boolean; date: Date }[] = [];

  for (let i = startOffset - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    cells.push({ day, currentMonth: false, date: new Date(year, month - 1, day) });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, currentMonth: true, date: new Date(year, month, d) });
  }
  const remaining = 7 - (cells.length % 7);
  if (remaining < 7) {
    for (let d = 1; d <= remaining; d++) {
      cells.push({ day: d, currentMonth: false, date: new Date(year, month + 1, d) });
    }
  }

  const isToday = (date: Date) =>
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const totalRows = cells.length / 7;

  return (
    <div className="flex flex-col h-full p-6 md:p-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold tracking-tight">
          {monthName} {year}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-sm font-medium rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors text-neutral-700"
          >
            Today
          </button>
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 text-neutral-600" />
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors"
          >
            <ChevronRight className="h-4 w-4 text-neutral-600" />
          </button>
        </div>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_LABELS.map((label) => (
          <div
            key={label}
            className="text-xs font-medium uppercase tracking-wider text-neutral-400 text-center py-2"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div
        className="grid grid-cols-7 flex-1 border-l border-t border-neutral-100"
        style={{ gridTemplateRows: `repeat(${totalRows}, minmax(0, 1fr))` }}
      >
        {cells.map((cell, idx) => (
          <div
            key={idx}
            className={cn(
              "border-r border-b border-neutral-100 p-2 transition-colors cursor-pointer",
              cell.currentMonth
                ? "bg-white hover:bg-neutral-50"
                : "bg-neutral-50/50"
            )}
          >
            <span
              className={cn(
                "inline-flex items-center justify-center w-7 h-7 text-sm rounded-full font-medium transition-colors",
                isToday(cell.date)
                  ? "bg-black text-white"
                  : cell.currentMonth
                  ? "text-neutral-800"
                  : "text-neutral-300"
              )}
            >
              {cell.day}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}