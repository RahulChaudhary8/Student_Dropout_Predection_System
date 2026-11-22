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
      onSaved(data);
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
              <FormControl fullWidth size="small">
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
            ) : (
              <Typography color="text.secondary">
                No branches are configured for this course yet.
              </Typography>
            )}
            <Alert severity="info" sx={{ mt: 2 }}>
              Existing subject selections are preserved. Selected branches are assigned to this mentor,
              and matching students are updated.
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
