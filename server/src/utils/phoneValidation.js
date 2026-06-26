export const normalizeIndianMobile = (value) =>
  String(value || '').replace(/\D/g, '').slice(0, 10);

export const validateIndianMobile = (value, { required = true, field = 'Mobile number' } = {}) => {
  const digits = normalizeIndianMobile(value);

  if (!digits) {
    return required ? `${field} is required.` : null;
  }

  if (!/^\d{10}$/.test(digits)) {
    return `${field} must be exactly 10 digits.`;
  }

  return null;
};
