export const COURSE_OPTIONS = [
  { value: 'class-10', label: '10th' },
  { value: 'class-12', label: '12th' },
  { value: 'undergraduate', label: 'Undergraduate' },
  { value: 'postgraduate', label: 'Postgraduate' },
  { value: 'other', label: 'Other (add custom)' },
] as const;

/** Legacy admission/API values → display labels */
const LEGACY_COURSE_LABELS: Record<string, string> = {
  'UnderGraduate': 'Undergraduate',
  'PostGraduate': 'Postgraduate',
};

export const getCourseLabel = (course?: string | null): string => {
  const raw = String(course || '').trim();
  if (!raw) return '';

  if (LEGACY_COURSE_LABELS[raw]) return LEGACY_COURSE_LABELS[raw];

  const match = COURSE_OPTIONS.find((option) => option.value === raw);
  if (match) return match.label;

  return raw;
};

export const resolveCourseForStorage = (courseValue: string, customCourse?: string): string => {
  if (courseValue === 'other') {
    return String(customCourse || '').trim();
  }
  return getCourseLabel(courseValue);
};

export const getCourseValueFromLabel = (labelOrValue: string): { course: string, customCourse: string } => {
  const raw = String(labelOrValue || '').trim();
  if (!raw) return { course: '', customCourse: '' };

  const match = COURSE_OPTIONS.find(opt => opt.label === raw || opt.value === raw);
  if (match && match.value !== 'other') {
    return { course: match.value, customCourse: '' };
  }

  for (const [legacyVal, legacyLabel] of Object.entries(LEGACY_COURSE_LABELS)) {
    if (raw === legacyLabel || raw === legacyVal) {
      const matchLegacy = COURSE_OPTIONS.find(opt => opt.label === legacyLabel);
      if (matchLegacy && matchLegacy.value !== 'other') {
        return { course: matchLegacy.value, customCourse: '' };
      }
    }
  }

  return { course: 'other', customCourse: raw };
};
