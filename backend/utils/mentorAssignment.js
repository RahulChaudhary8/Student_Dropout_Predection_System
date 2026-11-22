import AcademicProgram from "../models/AcademicProgram.js";
import Mentor from "../models/Mentor.js";

const assignmentCounters = new Map();

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const exactTextPattern = (value) =>
  new RegExp(`^\\s*${escapeRegex(String(value).trim())}\\s*$`, "i");

export const findMentorsForStudentGroup = async (courseName, branchName, period) => {
  const course = String(courseName || "").trim();
  const branch = String(branchName || "").trim();
  if (!course || course === "Not Provided") return [];

  if (branch) {
    const program = await AcademicProgram.findOne({ name: exactTextPattern(course) });
    if (!program) return [];

    const matchingBranch = program.branches.find(
      (item) => item.name.toLowerCase() === branch.toLowerCase()
    );
    if (!matchingBranch) return [];

    const assignmentMatch = {
      courseId: program._id,
      branch: exactTextPattern(matchingBranch.name),
    };
    if (Number.isInteger(Number(period)) && Number(period) > 0) {
      const periodMentors = await Mentor.find({
        active: true,
        subjectAssignments: {
          $elemMatch: { ...assignmentMatch, period: Number(period) },
        },
      }).sort({ _id: 1 });
      if (periodMentors.length) return periodMentors;
    }

    return Mentor.find({
      active: true,
      subjectAssignments: {
        $elemMatch: {
          ...assignmentMatch,
          $or: [{ period: null }, { period: { $exists: false } }],
        },
      },
    }).sort({ _id: 1 });
  }

  return Mentor.find({
    active: true,
    specialization: { $regex: escapeRegex(course), $options: "i" },
  }).sort({ _id: 1 });
};

export const selectMentorForStudentGroup = (courseName, branchName, mentors, period) => {
  if (!mentors.length) return null;

  const groupKey = `${String(courseName).trim().toLowerCase()}::${String(branchName || "")
    .trim()
    .toLowerCase()}::${period || ""}`;
  const lastIndex = assignmentCounters.get(groupKey) ?? -1;
  const nextIndex = (lastIndex + 1) % mentors.length;
  assignmentCounters.set(groupKey, nextIndex);
  return mentors[nextIndex];
};
