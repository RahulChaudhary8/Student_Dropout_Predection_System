import React, { useState, useEffect } from "react";
import AddMentorForm from "./AddMentorForm";
import EditMentorBranchesDialog from "./EditMentorBranchesDialog";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Chip,
  Button,
  IconButton,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Checkbox,
  Alert,
  Tooltip,
  Fade,
  Grow,
} from "@mui/material";
import PersonAddRoundedIcon from "@mui/icons-material/PersonAddRounded";
import ManageAccountsRoundedIcon from "@mui/icons-material/ManageAccountsRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import ToggleOnRoundedIcon from "@mui/icons-material/ToggleOnRounded";
import ToggleOffRoundedIcon from "@mui/icons-material/ToggleOffRounded";
import InboxRoundedIcon from "@mui/icons-material/InboxRounded";

const getCourseId = (assignment) =>
  String(assignment.courseId?._id || assignment.courseId || "");
const getClassKey = (courseId, branch) => JSON.stringify([courseId, branch]);
const getSubjectKey = (courseId, branch, period, subject) =>
  JSON.stringify([courseId, branch, period ?? null, subject]);
const parseKey = (key) => JSON.parse(key);

export default function ManageMentors() {
  const [activeSection, setActiveSection] = useState("table");
  const [mentors, setMentors] = useState([]);
  const [branchDialogOpen, setBranchDialogOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [academicPrograms, setAcademicPrograms] = useState([]);
  const [assignmentDrafts, setAssignmentDrafts] = useState({});
  const [savingAssignmentsId, setSavingAssignmentsId] = useState("");
  const [assignmentError, setAssignmentError] = useState("");

  const handleAddMentor = () => {
    setActiveSection("addMentor");
  };

  const handleMentorAdded = (mentor) => {
    const formatted = {
      _id: mentor._id,
      mentorId: mentor.mentorId,
      name: `${mentor.firstName} ${mentor.lastName}`,
      specialization: mentor.specialization,
      experience: mentor.experience + " years",
      active: mentor.active || true,
      password: mentor.password,
      assignedClasses: mentor.assignedClasses || [],
      subjectAssignments: mentor.subjectAssignments || [],
    };
    setMentors((prev) => [...prev, formatted]);
    setActiveSection("table");
  };

  const handleDeleteMentor = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/mentors/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setMentors((prev) => prev.filter((m) => m._id !== id));
      } else {
        const data = await res.json();
        alert(data.message || "Error deleting mentor");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/mentors/${id}/toggle`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (res.ok) {
        setMentors((prev) =>
          prev.map((m) => (m._id === id ? { ...m, active: !currentStatus } : m))
        );
      } else {
        alert(data.message || "Error updating status");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBranchAssignmentsSaved = (result) => {
    setMentors((previous) =>
      previous.map((mentor) =>
        mentor._id === result.mentor._id
          ? { ...mentor, subjectAssignments: result.mentor.subjectAssignments }
          : mentor
      )
    );
    alert(
      `${result.matchedStudentCount} matching student(s) found; ${result.assignedStudentCount} assignment(s) updated.`
    );
  };

  const getAssignmentValues = (mentor) => {
    const assignments = mentor.subjectAssignments || [];
    return {
      classes: [
        ...new Set(
          assignments.map((assignment) =>
            getClassKey(getCourseId(assignment), assignment.branch)
          )
        ),
      ],
      subjects: [
        ...new Set(
          assignments.flatMap((assignment) =>
            (assignment.subjects || []).map((subject) =>
              getSubjectKey(
                getCourseId(assignment),
                assignment.branch,
                assignment.period,
                subject
              )
            )
          )
        ),
      ],
    };
  };

  const updateAssignmentDraft = (mentor, field, values) => {
    setAssignmentDrafts((current) => {
      const currentValues = current[mentor._id] || getAssignmentValues(mentor);
      if (field === "classes") {
        const selected = new Set(values);
        return {
          ...current,
          [mentor._id]: {
            ...currentValues,
            classes: values,
            subjects: currentValues.subjects.filter((key) => {
              const [courseId, branch] = parseKey(key);
              return selected.has(getClassKey(courseId, branch));
            }),
          },
        };
      }
      return {
        ...current,
        [mentor._id]: { ...currentValues, [field]: values },
      };
    });
  };

  const saveMentorAssignments = async (mentor) => {
    const values = assignmentDrafts[mentor._id] || getAssignmentValues(mentor);
    const classes = new Map(
      values.classes.map((key) => {
        const [courseId, branch] = parseKey(key);
        return [key, { courseId, branch }];
      })
    );
    const grouped = new Map();
    for (const classKey of classes.keys()) {
      const { courseId, branch } = classes.get(classKey);
      grouped.set(getSubjectKey(courseId, branch, null, ""), {
        courseId,
        branch,
        period: null,
        subjects: [],
      });
    }

    for (const key of values.subjects) {
      const [courseId, branch, period, subject] = parseKey(key);
      if (!classes.has(getClassKey(courseId, branch))) continue;
      const groupKey = getSubjectKey(courseId, branch, period, "");
      if (!grouped.has(groupKey)) {
        grouped.set(groupKey, { courseId, branch, period, subjects: [] });
      }
      grouped.get(groupKey).subjects.push(subject);
    }

    setSavingAssignmentsId(mentor._id);
    setAssignmentError("");
    try {
      const response = await fetch(`http://localhost:5000/api/mentors/${mentor._id}/assignments`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ assignments: [...grouped.values()] }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Could not save mentor assignments");
      setMentors((current) =>
        current.map((item) =>
          item._id === mentor._id
            ? {
                ...item,
                subjectAssignments: result.mentor.subjectAssignments,
                assignedClasses: result.mentor.assignedClasses || [],
              }
            : item
        )
      );
      setAssignmentDrafts((current) => {
        const next = { ...current };
        delete next[mentor._id];
        return next;
      });
    } catch (error) {
      console.error("Could not save mentor assignments:", error);
      setAssignmentError(error.message);
    } finally {
      setSavingAssignmentsId("");
    }
  };

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/mentors");
        const data = await res.json();
        const formattedData = data.map((mentor) => ({
          _id: mentor._id,
          mentorId: mentor.mentorId,
          name: `${mentor.firstName} ${mentor.lastName}`,
          specialization: mentor.specialization,
          experience: mentor.experience + " years",
          active: mentor.active,
          password: mentor.password,
          plainPassword: mentor.plainPassword,
          assignedClasses: mentor.assignedClasses || [],
          subjectAssignments: mentor.subjectAssignments || [],
        }));
        setMentors(formattedData);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMentors();

    fetch("http://localhost:5000/api/academics", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Could not load academic courses");
        setAcademicPrograms(data);
      })
      .catch((error) => {
        console.error("Could not load academic courses for mentor assignments:", error);
        setAssignmentError(error.message);
      });
  }, []);

  return (
    <Fade in timeout={450}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
          Mentor Management
        </Typography>

        {/* Action Cards */}
        <Grid container spacing={3} className="mb-6">
          <Grid item xs={12} sm={6}>
            <Grow in timeout={400}>
              <Card
                elevation={0}
                onClick={handleAddMentor}
                className="cursor-pointer transition-all duration-300"
                sx={{
                  border: "1px solid #e2e8f0",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0 12px 24px -8px rgba(15, 23, 42, 0.15)",
                    bgcolor: "#f9fafc",
                  },
                }}
              >
                <CardContent className="flex items-center gap-3">
                  <Avatar sx={{ bgcolor: "primary.main", width: 48, height: 48 }}>
                    <PersonAddRoundedIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Add Mentor
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Add a new mentor to the system.
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grow>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Grow in timeout={500}>
              <Card
                elevation={0}
                onClick={() => setActiveSection("table")}
                className="cursor-pointer transition-all duration-300"
                sx={{
                  border: "1px solid #e2e8f0",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0 12px 24px -8px rgba(15, 23, 42, 0.15)",
                    bgcolor: "#f9fafc",
                  },
                }}
              >
                <CardContent className="flex items-center gap-3">
                  <Avatar sx={{ bgcolor: "secondary.main", width: 48, height: 48 }}>
                    <ManageAccountsRoundedIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Manage Mentors
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      View, edit, or delete mentor details.
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grow>
          </Grid>
        </Grid>

        {activeSection === "addMentor" && (
          <Fade in timeout={400}>
            <Box>
              <AddMentorForm onMentorAdded={handleMentorAdded} />
            </Box>
          </Fade>
        )}

        {/* Mentor Table */}
        {activeSection === "table" && (
          <Fade in timeout={400}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                All Mentors
              </Typography>
              {assignmentError && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setAssignmentError("")}>
                  {assignmentError}
                </Alert>
              )}

              {mentors.length === 0 ? (
                <Grow in timeout={400}>
                  <Card
                    elevation={0}
                    sx={{ border: "1px solid #e2e8f0" }}
                    className="flex flex-col items-center justify-center py-16"
                  >
                    <InboxRoundedIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1.5 }} />
                    <Typography color="text.secondary">No mentors added yet.</Typography>
                  </Card>
                </Grow>
              ) : (
                <Grow in timeout={500}>
                  <Card elevation={0} sx={{ border: "1px solid #e2e8f0" }}>
                    <TableContainer sx={{ maxHeight: 450, overflowY: "auto" }}>
                      <Table stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 700, bgcolor: "#f4f6f9" }}>
                              Mentor ID
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700, bgcolor: "#f4f6f9" }}>
                              Name
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700, bgcolor: "#f4f6f9" }}>
                              Specialization
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700, bgcolor: "#f4f6f9" }}>
                              Experience
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700, bgcolor: "#f4f6f9" }}>
                              Password
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700, bgcolor: "#f4f6f9" }}>
                              Assigned Classes
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700, bgcolor: "#f4f6f9" }}>
                              Assigned Subjects
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700, bgcolor: "#f4f6f9" }}>
                              Status
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700, bgcolor: "#f4f6f9" }} align="right">
                              Action
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {mentors.map((mentor) => {
                            const currentValues = getAssignmentValues(mentor);
                            const values = assignmentDrafts[mentor._id] || currentValues;
                            const classOptions = academicPrograms.flatMap((program) =>
                              (program.branches || []).map((branch) => ({
                                key: getClassKey(program._id, branch.name),
                                label: `${program.name} - ${branch.name}`,
                              }))
                            );
                            const subjectOptions = values.classes.flatMap((classKey) => {
                              const [courseId, branchName] = parseKey(classKey);
                              const program = academicPrograms.find((item) => item._id === courseId);
                              const branch = program?.branches?.find((item) => item.name === branchName);
                              if (!program || !branch) return [];
                              const periods = [
                                null,
                                ...Array.from({ length: Number(program.periodCount || 0) }, (_, index) => index + 1),
                              ];
                              return periods.flatMap((period) =>
                                (branch.subjects || []).map((subject) => {
                                  const key = getSubjectKey(courseId, branchName, period, subject);
                                  const periodLabel = period == null
                                    ? "All periods"
                                    : `${program.studyMode === "semester" ? "Semester" : "Year"} ${period}`;
                                  return {
                                    key,
                                    label: `${program.name} - ${branchName} - ${periodLabel}: ${subject}`,
                                  };
                                })
                              );
                            });
                            const hasChanges =
                              JSON.stringify([...values.classes].sort()) !==
                                JSON.stringify([...currentValues.classes].sort()) ||
                              JSON.stringify([...values.subjects].sort()) !==
                                JSON.stringify([...currentValues.subjects].sort());
                            return (
                            <TableRow
                              key={mentor._id}
                              hover
                              sx={{ "&:hover": { bgcolor: "rgba(37, 99, 235, 0.04)" } }}
                            >
                              <TableCell>{mentor.mentorId}</TableCell>
                              <TableCell>{mentor.name}</TableCell>
                              <TableCell>{mentor.specialization}</TableCell>
                              <TableCell>{mentor.experience}</TableCell>
                              <TableCell>{mentor.plainPassword}</TableCell>
                              <TableCell>
                                <FormControl size="small" sx={{ minWidth: 240, maxWidth: 300 }}>
                                  <InputLabel id={`mentor-classes-${mentor._id}`}>Classes</InputLabel>
                                  <Select
                                    labelId={`mentor-classes-${mentor._id}`}
                                    multiple
                                    value={values.classes}
                                    label="Classes"
                                    disabled={savingAssignmentsId === mentor._id}
                                    onChange={(event) =>
                                      updateAssignmentDraft(mentor, "classes", event.target.value)
                                    }
                                    renderValue={(selected) =>
                                      selected
                                        .map((key) => classOptions.find((option) => option.key === key)?.label || "")
                                        .filter(Boolean)
                                        .join(", ") || "Select classes"
                                    }
                                  >
                                    {classOptions.map((option) => (
                                      <MenuItem key={option.key} value={option.key}>
                                        <Checkbox checked={values.classes.includes(option.key)} />
                                        {option.label}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              </TableCell>
                              <TableCell>
                                <FormControl
                                  size="small"
                                  sx={{ minWidth: 260, maxWidth: 340 }}
                                  disabled={!values.classes.length || savingAssignmentsId === mentor._id}
                                >
                                  <InputLabel id={`mentor-subjects-${mentor._id}`}>Subjects</InputLabel>
                                  <Select
                                    labelId={`mentor-subjects-${mentor._id}`}
                                    multiple
                                    value={values.subjects}
                                    label="Subjects"
                                    onChange={(event) =>
                                      updateAssignmentDraft(mentor, "subjects", event.target.value)
                                    }
                                    renderValue={(selected) =>
                                      selected.length ? `${selected.length} selected` : "Select subjects"
                                    }
                                  >
                                    {subjectOptions.map((option) => (
                                      <MenuItem key={option.key} value={option.key}>
                                        <Checkbox checked={values.subjects.includes(option.key)} />
                                        {option.label}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={mentor.active ? "Active" : "Inactive"}
                                  color={mentor.active ? "success" : "default"}
                                  size="small"
                                  sx={{ fontWeight: 700 }}
                                />
                              </TableCell>
                              <TableCell align="right">
                                <Box className="flex gap-1 justify-end">
                                  {hasChanges && (
                                    <Button
                                      size="small"
                                      variant="contained"
                                      disabled={savingAssignmentsId === mentor._id}
                                      onClick={() => saveMentorAssignments(mentor)}
                                    >
                                      {savingAssignmentsId === mentor._id ? "Saving..." : "Save"}
                                    </Button>
                                  )}
                                  <Tooltip title="Edit assigned branches">
                                    <IconButton
                                      size="small"
                                      color="primary"
                                      onClick={() => {
                                        setSelectedMentor(mentor);
                                        setBranchDialogOpen(true);
                                      }}
                                    >
                                      <EditRoundedIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Delete">
                                    <IconButton
                                      size="small"
                                      color="error"
                                      onClick={() => handleDeleteMentor(mentor._id)}
                                    >
                                      <DeleteRoundedIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title={mentor.active ? "Deactivate" : "Activate"}>
                                    <IconButton
                                      size="small"
                                      color={mentor.active ? "success" : "default"}
                                      onClick={() =>
                                        handleToggleStatus(mentor._id, mentor.active)
                                      }
                                    >
                                      {mentor.active ? (
                                        <ToggleOnRoundedIcon />
                                      ) : (
                                        <ToggleOffRoundedIcon />
                                      )}
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </TableCell>
                            </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Card>
                </Grow>
              )}
            </Box>
          </Fade>
        )}

        <EditMentorBranchesDialog
          open={branchDialogOpen}
          onClose={() => setBranchDialogOpen(false)}
          mentor={selectedMentor}
          onSaved={handleBranchAssignmentsSaved}
        />
      </Box>
    </Fade>
  );
}
