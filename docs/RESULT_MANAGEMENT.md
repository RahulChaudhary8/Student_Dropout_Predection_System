# Student Result Management

## What is implemented

The result module is integrated into the existing React/MUI application:

- Admin: Admin Panel → Academic Results
- Mentor: Mentor Dashboard → Academic Results
- Student: Student Panel → Academic Results

Mentors can create subject assessments, enter/edit marks, clear a mark and save, preview test ranks, publish a test, and review class semester results. Excel `.xlsx`/`.xls` upload accepts rows containing a Student ID (or Roll Number) and Marks (or Score). Imported values remain editable until saved.

Admins can review and unlock published assessment/semester results. Students can see their published semester history, final CGPA, grade, status, remarks, and use the browser print dialog to print or save a marksheet as PDF.

## Database collections

- `assessments`: course, branch, academic period, subject, assessment type, date, maximum marks, per-student marks, publication state and creator.
- `semesterpublications`: published/locked state for one course, branch and period.
- `promotions`: immutable record of a student's previous and next semester.
- `auditlogs`: actor, role, action, entity and event details for result-management changes.
- `students`: existing student profile, with optional roll/registration numbers and appended `academicHistory` on promotion.

`AcademicProgram` remains the source of truth for courses, branches, subjects, study mode and period count. Result calculation is derived from assessment records; draft results recalculate when marks change. Publishing locks the affected records and snapshots the class roster so later enrolment changes do not rewrite historical ranks.

## API

All endpoints are mounted under `/api/results` and require a bearer JWT.

| Method | Path | Purpose |
|---|---|---|
| GET | `/options` | Courses/branches allowed for the current admin or mentor |
| GET | `/cohort?courseId=&branch=&period=` | Roster, assessments, preview results and publication state |
| GET | `/assessments?courseId=&branch=&period=` | List class-period assessments |
| POST | `/assessments` | Create an assessment |
| PUT | `/assessments/:id` | Update assessment details before publication |
| DELETE | `/assessments/:id` | Delete a draft assessment and its marks |
| PUT | `/assessments/:id/marks` | Replace/update the draft marks list |
| GET | `/assessments/:id/results` | Generate a selected-test result preview |
| POST | `/assessments/:id/publish` | Publish and lock a complete test result |
| POST | `/assessments/:id/unlock` | Admin-only test unlock, if the semester is not published |
| GET | `/semester` | Generate class semester-result preview |
| POST | `/semester/publish` | Publish semester result and lock its assessments |
| POST | `/semester/unlock` | Admin-only semester unlock |
| POST | `/promote/:studentId` | Promote a passing student to the next semester |
| GET | `/mine` | Student-only published result history and final result |
| GET | `/audit?limit=` | Admin-only recent audit events |

Mentor write access is checked against assigned course, branch, period and subject. Students can only access `/mine`; unpublished results are not returned there.

## Calculation policy

The initial policy is equal assessment weighting and a 40% pass line:

- Assessment percentage = marks ÷ maximum marks × 100.
- Subject percentage = arithmetic mean of that subject's assessment percentages.
- Subject grade points: O (90+) = 10; A+ (80+) = 9; A (70+) = 8; B+ (60+) = 7; B (50+) = 6; C (40+) = 5; F (<40) = 0.
- Semester percentage = arithmetic mean of subject percentages.
- Semester GPA = arithmetic mean of subject grade points.
- Semester status is Pass only when every subject is at least 40%.
- Rank uses descending GPA then percentage, with competition ranking for ties.
- Final percentage and CGPA are arithmetic means across published periods; final status is Pass only when every published period passes.

This is a conventional baseline, not a configurable institutional grading policy. Confirm local regulations before using it for official transcripts.

## Promotion and history

Promotion is currently supported for semester-based programs. The server requires a published semester result, a pass in every subject, and a valid next period. It appends the completed period to `Student.academicHistory`, updates the student's current semester, and writes a `Promotion` record. Earlier assessments and published results remain queryable as history.

## Project layout

```text
backend/
  models/Assessment.js
  models/SemesterPublication.js
  models/Promotion.js
  models/AuditLog.js
  routes/resultRoutes.js
  utils/resultCalculations.js
  test/resultCalculations.test.js
frontend/src/Components/pages/Grades/
  ResultManagement.jsx
```

## Current UI/export scope

The UI uses the project's installed MUI components and Recharts. The assessment and semester screens include course/branch/period selectors, class tables, performance charts, Excel mark import, and browser print-to-PDF.

MUI DataGrid Pro, Redux Toolkit, React Query, React Hook Form, server-generated PDF, QR verification, institution logo/photo/signature configuration, notification delivery and assessment-weight configuration are not added. DataGrid Pro is a separately licensed dependency; these were not silently substituted with another package.

## Validation

Run backend calculation tests with `cd backend && npm test`. Frontend production build is `cd frontend && npm run build`.
