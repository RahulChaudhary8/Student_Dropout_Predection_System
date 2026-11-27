import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";

const API = "http://localhost:5000/api";

const assignmentCourseId = (assignment) =>
  String(assignment.courseId?._id || assignment.courseId || "");

export default function EditMentorBranchesDialog({ open, onClose, mentor, onSaved }) {
  const [programs, setPrograms] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [selectedBranches, setSelectedBranches] = useState([]);
  const [subjectBranch, setSubjectBranch] = useState("");
  const [period, setPeriod] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !mentor) return;

    const fetchPrograms = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`${API}/academics`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Failed to load courses");

        setPrograms(data);
        const currentCourseId =
          mentor.subjectAssignments?.[0] &&
          assignmentCourseId(mentor.subjectAssignments[0]);
        setCourseId(
          data.some((program) => program._id === currentCourseId)
            ? currentCourseId
            : data[0]?._id || ""
        );
        const currentBranch = mentor.subjectAssignments?.[0]?.branch || "";
        setSubjectBranch(currentBranch);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, [open, mentor]);

  useEffect(() => {
    if (!open || !courseId || !mentor) {
      setSelectedBranches([]);
      return;
    }

    setSelectedBranches(
      (mentor.subjectAssignments || [])
        .filter((assignment) => assignmentCourseId(assignment) === courseId)
        .map((assignment) => assignment.branch)
    );
  }, [open, courseId, mentor]);

  const selectedProgram = programs.find((program) => program._id === courseId);
  const periodLabel = selectedProgram?.studyMode === "semester" ? "Semester" : "Academic Year";
  const periodCount = Number(selectedProgram?.periodCount || 0);
  const selectedBranch = selectedProgram?.branches?.find(
    (branch) => branch.name === subjectBranch
  );
  const availableSubjects = selectedBranch?.subjects || [];

  useEffect(() => {
    if (!selectedBranches.length) {
      setSubjectBranch("");
      return;
    }
    if (!selectedBranches.includes(subjectBranch)) {
      setSubjectBranch(selectedBranches[0]);
    }
  }, [selectedBranches, subjectBranch]);

  useEffect(() => {
    if (!selectedProgram || !subjectBranch) {
      setPeriod("");
      setSelectedSubjects([]);
      return;
    }
    const existing = mentor?.subjectAssignments?.find(
      (assignment) =>
        assignmentCourseId(assignment) === courseId &&
        assignment.branch === subjectBranch &&
        assignment.period != null
    );
    const nextPeriod =
      existing && Number(existing.period) <= periodCount
        ? String(existing.period)
        : periodCount
          ? "1"
          : "";
    setPeriod(nextPeriod);
  }, [courseId, subjectBranch, selectedProgram, mentor, periodCount]);

  useEffect(() => {
    if (!courseId || !subjectBranch || !period) {
      setSelectedSubjects([]);
      return;
    }
    const existing = mentor?.subjectAssignments?.find(
      (assignment) =>
        assignmentCourseId(assignment) === courseId &&
        assignment.branch === subjectBranch &&
        Number(assignment.period) === Number(period)
    );
    setSelectedSubjects(existing?.subjects || []);
  }, [courseId, subjectBranch, period, mentor]);

  const saveAssignments = async () => {
    if (!courseId) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`${API}/mentors/${mentor._id}/branch-assignments`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ courseId, branches: selectedBranches }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update branches");

      let savedResult = data;
      if (subjectBranch && period) {
        const subjectResponse = await fetch(
          `${API}/mentors/${mentor._id}/subject-assignments`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              courseId,
              branch: subjectBranch,
              period: Number(period),
              subjects: selectedSubjects,
            }),
          }
        );
        const subjectData = await subjectResponse.json();
        if (!subjectResponse.ok) {
          throw new Error(subjectData.message || "Failed to update subjects");
        }
        savedResult = subjectData;
      }

      onSaved(savedResult);
      onClose();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => !saving && onClose()} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 700 }}>
        Edit Assigned Branches {mentor ? `- ${mentor.name}` : ""}
      </DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={28} />
          </Box>
        ) : programs.length === 0 ? (
          <Alert severity="info">Add an academic course and branches before assigning them.</Alert>
        ) : (
          <>
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel id="mentor-branch-course-label">Course</InputLabel>
              <Select
                labelId="mentor-branch-course-label"
                value={courseId}
                label="Course"
                onChange={(event) => setCourseId(event.target.value)}
              >
                {programs.map((program) => (
                  <MenuItem key={program._id} value={program._id}>{program.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            {selectedProgram?.branches.length ? (
              <>
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel id="mentor-branch-select-label">Branches</InputLabel>
                <Select
                  labelId="mentor-branch-select-label"
                  multiple
                  value={selectedBranches}
                  label="Branches"
                  onChange={(event) => setSelectedBranches(event.target.value)}
                  renderValue={(branches) =>
                    branches.length ? branches.join(", ") : "Select branches"
                  }
                >
                  {selectedProgram.branches.map((branch) => (
                    <MenuItem key={branch.name} value={branch.name}>
                      <Checkbox checked={selectedBranches.includes(branch.name)} />
                      {branch.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
                <FormControl fullWidth size="small" sx={{ mb: 2 }} disabled={!selectedBranches.length}>
                  <InputLabel id="mentor-subject-branch-label">Subject Branch</InputLabel>
                  <Select
                    labelId="mentor-subject-branch-label"
                    value={subjectBranch}
                    label="Subject Branch"
                    onChange={(event) => setSubjectBranch(event.target.value)}
                  >
                    {selectedBranches.map((branch) => (
                      <MenuItem key={branch} value={branch}>{branch}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl
                  fullWidth
                  size="small"
                  sx={{ mb: 2 }}
                  disabled={!periodCount || !subjectBranch}
                >
                  <InputLabel id="mentor-period-label">{periodLabel}</InputLabel>
                  <Select
                    labelId="mentor-period-label"
                    value={period}
                    label={periodLabel}
                    onChange={(event) => setPeriod(event.target.value)}
                  >
                    {Array.from({ length: periodCount }, (_, index) => (
                      <MenuItem key={index + 1} value={String(index + 1)}>
                        {periodLabel} {index + 1}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {availableSubjects.length ? (
                  <FormControl fullWidth size="small">
                    <InputLabel id="mentor-subject-select-label">Subjects</InputLabel>
                    <Select
                      labelId="mentor-subject-select-label"
                      multiple
                      value={selectedSubjects}
                      label="Subjects"
                      onChange={(event) => setSelectedSubjects(event.target.value)}
                      renderValue={(subjects) =>
                        subjects.length ? subjects.join(", ") : "Select subjects"
                      }
                    >
                      {availableSubjects.map((subject) => (
                        <MenuItem key={subject} value={subject}>
                          <Checkbox checked={selectedSubjects.includes(subject)} />
                          {subject}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  <Typography color="text.secondary">
                    Add subjects to the selected branch in Courses & Subjects first.
                  </Typography>
                )}
              </>
            ) : (
              <Typography color="text.secondary">
                No branches are configured for this course yet.
              </Typography>
            )}
            <Alert severity="info" sx={{ mt: 2 }}>
              Select the branches, then choose a branch, {periodLabel.toLowerCase()}, and subjects to
              assign. Matching students are updated when assignments are saved.
            </Alert>
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={saving}>Cancel</Button>
        <Button
          variant="contained"
          onClick={saveAssignments}
          disabled={loading || saving || !courseId}
        >
          {saving ? "Saving..." : "Save Branches"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
