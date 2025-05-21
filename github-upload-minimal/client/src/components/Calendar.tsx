import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayEntry } from "@/types";
import { getDaysInMonth, getMonthDays } from "@/lib/utils/date";
import { formatHoursWithLabel } from "@/lib/utils/time";

interface CalendarProps {
  currentMonth: Date;
  entries: Record<string, DayEntry>;
  onDateClick: (date: string) => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

export default function Calendar({
  currentMonth,
  entries,
  onDateClick,
  onPreviousMonth,
  onNextMonth,
  onToday,
}: CalendarProps) {
  const monthDays = getMonthDays(currentMonth);
  const formattedMonth = currentMonth.toLocaleDateString("ko-KR", {
    month: "long",
    year: "numeric",
  });
  
  const today = new Date();
  const isToday = (date: Date) => {
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Calendar Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={onPreviousMonth}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-semibold text-gray-900">{formattedMonth}</h2>
          <Button variant="ghost" size="icon" onClick={onNextMonth}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            className="text-primary-700 bg-primary-100 hover:bg-primary-200 border-transparent"
            onClick={onToday}
          >
            오늘
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
            <div key={day} className="py-2 text-center text-sm text-gray-500 font-medium">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 bg-white">
          {monthDays.map((day) => {
            const dateStr = day.date.toISOString().split('T')[0];
            const entry = entries[dateStr];
            const isCurrentMonth = day.currentMonth;
            
            // Determine CSS classes based on day type
            let dayClasses = "border-b border-r border-gray-200 p-2 min-h-[100px] transition-all duration-200";
            
            if (!isCurrentMonth) {
              dayClasses += " bg-gray-50 cursor-not-allowed";
            } else {
              dayClasses += " calendar-day cursor-pointer hover:bg-gray-50 hover:-translate-y-0.5";
              if (isToday(day.date)) {
                dayClasses += " bg-gray-100";
              }
            }

            return (
              <div
                key={dateStr}
                className={dayClasses}
                onClick={() => isCurrentMonth && onDateClick(dateStr)}
              >
                <div className={`text-right ${isToday(day.date) ? "font-bold" : ""} ${!isCurrentMonth ? "text-gray-400" : ""}`}>
                  {day.date.getDate()}
                </div>
                
                {isCurrentMonth && entry ? (
                  <>
                    <div className="mt-1 flex flex-col gap-1">
                      {/* Color-coded work type indicator with no text */}
                      <div 
                        className={`h-3 rounded ${
                          entry.workType === "office" ? "bg-blue-400" : 
                          entry.workType === "remote" ? "bg-green-400" : 
                          "bg-amber-400"
                        }`}
                      />
                      
                      {/* Show hourly leave info without labels */}
                      {entry.hourlyLeave > 0 && entry.workType !== "annual-leave" && (
                        <div className="text-xs text-gray-700 font-medium">
                          {`+${entry.hourlyLeave}`}
                        </div>
                      )}
                    </div>
                    <div className="mt-1 text-xs font-medium">
                      {formatHoursWithLabel(entry.totalHours)}
                    </div>
                  </>
                ) : null}
                

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
