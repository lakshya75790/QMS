import { OTP_EXPIRES_TIME } from "@/constant";
import { format, isToday, parseISO } from "date-fns";

export const formateTime = (date: string | Date) => {
  return format(typeof date === "string" ? new Date(date) : date, "hh:mm a");
};

export const getExpireTime = () => {
  return new Date(Date.now() + OTP_EXPIRES_TIME);
};

export function formatDate(dateInput: string | Date | null | undefined): string {
  try {
    if (!dateInput) return "N/A";
    const date = typeof dateInput === "string" ? parseISO(dateInput) : dateInput;
    if (isToday(date)) {
      return "Today";
    }
    return format(date, "MMM d, yyyy"); // Example format: "Aug 30, 2024"
  } catch (error) {
    console.error(error);
    console.error("Invalid date string:", dateInput);
    return "Invalid date";
  }
}

export const isValidDate = (value: unknown): boolean =>
  !isNaN(new Date(value as string).getTime());

export const formatDateTime = (date: Date | string): string => {
  // Combine both date and time in one string
  const formattedDateTime = format(typeof date === "string" ? new Date(date) : date, "yyyy-MM-dd HH:mm");

  return formattedDateTime;
};

export const formateReadableDateTime = (dateString: string | Date | null | undefined) => {
  if (!dateString) return "N/A";
  return format(new Date(dateString), "PPP 'at' p"); // e.g., "April 29, 2023 at 3:30 PM"
};

export const calendarDateFormat = (date: string | Date) => format(typeof date === "string" ? new Date(date) : date, "PPP");

export function formatSearchDate(dateString: string | Date | null | undefined): string {
  try {
    if (!dateString) return "N/A";
    const date = typeof dateString === "string" ? parseISO(dateString) : dateString;
    if (isToday(date)) {
      return "Today";
    }
    return format(date, "MMM d, yyyy"); // Example format: "Aug 30, 2024"
  } catch (error) {
    console.error(error);
    console.error("Invalid date string:", dateString);
    return "Invalid date";
  }
}
