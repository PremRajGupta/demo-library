export const SHIFT_FEE_MAP: Record<string, number> = {
  '4hours': 300,
  '6hours': 400,
  '8hours': 500,
  '12hours': 500,
  '24hours': 800,
  night: 350,
};

export const OTHER_TIME_SHIFT = 'other';

export const TIME_SHIFT_OPTIONS = [
  { value: '4hours', label: '4 Hours' },
  { value: '6hours', label: '6 Hours' },
  { value: '8hours', label: '8 Hours' },
  { value: '12hours', label: '12 Hours' },
  { value: '24hours', label: '24 Hours' },
  { value: 'night', label: 'Night Shift' },
  { value: OTHER_TIME_SHIFT, label: 'Other Time Shift' },
];

export const isPresetTimeShift = (timeShift?: string) => (
  Boolean(timeShift && timeShift !== OTHER_TIME_SHIFT)
);

export const getFeeForTimeShift = (timeShift?: string) => (
  timeShift ? SHIFT_FEE_MAP[timeShift] || 0 : 0
);

export const getTimeShiftLabel = (timeShift?: string, customShiftHours?: number) => {
  if (timeShift === OTHER_TIME_SHIFT && customShiftHours) {
    return `Other (${customShiftHours} Hours)`;
  }
  return TIME_SHIFT_OPTIONS.find((option) => option.value === timeShift)?.label || timeShift || '-';
};
