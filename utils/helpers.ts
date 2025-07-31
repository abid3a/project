/**
 * Utility functions for the TBDC Horizon application
 * This file contains common helper functions used throughout the app
 */

import { Session, Meeting, Connection } from '@/types';

/**
 * Format a date to a readable string
 * @param date - Date to format
 * @param options - Formatting options
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }
): string {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString('en-US', options);
}

/**
 * Format a time to a readable string
 * @param date - Date to format
 * @param options - Formatting options
 * @returns Formatted time string
 */
export function formatTime(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }
): string {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleTimeString('en-US', options);
}

/**
 * Format duration in hours and minutes
 * @param duration - Duration in hours (number) or time string (e.g., "3:00")
 * @returns Formatted duration string
 */
export function formatDuration(duration: number | string): string {
  if (typeof duration === 'number') {
    if (duration >= 1) {
      return `${duration} hour${duration !== 1 ? 's' : ''}`;
    } else if (duration > 0) {
      return `${Math.round(duration * 60)} min`;
    } else {
      return '0 min';
    }
  } else if (typeof duration === 'string') {
    // Handle 'H:MM' or 'M:SS' format
    const [hours, minutes] = duration.split(':').map(Number);
    if (hours && hours > 0 && (!minutes || minutes === 0)) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    } else if (hours && hours > 0 && minutes && minutes > 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} min`;
    } else if ((!hours || hours === 0) && minutes && minutes > 0) {
      return `${minutes} min`;
    } else {
      return '0 min';
    }
  }
  return '';
}

/**
 * Get a greeting based on the current time
 * @returns Greeting string
 */
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
}

/**
 * Get today's date as a formatted string
 * @returns Formatted date string
 */
export function getDateString(): string {
  const today = new Date();
  return today.toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
}

/**
 * Generate a random ID of specified length
 * @param length - Length of the ID
 * @returns Random ID string
 */
export function generateRandomId(length = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Check if a date is in the future
 * @param date - Date to check
 * @returns True if date is in the future
 */
export function isFutureDate(date: Date | string): boolean {
  const d = date instanceof Date ? date : new Date(date);
  return d > new Date();
}

/**
 * Sort items by date (ascending)
 * @param items - Array of items with date property
 * @returns Sorted array
 */
export function sortByDate<T extends { date: Date | string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const dateA = a.date instanceof Date ? a.date : new Date(a.date);
    const dateB = b.date instanceof Date ? b.date : new Date(b.date);
    return dateA.getTime() - dateB.getTime();
  });
}

/**
 * Get unique values from an array
 * @param array - Array to get unique values from
 * @returns Array of unique values
 */
export function getUniqueValues<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

/**
 * Filter items by type
 * @param items - Array of items with type property
 * @param type - Type to filter by
 * @returns Filtered array
 */
export function filterByType<T extends { type: string }>(items: T[], type: string): T[] {
  return items.filter(item => item.type === type);
}

/**
 * Get unique types from an array of items
 * @param items - Array of items with type property
 * @returns Array of unique types
 */
export function getUniqueTypes(items: { type: string }[]): string[] {
  const types = items.map(item => item.type);
  return getUniqueValues(types);
}

/**
 * Capitalize the first letter of a string
 * @param str - String to capitalize
 * @returns Capitalized string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Truncate text to a specified length
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Debounce a function
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle a function
 * @param func - Function to throttle
 * @param limit - Time limit in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Safe JSON parse with fallback
 * @param json - JSON string to parse
 * @param fallback - Fallback value if parsing fails
 * @returns Parsed object or fallback
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

/**
 * Check if a value is null or undefined
 * @param value - Value to check
 * @returns True if value is null or undefined
 */
export function isNullOrUndefined(value: any): value is null | undefined {
  return value === null || value === undefined;
}

/**
 * Check if a value is empty (null, undefined, empty string, empty array, empty object)
 * @param value - Value to check
 * @returns True if value is empty
 */
export function isEmpty(value: any): boolean {
  if (isNullOrUndefined(value)) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
} 