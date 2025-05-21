interface CalendarDay {
  date: Date;
  currentMonth: boolean;
}

/**
 * Gets the days to display in a calendar month including overflow days
 * from previous/next months to fill the grid
 */
export function getMonthDays(month: Date): CalendarDay[] {
  const days: CalendarDay[] = [];
  
  // Get the year and month of the current month
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  
  // Find the first day of the month
  const firstDayOfMonth = new Date(year, monthIndex, 1);
  
  // Find what day of the week the first day is
  const firstDayOfWeek = firstDayOfMonth.getDay();
  
  // Fill in days from previous month if needed
  if (firstDayOfWeek > 0) {
    const prevMonthLastDay = new Date(year, monthIndex, 0).getDate();
    
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      days.push({
        date: new Date(year, monthIndex - 1, day),
        currentMonth: false
      });
    }
  }
  
  // Fill in days for the current month
  const daysInMonth = getDaysInMonth(year, monthIndex + 1);
  
  for (let day = 1; day <= daysInMonth; day++) {
    days.push({
      date: new Date(year, monthIndex, day),
      currentMonth: true
    });
  }
  
  // Calculate how many days we need from the next month
  const totalDaysNeeded = 42; // 6 rows of 7 days
  const remainingDays = totalDaysNeeded - days.length;
  
  // Fill in days from next month if needed
  for (let day = 1; day <= remainingDays; day++) {
    days.push({
      date: new Date(year, monthIndex + 1, day),
      currentMonth: false
    });
  }
  
  return days;
}

/**
 * Gets the number of days in a month
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * Formats a date to YYYY-MM-DD string
 */
export function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Checks if a date is a weekend
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
}
