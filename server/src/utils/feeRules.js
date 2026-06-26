export const SHIFT_FEE_MAP = {
  '4hours': 300,
  '6hours': 400,
  '8hours': 500,
  '12hours': 500,
  '24hours': 800,
  night: 350
};

export const getFeeForTimeShift = (timeShift) => (
  timeShift ? SHIFT_FEE_MAP[timeShift] || 0 : 0
);
