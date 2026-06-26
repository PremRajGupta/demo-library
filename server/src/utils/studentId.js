/**
 * Student display ID format: STU{firstname}_{4-digit-random}
 * Example: STUrimpi_4827, STUamit_1934
 */
export const buildStudentId = (name) => {
  const firstName =
    String(name || '')
      .trim()
      .split(/\s+/)[0]
      .replace(/[^a-zA-Z]/g, '')
      .toLowerCase() || 'student';
  const randomNumber = Math.floor(1000 + Math.random() * 9000);
  return `STU${firstName}_${randomNumber}`;
};

export const generateUniqueStudentId = async (StudentModel, name) => {
  let studentId = buildStudentId(name);
  while (await StudentModel.exists({ studentId })) {
    studentId = buildStudentId(name);
  }
  return studentId;
};
