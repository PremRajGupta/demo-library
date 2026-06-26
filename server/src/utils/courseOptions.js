export const COURSE_OPTIONS = [
  { value: 'class-10', label: '10th' },
  { value: 'class-12', label: '12th' },
  { value: 'undergraduate', label: 'Undergraduate' },
  { value: 'postgraduate', label: 'Postgraduate' },
  { value: 'other', label: 'Other (add custom)' },
];

const LEGACY_COURSE_LABELS = {
  UnderGraduate: 'Undergraduate',
  PostGraduate: 'Postgraduate',
};

export const getCourseLabel = (course) => {
  const raw = String(course || '').trim();
  if (!raw) return '';
  if (LEGACY_COURSE_LABELS[raw]) return LEGACY_COURSE_LABELS[raw];
  const match = COURSE_OPTIONS.find((option) => option.value === raw);
  if (match) return match.label;
  return raw;
};

export const resolveCourseForStorage = (courseValue, customCourse) => {
  if (courseValue === 'other') {
    return String(customCourse || '').trim();
  }
  return getCourseLabel(courseValue);
};
