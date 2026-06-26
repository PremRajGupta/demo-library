const MONGO_OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;
const DISPLAY_STUDENT_ID_PATTERN = /^STU[a-z]+_\d{4}$/;

/** Fee section / receipts use display IDs like STUrahul_4827 — never MongoDB _id. */
export const getStudentDisplayId = (entity: {
  studentId?: string | null;
  studentDisplayId?: string | null;
}): string => {
  const displayId = String(entity.studentDisplayId || '').trim();
  if (displayId && !MONGO_OBJECT_ID_PATTERN.test(displayId)) {
    return displayId;
  }

  const studentId = String(entity.studentId || '').trim();
  if (!studentId) return '';

  if (MONGO_OBJECT_ID_PATTERN.test(studentId)) return '';

  return studentId;
};

export const isDisplayStudentId = (value?: string | null): boolean =>
  DISPLAY_STUDENT_ID_PATTERN.test(String(value || '').trim());
