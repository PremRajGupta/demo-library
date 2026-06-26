export const normalizeIndianMobile = (value: string) =>
  String(value || '').replace(/\D/g, '').slice(0, 10);

export const validateIndianMobile = (
  value: string,
  options: { required?: boolean; field?: string } = {}
): string | null => {
  const { required = true, field = 'Mobile number' } = options;
  const digits = normalizeIndianMobile(value);

  if (!digits) {
    return required ? `${field} is required.` : null;
  }

  if (!/^\d{10}$/.test(digits)) {
    return `${field} must be exactly 10 digits.`;
  }

  return null;
};
