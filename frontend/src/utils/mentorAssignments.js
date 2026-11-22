export const getMentorsForStudentGroup = (
  mentors,
  courseName,
  branchName,
  academicPrograms,
  period
) => {
  if (!courseName || courseName === "Not Provided") return [];

  const course = String(courseName).trim().toLowerCase();
  const branch = String(branchName || "").trim().toLowerCase();
  const activeMentors = mentors.filter((mentor) => mentor.active !== false);
  if (!branch) {
    return activeMentors.filter((mentor) =>
      String(mentor.specialization || "").toLowerCase().includes(course)
    );
  }

  const program = academicPrograms.find(
    (item) => item.name.trim().toLowerCase() === course
  );
  const matchesBranch = (assignment) => {
    const assignedCourse =
      assignment.courseId?.name || assignment.courseId?.[0]?.name || "";
    const assignedCourseId = assignment.courseId?._id || assignment.courseId || "";
    const matchesCourse = program
      ? String(assignedCourseId) === String(program._id)
      : String(assignedCourse).trim().toLowerCase() === course;
    return matchesCourse && String(assignment.branch || "").trim().toLowerCase() === branch;
  };
  const branchMentors = activeMentors.filter((mentor) =>
    (mentor.subjectAssignments || []).some(matchesBranch)
  );

  if (period !== undefined && period !== null && period !== "") {
    const periodMentors = branchMentors.filter((mentor) =>
      (mentor.subjectAssignments || []).some((assignment) => {
        return (
          matchesBranch(assignment) &&
          Number(assignment.period) === Number(period)
        );
      })
    );
    if (periodMentors.length) return periodMentors;
  }

  return branchMentors.filter((mentor) =>
    (mentor.subjectAssignments || []).some(
      (assignment) => matchesBranch(assignment) && assignment.period == null
    )
  );
};
