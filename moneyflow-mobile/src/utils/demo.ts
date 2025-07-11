/**
 * Simple demonstration of the timezone-aware date utilities
 * Run this in the app to see the timezone functionality
 */

import { formatDate, formatTime, formatISODate, formatFullDate, formatDateTime } from '../utils/dateUtils';
import { getTimezone } from '../utils/config';

export const demonstrateDateUtils = () => {
    const testDate = '2025-07-11T14:30:00.000Z'; // UTC time
    
    console.log('=== Date Utils Demo with Timezone Support ===');
    console.log('Current timezone:', getTimezone());
    console.log('Original UTC date:', testDate);
    console.log('');
    console.log('formatDate():', formatDate(testDate));
    console.log('formatTime():', formatTime(testDate));
    console.log('formatISODate():', formatISODate(new Date(testDate)));
    console.log('formatFullDate():', formatFullDate(testDate));
    console.log('formatDateTime():', formatDateTime(testDate));
    console.log('');
    console.log('Expected: Dates should be in Asia/Manila timezone (+8 hours from UTC)');
    console.log('So 14:30 UTC should become 22:30 (10:30 PM) Manila time');
};
