import { TZDate } from "@date-fns/tz"
import { format, parseISO } from "date-fns"

/**
 * Format a timestamp to a long date format (e.g., "Monday, January 15, 2024")
 * @param timestamp - ISO timestamp string
 * @param timezone - IANA timezone string (e.g., 'America/New_York')
 * @returns Formatted date string
 */
export const formatLongDate = (timestamp: string, timezone: string): string => {
  const date = parseISO(timestamp)
  const tzDate = new TZDate(date, timezone)
  return format(tzDate, "EEEE, MMMM d, yyyy")
}

/**
 * Format a timestamp to a short date format (e.g., "Mon, Jan 15")
 * @param timestamp - ISO timestamp string
 * @param timezone - IANA timezone string
 * @returns Formatted date string
 */
export const formatShortDate = (timestamp: string, timezone: string): string => {
  const date = parseISO(timestamp)
  const tzDate = new TZDate(date, timezone)
  return format(tzDate, "EEE, MMM d")
}

/**
 * Format a timestamp in the game's original timezone (e.g., "2:30 PM EST")
 * @param timestamp - ISO timestamp string
 * @param timezone - IANA timezone string (e.g., 'America/New_York')
 * @returns Formatted time string with timezone abbreviation
 */
export const formatGameTime = (timestamp: string, timezone: string): string => {
  const date = parseISO(timestamp)
  const tzDate = new TZDate(date, timezone)
  return format(tzDate, "h:mm a zzz")
}

/**
 * Format full date and time in the game's timezone
 * @param timestamp - ISO timestamp string
 * @param timezone - IANA timezone string
 * @returns Formatted date and time string
 */
export const formatGameDateTime = (timestamp: string, timezone: string): string => {
  const date = parseISO(timestamp)
  const tzDate = new TZDate(date, timezone)
  return format(tzDate, "EEE, MMM d 'at' h:mm a zzz")
}

/**
 * Get the user's current timezone from browser
 * @returns IANA timezone string (e.g., 'America/New_York')
 */
export const getUserTimezone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}
