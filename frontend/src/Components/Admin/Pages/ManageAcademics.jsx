import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";

const API = "http://localhost:5000/api";

const request = async (path, options = {}) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || data.error || "Request failed");
  }
  return data;
};

const assignmentCourseId = (assignment) =>
  String(assignment.courseId?._id || assignment.courseId || "");

export default function ManageAcademics() {
  const [programs, setPrograms] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [courseName, setCourseName] = useState("");
  const [branchDrafts, setBranchDrafts] = useState({});
  const [subjectDrafts, setSubjectDrafts] = useState({});
  const [mentorId, setMentorId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [branchName, setBranchName] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = async () => {
    const [programData, mentorData] = await Promise.all([
      request("/academics"),
      request("/mentors"),
    ]);
    setPrograms(programData);
    setMentors(mentorData);
    setMentorId((current) => current || mentorData[0]?._id || "");
    setCourseId((current) => current || programData[0]?._id || "");
  };

  useEffect(() => {
    loadData().catch((loadError) => setError(loadError.message));
  }, []);

  const selectedProgram = useMemo(
    () => programs.find((program) => program._id === courseId),
    [programs, courseId]
  );
  const availableBranches = selectedProgram?.branches || [];
  const selectedBranch = availableBranches.find((branch) => branch.name === branchName);
  const availableSubjects = selectedBranch?.subjects || [];
  const selectedMentor = mentors.find((mentor) => mentor._id === mentorId);

  useEffect(() => {
    const existing = selectedMentor?.subjectAssignments?.find(
      (assignment) =>
        assignmentCourseId(assignment) === courseId &&
        assignment.branch === branchName
    );
    setSelectedSubjects(existing?.subjects || []);
  }, [selectedMentor, courseId, branchName]);

  const runAction = async (key, action, message) => {
    setError("");
    setSuccess("");
    setBusy(key);
    try {
      const result = await action();
      if (result?.program) {
        setPrograms((current) =>
          current.some((program) => program._id === result.program._id)
            ? current.map((program) =>
                program._id === result.program._id ? result.program : program
              )
            : [...current, result.program].sort((a, b) => a.name.localeCompare(b.name))
        );
      }
      if (result?.mentor) {
        setMentors((current) =>
          current.map((mentor) => (mentor._id === result.mentor._id ? result.mentor : mentor))
        );
      }
      if (result?.mentors) setMentors(result.mentors);
      if (message) setSuccess(message);
      return result;
    } catch (actionError) {
      setError(actionError.message);
      return null;
    } finally {
      setBusy("");
    }
  };

  const addCourse = async (event) => {
    event.preventDefault();
    const name = courseName.trim();
    if (!name) return;
    const result = await runAction(
      "course",
      async () => {
        const program = await request("/academics", {
          method: "POST",
          body: JSON.stringify({ name }),
        });
        return { program };
      },
      "Course added."
    );
    if (result?.program) {
      setCourseName("");
      setCourseId(result.program._id);
      setBranchName("");
    }
  };

  const addBranch = async (program) => {
    const name = (branchDrafts[program._id] || "").trim();
    if (!name) return;
    const result = await runAction(
      `branch-${program._id}`,
      async () => ({
        program: await request(`/academics/${program._id}/branches`, {
          method: "POST",
          body: JSON.stringify({ name }),
        }),
      }),
      "Branch added."
    );
    if (result?.program) {
      setBranchDrafts((current) => ({ ...current, [program._id]: "" }));
    }
  };

  const deleteBranch = async (program, branch) => {
    if (!window.confirm(`Delete ${branch.name} from ${program.name}?`)) return;
    const result = await runAction(
      `branch-${program._id}`,
      async () => ({
        program: await request(`/academics/${program._id}/branches`, {
          method: "DELETE",
          body: JSON.stringify({ name: branch.name }),
        }),
      }),
      "Branch deleted."
    );
    if (result?.program && courseId === program._id && branchName === branch.name) {
      setBranchName("");
    }
  };

  const addSubject = async (program, branch) => {
    const key = `${program._id}:${branch.name}`;
    const name = (subjectDrafts[key] || "").trim();
    if (!name) return;
    const result = await runAction(
      `subject-${key}`,
      async () => ({
        program: await request(`/academics/${program._id}/subjects`, {
          method: "POST",
          body: JSON.stringify({ branch: branch.name, name }),
        }),
      }),
      "Subject added."
    );
    if (result?.program) {
      setSubjectDrafts((current) => ({ ...current, [key]: "" }));
    }
  };

  const deleteSubject = async (program, branch, name) => {
    if (!window.confirm(`Remove ${name} from ${program.name} - ${branch.name}?`)) return;
    await runAction(
      `subject-${program._id}:${branch.name}`,
      async () => {
        const updatedProgram = await request(`/academics/${program._id}/subjects`, {
          method: "DELETE",
          body: JSON.stringify({ branch: branch.name, name }),
        });
        const updatedMentors = await request("/mentors");
        return { program: updatedProgram, mentors: updatedMentors };
      },
      "Subject removed; it was also removed from mentor assignments."
    );
  };

  const saveAssignment = async () => {
    const result = await runAction(
      "assignment",
      async () => ({
        mentor: await request(`/mentors/${mentorId}/subject-assignments`, {
          method: "PATCH",
          body: JSON.stringify({
            courseId,
            branch: branchName,
            subjects: selectedSubjects,
          }),
        }),
      }),
      "Mentor subject assignment saved."
    );
    if (result?.mentor) {
      setMentors((current) =>
        current.map((mentor) => (mentor._id === result.mentor._id ? result.mentor : mentor))
      );
    }
  };

  const toggleSubject = (subject) => {
    setSelectedSubjects((current) =>
      current.includes(subject)
        ? current.filter((item) => item !== subject)
        : [...current, subject]
    );
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
        Courses, Branches & Subjects
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Set up courses and branches, add their subjects, then assign subjects to mentors.
        Use the same course and branch names as student profiles.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Card elevation={0} sx={{ border: "1px solid #e2e8f0", mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Add Course / Program
          </Typography>
          <Box component="form" onSubmit={addCourse} sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
            <TextField
              label="Course name"
              placeholder="e.g. B.Tech"
              value={courseName}
              onChange={(event) => setCourseName(event.target.value)}
              size="small"
              required
              sx={{ minWidth: 260 }}
            />
            <Button type="submit" variant="contained" startIcon={<AddRoundedIcon />} disabled={busy === "course"}>
              Add Course
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
        Academic Catalog
      </Typography>
      {programs.length === 0 ? (
        <Card elevation={0} sx={{ border: "1px solid #e2e8f0", mb: 3 }}>
          <CardContent>
            <Typography color="text.secondary">No courses yet. Add a course to begin.</Typography>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={2} sx={{ mb: 4 }}>
          {programs.map((program) => (
            <Card key={program._id} elevation={0} sx={{ border: "1px solid #e2e8f0" }}>
              <CardContent>
                <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1.5}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{program.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {program.branches.length} branch(es)
                    </Typography>
                  </Box>
                  <Box component="form" onSubmit={(event) => { event.preventDefault(); addBranch(program); }} sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    <TextField
                      label="New branch"
                      placeholder="e.g. CSE"
                      value={branchDrafts[program._id] || ""}
                      onChange={(event) =>
                        setBranchDrafts((current) => ({ ...current, [program._id]: event.target.value }))
                      }
                      size="small"
                      required
                    />
                    <Button type="submit" variant="outlined" startIcon={<AddRoundedIcon />} disabled={busy === `branch-${program._id}`}>
                      Add Branch
                    </Button>
                    <Tooltip title="Delete course">
                      <span>
                        <IconButton
                          color="error"
                          aria-label={`Delete ${program.name}`}
                          onClick={async () => {
                            if (!window.confirm(`Delete course ${program.name}?`)) return;
                            const result = await runAction(
                              `course-${program._id}`,
                              async () => {
                                await request(`/academics/${program._id}`, { method: "DELETE" });
                                return {};
                              },
                              "Course deleted."
                            );
                            if (result) {
                              setPrograms((current) => current.filter((item) => item._id !== program._id));
                              if (courseId === program._id) {
                                setCourseId("");
                                setBranchName("");
                              }
                            }
                          }}
                          disabled={busy === `course-${program._id}`}
                        >
                          <DeleteRoundedIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Box>
                </Stack>

                <Divider sx={{ my: 2 }} />
                {program.branches.length === 0 ? (
                  <Typography color="text.secondary">Add a branch before adding subjects.</Typography>
                ) : (
                  <Grid container spacing={2}>
                    {program.branches.map((branch) => {
                      const subjectKey = `${program._id}:${branch.name}`;
                      return (
                        <Grid item xs={12} md={6} key={branch.name}>
                          <Card variant="outlined" sx={{ height: "100%" }}>
                            <CardContent>
                              <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography sx={{ fontWeight: 700 }}>{branch.name}</Typography>
                                <Tooltip title="Delete branch">
                                  <span>
                                    <IconButton
                                      size="small"
                                      color="error"
                                      aria-label={`Delete ${branch.name} branch`}
                                      onClick={() => deleteBranch(program, branch)}
                                      disabled={busy === `branch-${program._id}`}
                                    >
                                      <DeleteRoundedIcon fontSize="small" />
                                    </IconButton>
                                  </span>
                                </Tooltip>
                              </Stack>
                              <Box
                                component="form"
                                onSubmit={(event) => {
                                  event.preventDefault();
                                  addSubject(program, branch);
                                }}
                                sx={{ display: "flex", gap: 1, mt: 1.5 }}
                              >
                                <TextField
                                  label="Subject name"
                                  value={subjectDrafts[subjectKey] || ""}
                                  onChange={(event) =>
                                    setSubjectDrafts((current) => ({
                                      ...current,
                                      [subjectKey]: event.target.value,
                                    }))
                                  }
                                  size="small"
                                  fullWidth
                                  required
                                />
                                <Button type="submit" variant="outlined" aria-label={`Add subject to ${branch.name}`} disabled={busy === `subject-${subjectKey}`}>
                                  <AddRoundedIcon />
                                </Button>
                              </Box>
                              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 1.5 }}>
                                {branch.subjects.map((subject) => (
                                  <Chip
                                    key={subject}
                                    label={subject}
                                    onDelete={() => deleteSubject(program, branch, subject)}
                                    deleteIcon={<DeleteRoundedIcon />}
                                    disabled={busy === `subject-${subjectKey}`}
                                  />
                                ))}
                                {branch.subjects.length === 0 && (
                                  <Typography variant="body2" color="text.secondary">
                                    No subjects added.
                                  </Typography>
                                )}
                              </Stack>
                            </CardContent>
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>
                )}
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      <Card elevation={0} sx={{ border: "1px solid #e2e8f0" }}>
        <CardContent>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <MenuBookRoundedIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Assign Subjects to Mentor</Typography>
          </Stack>
          {mentors.length === 0 ? (
            <Alert severity="info">Add a mentor before assigning subjects.</Alert>
          ) : programs.length === 0 ? (
            <Alert severity="info">Add a course and branch with subjects first.</Alert>
          ) : (
            <>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    select
                    fullWidth
                    label="Mentor"
                    value={mentorId}
                    onChange={(event) => setMentorId(event.target.value)}
                    SelectProps={{ native: true }}
                    InputLabelProps={{ shrink: true }}
                  >
                    {mentors.map((mentor) => (
                      <option key={mentor._id} value={mentor._id}>
                        {mentor.firstName} {mentor.lastName} ({mentor.mentorId})
                      </option>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    select
                    fullWidth
                    label="Course"
                    value={courseId}
                    onChange={(event) => {
                      setCourseId(event.target.value);
                      setBranchName("");
                    }}
                    SelectProps={{ native: true }}
                    InputLabelProps={{ shrink: true }}
                  >
                    {programs.map((program) => (
                      <option key={program._id} value={program._id}>{program.name}</option>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    select
                    fullWidth
                    label="Branch"
                    value={branchName}
                    onChange={(event) => setBranchName(event.target.value)}
                    disabled={availableBranches.length === 0}
                    SelectProps={{ native: true }}
                    InputLabelProps={{ shrink: true }}
                  >
                    <option value="">Select a branch</option>
                    {availableBranches.map((branch) => (
                      <option key={branch.name} value={branch.name}>{branch.name}</option>
                    ))}
                  </TextField>
                </Grid>
              </Grid>

              {branchName && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                    Subjects for {selectedProgram?.name} - {branchName}
                  </Typography>
                  {availableSubjects.length === 0 ? (
                    <Alert severity="info">Add subjects to this branch in the Academic Catalog first.</Alert>
                  ) : (
                    <Grid container spacing={1}>
                      {availableSubjects.map((subject) => (
                        <Grid item xs={12} sm={6} md={4} key={subject}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={selectedSubjects.includes(subject)}
                                onChange={() => toggleSubject(subject)}
                              />
                            }
                            label={subject}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  )}
                  <Button
                    variant="contained"
                    startIcon={<SaveRoundedIcon />}
                    onClick={saveAssignment}
                    disabled={!mentorId || !courseId || !availableSubjects.length || busy === "assignment"}
                    sx={{ mt: 2 }}
                  >
                    {busy === "assignment" ? "Saving..." : "Save Assignment"}
                  </Button>
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
