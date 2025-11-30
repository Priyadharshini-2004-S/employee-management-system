// Calculate attendance status based on check-in time
export const calculateStatus = (checkInTime, expectedCheckInHour = 9) => {
  if (!checkInTime) {
    return 'absent';
  }

  const checkIn = new Date(checkInTime);
  const checkInHour = checkIn.getHours();
  const checkInMinutes = checkIn.getMinutes();
  const checkInTimeInMinutes = checkInHour * 60 + checkInMinutes;
  const expectedTimeInMinutes = expectedCheckInHour * 60;

  // If checked in after 9:00 AM, mark as late
  if (checkInTimeInMinutes > expectedTimeInMinutes) {
    return 'late';
  }

  return 'present';
};

// Calculate total hours worked
export const calculateTotalHours = (checkInTime, checkOutTime) => {
  if (!checkInTime || !checkOutTime) {
    return 0;
  }

  const checkIn = new Date(checkInTime);
  const checkOut = new Date(checkOutTime);
  const diffInMs = checkOut - checkIn;
  const diffInHours = diffInMs / (1000 * 60 * 60);

  return Math.round(diffInHours * 100) / 100; // Round to 2 decimal places
};

// Check if date is today
export const isToday = (date) => {
  const today = new Date();
  const checkDate = new Date(date);
  return (
    checkDate.getDate() === today.getDate() &&
    checkDate.getMonth() === today.getMonth() &&
    checkDate.getFullYear() === today.getFullYear()
  );
};

// Get start and end of day
export const getStartOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const getEndOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

// Get start and end of month
export const getStartOfMonth = (date = new Date()) => {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const getEndOfMonth = (date = new Date()) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1);
  d.setDate(0);
  d.setHours(23, 59, 59, 999);
  return d;
};

