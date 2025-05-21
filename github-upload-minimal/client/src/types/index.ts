export type WorkType = "office" | "remote" | "annual-leave";

export interface DayEntry {
  workType: WorkType;
  checkinTime?: string;
  checkoutTime?: string;
  annualLeaveHours: number;
  hourlyLeave: number;
  outsideTime: number;
  dinnerMeal: boolean;
  totalHours: number;
  rawHours: number;
  breakDeduction: number;
}
