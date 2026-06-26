const MONGO_OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;

export const getStudentDisplayId = (entity = {}) => {
  const displayId = String(entity.studentDisplayId || '').trim();
  if (displayId && !MONGO_OBJECT_ID_PATTERN.test(displayId)) {
    return displayId;
  }

  const studentId = String(entity.studentId || '').trim();
  if (!studentId || MONGO_OBJECT_ID_PATTERN.test(studentId)) {
    return '';
  }

  return studentId;
};
