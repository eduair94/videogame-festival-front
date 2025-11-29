import { format, formatDistanceToNow, isAfter, isBefore, parseISO } from 'date-fns';

export function formatDate(dateString?: string): string {
  if (!dateString) return 'TBA';
  try {
    const date = parseISO(dateString);
    return format(date, 'MMM d, yyyy');
  } catch {
    return dateString;
  }
}

export function formatDateRange(start?: string, end?: string, raw?: string): string {
  if (raw && !start && !end) return raw;
  
  if (start && end) {
    const startDate = formatDate(start);
    const endDate = formatDate(end);
    if (startDate === endDate) return startDate;
    return `${startDate} - ${endDate}`;
  }
  
  if (start) return `From ${formatDate(start)}`;
  if (end) return `Until ${formatDate(end)}`;
  if (raw) return raw;
  
  return 'TBA';
}

export function getTimeUntil(dateString?: string): string {
  if (!dateString) return '';
  try {
    const date = parseISO(dateString);
    if (isBefore(date, new Date())) return 'Ended';
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return '';
  }
}

export function isSubmissionOpen(submissionDates?: { start?: string; end?: string }): boolean {
  if (!submissionDates?.start || !submissionDates?.end) return false;
  
  try {
    const now = new Date();
    const start = parseISO(submissionDates.start);
    const end = parseISO(submissionDates.end);
    
    return isAfter(now, start) && isBefore(now, end);
  } catch {
    return false;
  }
}

export function isEventUpcoming(eventDates?: { start?: string; end?: string }): boolean {
  if (!eventDates?.start) return false;
  
  try {
    const now = new Date();
    const start = parseISO(eventDates.start);
    return isAfter(start, now);
  } catch {
    return false;
  }
}

export function isEventOngoing(eventDates?: { start?: string; end?: string }): boolean {
  if (!eventDates?.start || !eventDates?.end) return false;
  
  try {
    const now = new Date();
    const start = parseISO(eventDates.start);
    const end = parseISO(eventDates.end);
    
    return isAfter(now, start) && isBefore(now, end);
  } catch {
    return false;
  }
}

export function getDaysUntilDeadline(submissionDates?: { end?: string }): number | null {
  if (!submissionDates?.end) return null;
  try {
    const date = parseISO(submissionDates.end);
    const now = new Date();
    if (isBefore(date, now)) return null;
    const diffTime = date.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch {
    return null;
  }
}

export function getDeadlineUrgency(submissionDates?: { end?: string }): 'critical' | 'soon' | 'upcoming' | 'normal' | null {
  const days = getDaysUntilDeadline(submissionDates);
  if (days === null) return null;
  if (days <= 3) return 'critical';
  if (days <= 7) return 'soon';
  if (days <= 14) return 'upcoming';
  return 'normal';
}

export function formatDeadline(submissionDates?: { end?: string }): string {
  if (!submissionDates?.end) return '';
  const days = getDaysUntilDeadline(submissionDates);
  if (days === null) return 'Ended';
  if (days === 0) return 'Today!';
  if (days === 1) return 'Tomorrow!';
  if (days <= 7) return `${days} days left`;
  return formatDate(submissionDates.end);
}

export function getEventStartDate(eventDates?: { start?: string }): Date | null {
  if (!eventDates?.start) return null;
  try {
    return parseISO(eventDates.start);
  } catch {
    return null;
  }
}

export function getSubmissionEndDate(submissionDates?: { end?: string }): Date | null {
  if (!submissionDates?.end) return null;
  try {
    return parseISO(submissionDates.end);
  } catch {
    return null;
  }
}

