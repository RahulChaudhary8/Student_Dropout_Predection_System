import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateAssessmentResults,
  calculateSemesterResults,
  gradeForPercentage,
} from "../utils/resultCalculations.js";

test("grade bands use the configured 40 percent pass threshold", () => {
  assert.deepEqual(gradeForPercentage(90), { grade: "O", gradePoint: 10 });
  assert.deepEqual(gradeForPercentage(40), { grade: "C", gradePoint: 5 });
  assert.deepEqual(gradeForPercentage(39.99), { grade: "F", gradePoint: 0 });
});

test("test results calculate percentage and competition ranks", () => {
  const assessment = {
    maxMarks: 50,
    marks: [
      { studentId: "ST1", marks: 45 },
      { studentId: "ST2", marks: 45 },
      { studentId: "ST3", marks: 20 },
    ],
  };
  const students = ["ST1", "ST2", "ST3"].map((studentId) => ({
    studentId,
    fullName: studentId,
    _id: studentId,
  }));
  const results = calculateAssessmentResults(assessment, students);

  assert.deepEqual(results.map(({ studentId, rank }) => [studentId, rank]), [
    ["ST1", 1],
    ["ST2", 1],
    ["ST3", 3],
  ]);
  assert.equal(results[2].status, "Pass");
  assert.equal(results[2].percentage, 40);
});

test("semester percentage averages assessment percentages equally", () => {
  const assessments = [
    { subject: "Math", maxMarks: 100, marks: [{ studentId: "ST1", marks: 90 }] },
    { subject: "Math", maxMarks: 10, marks: [{ studentId: "ST1", marks: 5 }] },
  ];
  const results = calculateSemesterResults(assessments, [
    { studentId: "ST1", fullName: "Student", _id: "mongo-id" },
  ]);

  assert.equal(results[0].subjects[0].percentage, 70);
  assert.equal(results[0].gpa, 8);
  assert.equal(results[0].status, "Pass");
});

test("semester result fails when any subject is below the pass mark", () => {
  const assessments = [
    { subject: "Math", maxMarks: 100, marks: [{ studentId: "ST1", marks: 40 }] },
    { subject: "Physics", maxMarks: 100, marks: [{ studentId: "ST1", marks: 39 }] },
  ];
  const [result] = calculateSemesterResults(assessments, [
    { studentId: "ST1", fullName: "Student", _id: "mongo-id" },
  ]);

  assert.equal(result.status, "Fail");
});
