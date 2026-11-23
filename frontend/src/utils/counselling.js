export const getCounsellingStudentKey = (student) => {
  const identifier =
    student?.studentId ||
    student?.student_id ||
    student?.["Student ID"] ||
    student?._id ||
    student?.id ||
    student?.email;

  return identifier == null ? "" : String(identifier).trim().toLowerCase();
};

export const areSameCounsellingStudent = (firstStudent, secondStudent) => {
  const firstKey = getCounsellingStudentKey(firstStudent);
  return Boolean(firstKey) && firstKey === getCounsellingStudentKey(secondStudent);
};

export const normalizeCounsellingStudents = (students) => {
  const uniqueStudents = new Map();

  students.forEach((student) => {
    const key = getCounsellingStudentKey(student);
    if (!key || !uniqueStudents.has(key)) {
      uniqueStudents.set(key || Symbol(), student);
    }
  });

  return Array.from(uniqueStudents.values());
};
