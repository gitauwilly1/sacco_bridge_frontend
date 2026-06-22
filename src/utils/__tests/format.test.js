import { describe, it, expect } from 'vitest';
import {
  formatKES,
  formatDate,
  formatDateTime,
  formatTimeAgo,
  formatPhone,
  getInitials,
  truncate,
} from '../format';

describe('format utilities', () => {
  it('formatKES should format Kenyan Shillings correctly', () => {
    expect(formatKES(1000)).toBe('KSh 1,000.00');
    expect(formatKES(null)).toBe('KSh 0.00');
    expect(formatKES(undefined)).toBe('KSh 0.00');
    expect(formatKES(0)).toBe('KSh 0.00');
    expect(formatKES(1234567.89)).toBe('KSh 1,234,567.89');
  });

  it('formatDate should format to Kenyan locale date or return empty string', () => {
    expect(formatDate(null)).toBe('');
    expect(formatDate(undefined)).toBe('');
    expect(formatDate('')).toBe('');
    
    const formatted = formatDate('2026-06-22');
    expect(formatted).toContain('2026');
    expect(formatted).toContain('Jun');
  });

  it('formatTimeAgo should format relative time or fallback to formatDate', () => {
    expect(formatTimeAgo(null)).toBe('');
    expect(formatTimeAgo(undefined)).toBe('');

    const now = new Date();
    
    // Just now (< 60s)
    const justNowStr = now.toISOString();
    expect(formatTimeAgo(justNowStr)).toBe('Just now');

    // Minutes ago (< 3600s)
    const fiveMinsAgo = new Date(now.getTime() - 5 * 60 * 1000).toISOString();
    expect(formatTimeAgo(fiveMinsAgo)).toBe('5m ago');

    // Hours ago (< 86400s)
    const threeHoursAgo = new Date(now.getTime() - 3 * 3600 * 1000).toISOString();
    expect(formatTimeAgo(threeHoursAgo)).toBe('3h ago');

    // Days ago (< 604800s)
    const twoDaysAgo = new Date(now.getTime() - 2 * 86400 * 1000).toISOString();
    expect(formatTimeAgo(twoDaysAgo)).toBe('2d ago');

    // Fallback (> 7 days)
    const tenDaysAgo = new Date(now.getTime() - 10 * 86400 * 1000).toISOString();
    expect(formatTimeAgo(tenDaysAgo)).toContain('2026');
  });

  it('formatPhone should normalize phone numbers', () => {
    expect(formatPhone('0712345678')).toBe('0712345678');
    expect(formatPhone('+254712345678')).toBe('+254712345678');
    expect(formatPhone('254712345678')).toBe('0712345678');
    expect(formatPhone('0712 345 678')).toBe('0712345678');
    expect(formatPhone(null)).toBe('');
  });

  it('getInitials should return initials of first and last name', () => {
    expect(getInitials('Jane', 'Doe')).toBe('JD');
    expect(getInitials('jane', 'doe')).toBe('JD');
    expect(getInitials('Jane', '')).toBe('J');
    expect(getInitials('', 'Doe')).toBe('D');
    expect(getInitials('', '')).toBe('?');
  });

  it('truncate should truncate strings to max length with ellipsis', () => {
    expect(truncate('hello world', 5)).toBe('hello...');
    expect(truncate('hello', 10)).toBe('hello');
    expect(truncate(null)).toBe('');
    expect(truncate(undefined)).toBe('');
  });
});
