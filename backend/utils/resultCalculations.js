export const gradeForPercentage = (percentage) => {
  if (percentage >= 90) return { grade: "O", gradePoint: 10 };
  if (percentage >= 80) return { grade: "A+", gradePoint: 9 };
  if (percentage >= 70) return { grade: "A", gradePoint: 8 };
  if (percentage >= 60) return { grade: "B+", gradePoint: 7 };
  if (percentage >= 50) return { grade: "B", gradePoint: 6 };
  if (percentage >= 40) return { grade: "C", gradePoint: 5 };
  return { grade: "F", gradePoint: 0 };
};

const round = (value, places = 2) => Number(value.toFixed(places));

export const calculateAssessmentResults = (assessment, students) => {
  const marksByStudent = new Map(
    assessment.marks.map((entry) => [entry.studentId, entry.marks])
  );
  const results = students.map((student) => {
    const marks = marksByStudent.get(student.studentId);
    const percentage = marks == null ? 0 : (marks / assessment.maxMarks) * 100;
    const { grade, gradePoint } = gradeForPercentage(percentage);
    return {
      studentId: student.studentId,
      fullName: student.fullName,
      rollNumber: student.rollNumber || student.studentId,
      registrationNumber: student.registrationNumber || String(student._id),
      subjectMarks: marks ?? null,
      maxMarks: assessment.maxMarks,
      totalMarks: marks ?? 0,
      percentage: round(percentage),
      grade,
      gpa: gradePoint,
      status: percentage >= 40 ? "Pass" : "Fail",
      rank: null,
    };
  });
  results.sort((a, b) => b.percentage - a.percentage || a.studentId.localeCompare(b.studentId));
  let previousPercentage = null;
  let previousRank = 0;
  results.forEach((result, index) => {
    if (result.percentage !== previousPercentage) previousRank = index + 1;
    result.rank = previousRank;
    previousPercentage = result.percentage;
  });
  return results;
};

export const calculateSemesterResults = (assessments, students) => {
  const byStudent = new Map(
    students.map((student) => [
      student.studentId,
      {
        studentId: student.studentId,
        fullName: student.fullName,
        rollNumber: student.rollNumber || student.studentId,
        registrationNumber: student.registrationNumber || String(student._id),
        subjects: new Map(),
      },
    ])
  );

  for (const assessment of assessments) {
    const marksByStudent = new Map(
      assessment.marks.map((entry) => [entry.studentId, entry.marks])
    );
    for (const result of byStudent.values()) {
      const subject = result.subjects.get(assessment.subject) || {
        subject: assessment.subject,
        obtained: 0,
        maximum: 0,
        percentageTotal: 0,
        assessments: [],
      };
      const score = marksByStudent.get(result.studentId);
      subject.maximum += assessment.maxMarks;
      if (score != null) {
        subject.obtained += score;
        subject.percentageTotal += (score / assessment.maxMarks) * 100;
      }
      subject.assessments.push({
        title: assessment.title,
        type: assessment.type,
        obtained: score ?? null,
        maximum: assessment.maxMarks,
        percentage: score == null ? null : round((score / assessment.maxMarks) * 100),
        published: assessment.published,
      });
      result.subjects.set(assessment.subject, subject);
    }
  }

  const results = [...byStudent.values()].map((student) => {
    const subjects = [...student.subjects.values()].map((subject) => {
      const percentage = subject.assessments.length
        ? subject.percentageTotal / subject.assessments.length
        : 0;
      const { grade, gradePoint } = gradeForPercentage(percentage);
      return {
        ...subject,
        obtained: round(subject.obtained),
        maximum: round(subject.maximum),
        percentageTotal: undefined,
        percentage: round(percentage),
        grade,
        gradePoint,
        status: percentage >= 40 ? "Pass" : "Fail",
      };
    });
    const percentage = subjects.length
      ? subjects.reduce((total, subject) => total + subject.percentage, 0) / subjects.length
      : 0;
    const gpa = subjects.length
      ? subjects.reduce((total, subject) => total + subject.gradePoint, 0) / subjects.length
      : 0;
    const { grade } = gradeForPercentage(percentage);
    const totalMarks = subjects.reduce((total, subject) => total + subject.obtained, 0);
    const maximumMarks = subjects.reduce((total, subject) => total + subject.maximum, 0);
    return {
      studentId: student.studentId,
      fullName: student.fullName,
      rollNumber: student.rollNumber,
      registrationNumber: student.registrationNumber,
      subjects,
      totalMarks: round(totalMarks),
      maximumMarks: round(maximumMarks),
      percentage: round(percentage),
      gpa: round(gpa),
      grade,
      status: subjects.length && subjects.every((subject) => subject.status === "Pass")
        ? "Pass"
        : "Fail",
      rank: null,
    };
  });

  results.sort((a, b) => b.gpa - a.gpa || b.percentage - a.percentage || a.studentId.localeCompare(b.studentId));
  let previousGpa = null;
  let previousPercentage = null;
  let previousRank = 0;
  results.forEach((result, index) => {
    if (result.gpa !== previousGpa || result.percentage !== previousPercentage) {
      previousRank = index + 1;
    }
    result.rank = previousRank;
    previousGpa = result.gpa;
    previousPercentage = result.percentage;
  });
  return results;
};
