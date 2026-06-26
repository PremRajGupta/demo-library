export const normalizeAadharNumber = (value: string) =>
  String(value || '').replace(/\D/g, '').slice(0, 12);

export const validateAadharNumber = (
  value: string,
  options: { required?: boolean } = {},
): string | null => {
  const { required = true } = options;
  const digits = normalizeAadharNumber(value);

  if (!digits) {
    return required ? 'Aadhaar number is required.' : null;
  }

  if (!/^\d{12}$/.test(digits)) {
    return 'Aadhaar number must be exactly 12 digits.';
  }

  return null;
};
