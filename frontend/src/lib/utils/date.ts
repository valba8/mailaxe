import { format, isToday, isYesterday, isThisWeek, isThisYear, isSameWeek, isSameMonth, isSameYear, subWeeks } from 'date-fns'
import { get } from 'svelte/store'
import { _, locale } from '$lib/i18n'
import { getDateFnsLocale } from '$lib/i18n/dateFnsLocale'

/**
 * Format a date relative to now for message list display
 * - < 1 minute: "just now"
 * - < 1 hour: "Xm"
 * - < 24 hours: "Xh"
 * - Yesterday: "Yesterday"
 * - This week: "Monday", "Tuesday", etc.
 * - This year: "Dec 15"
 * - Older: "Dec 15, 2023"
 */
export function formatRelativeDate(date: Date): string {
  const t = get(_)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

  if (diffMinutes < 1) {
    return t('date.justNow')
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}m`
  }

  if (diffHours < 24 && isToday(date)) {
    return `${diffHours}h`
  }

  if (isYesterday(date)) {
    return t('date.yesterday')
  }

  if (isThisWeek(date)) {
    return format(date, 'EEEE')
  }

  if (isThisYear(date)) {
    return format(date, 'MMM d')
  }

  return format(date, 'MMM d, yyyy')
}

/**
 * Format a date for message header display
 * Shows full date and time
 */
export function formatMessageDate(date: Date): string {
  const t = get(_)

  if (isToday(date)) {
    return t('date.todayAt', { values: { time: format(date, 'h:mm a') } })
  }

  if (isYesterday(date)) {
    return t('date.yesterdayAt', { values: { time: format(date, 'h:mm a') } })
  }

  if (isThisYear(date)) {
    return format(date, 'MMM d \'at\' h:mm a')
  }

  return format(date, 'MMM d, yyyy \'at\' h:mm a')
}

/**
 * Format a date for full display (tooltips, etc.)
 */
export function formatFullDate(date: Date): string {
  return format(date, 'EEEE, MMMM d, yyyy \'at\' h:mm:ss a')
}

export interface DateGroup {
  key: string
  label: string
}

/**
 * Message list date group for a conversation date: Today, Yesterday, This
 * week, Last week, This month, then one group per month ("October", or
 * "October 2025" for other years). Weeks start on the UI locale's first day.
 */
export function getDateGroup(date: Date, now: Date = new Date()): DateGroup {
  const t = get(_)
  const dfLocale = getDateFnsLocale(get(locale) || 'en')
  const weekOpts = { locale: dfLocale }

  if (isToday(date)) return { key: 'today', label: t('dateGroup.today') }
  if (isYesterday(date)) return { key: 'yesterday', label: t('dateGroup.yesterday') }
  if (isSameWeek(date, now, weekOpts)) return { key: 'thisWeek', label: t('dateGroup.thisWeek') }
  if (isSameWeek(date, subWeeks(now, 1), weekOpts)) return { key: 'lastWeek', label: t('dateGroup.lastWeek') }
  if (isSameMonth(date, now)) return { key: 'thisMonth', label: t('dateGroup.thisMonth') }

  const pattern = isSameYear(date, now) ? 'LLLL' : 'LLLL yyyy'
  const month = format(date, pattern, { locale: dfLocale })
  return {
    key: format(date, 'yyyy-MM'),
    label: month.charAt(0).toLocaleUpperCase() + month.slice(1),
  }
}
