import { WorkType } from "@/types";

interface TimeCalculationInput {
  workType: WorkType;
  checkinTime?: string;
  checkoutTime?: string;
  annualLeaveHours?: number;
  hourlyLeave?: number;
  outsideTime: number;
  dinnerMeal?: boolean;
}

interface CalculatedHours {
  rawHours: number;
  breakDeduction: number;
  outsideTimeHours: number;
  dinnerMealDeduction?: number;
  totalHours: number;
}

/**
 * Calculates working hours based on the given inputs
 */
export function calculateWorkHours(input: TimeCalculationInput): CalculatedHours {
  const {
    workType,
    checkinTime = "09:00",
    checkoutTime = "17:00",
    annualLeaveHours = 8,
    hourlyLeave = 0,
    outsideTime = 0,
    dinnerMeal = false
  } = input;

  // For annual leave, use the leave hours value
  if (workType === "annual-leave") {
    return {
      rawHours: annualLeaveHours,
      breakDeduction: 0,
      outsideTimeHours: 0,
      totalHours: annualLeaveHours
    };
  }

  // Parse times manually to avoid timezone issues
  const [checkinHours, checkinMinutes] = checkinTime.split(":").map(Number);
  const [checkoutHours, checkoutMinutes] = checkoutTime.split(":").map(Number);
  
  // Calculate total minutes for both times
  const checkinTotalMinutes = checkinHours * 60 + checkinMinutes;
  let checkoutTotalMinutes = checkoutHours * 60 + checkoutMinutes;
  
  // Handle working past midnight
  if (checkoutTotalMinutes <= checkinTotalMinutes) {
    checkoutTotalMinutes += 24 * 60; // Add 24 hours in minutes
  }
  
  // Calculate the difference in hours
  const rawHours = (checkoutTotalMinutes - checkinTotalMinutes) / 60;

  // Apply break deduction if check-in is before noon
  const breakDeduction = checkinHours < 12 ? 1 : 0;

  // Convert outside time from minutes to hours
  const outsideTimeHours = outsideTime / 60;
  
  // Apply dinner meal deduction (30 minutes = 0.5 hours)
  const dinnerMealDeduction = dinnerMeal ? 0.5 : 0;

  // Calculate total working hours, including hourly leave and dinner meal deduction
  const workHours = Math.max(0, rawHours - breakDeduction - outsideTimeHours - dinnerMealDeduction);
  const totalHours = workHours + hourlyLeave;

  return {
    rawHours,
    breakDeduction,
    outsideTimeHours,
    dinnerMealDeduction,
    totalHours
  };
}

/**
 * Parses a time string (HH:MM) to a decimal hour value
 */
export function parseTimeToHours(timeString: string): number {
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours + minutes / 60;
}

/**
 * Formats a decimal hour value to a time string (HH:MM)
 */
export function formatHoursToTime(hours: number): string {
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  return `${wholeHours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

/**
 * Formats a 24-hour time string (HH:MM) to a 12-hour time string with AM/PM
 */
export function formatTimeTo12Hour(timeString: string): string {
  if (!timeString) return "";
  
  const [hour, minute] = timeString.split(":");
  const hourNum = parseInt(hour);
  const ampm = hourNum >= 12 ? "PM" : "AM";
  const hour12 = hourNum % 12 || 12; // Convert to 12-hour format
  
  return `${hour12}:${minute} ${ampm}`;
}

/**
 * Formats hours in HH:MM time notation format
 */
export function formatHoursWithLabel(hours: number): string {
  if (hours === 0) return "0:00";
  
  // Convert decimal hours to hours and minutes
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  
  // Handle case where minutes calculation rounds up to 60
  if (minutes === 60) {
    return `${wholeHours + 1}:00`;
  }
  
  // Format as HH:MM
  return `${wholeHours}:${minutes.toString().padStart(2, '0')}`;
}
