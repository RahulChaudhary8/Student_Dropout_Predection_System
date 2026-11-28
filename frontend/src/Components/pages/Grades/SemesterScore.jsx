import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Fade,
  LinearProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SchoolIcon from "@mui/icons-material/School";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

const semesterOptions = {
  1: ["Sem1", "Sem2"],
  2: ["Sem3", "Sem4"],
  3: ["Sem5", "Sem6"],
  4: ["Sem7", "Sem8"],
};

const SemesterScore = ({ students = [], goBack }) => {
  const [scoreData, setScoreData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(1);
  const [selectedSem, setSelectedSem] = useState("Sem1");
  const [academicPrograms, setAcademicPrograms] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setScoreData(
      students.map((s) => ({
        studentId: s.studentId || s.student_id || "",
        fullName: s.fullName || s.name || s.studentName || "",
        courseApplied: s.courseApplied || s.course || "",
        branchSpecialization: s.branchSpecialization || s.branch || "",
        Sem1: s.Sem1 || "", Sem2: s.Sem2 || "",
        Sem3: s.Sem3 || "", Sem4: s.Sem4 || "",
        Sem5: s.Sem5 || "", Sem6: s.Sem6 || "",
        Sem7: s.Sem7 || "", Sem8: s.Sem8 || "",
      }))
    );
  }, [students]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("http://localhost:5000/api/academics", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      .then((response) => setAcademicPrograms(response.data))
      .catch((error) => console.error("Could not load academic options:", error));
  }, []);

  const handleChange = (studentId, sem, value) => {
    if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
      const updated = [...scoreData];
      const scoreIndex = updated.findIndex((student) => student.studentId === studentId);
      if (scoreIndex >= 0) updated[scoreIndex][sem] = value;
      setScoreData(updated);
    }
  };

  const handleYearChange = (_, val) => {
    if (!val) return;
    setSelectedYear(val);
    setSelectedSem(semesterOptions[val][0]);
  };

  const handleSave = () => {
    if (!selectedCourse || !selectedBranch || !selectedSubject) {
      alert("Please select Course, Branch and Subject before saving.");
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    console.log("Saved:", {
      course: selectedCourse,
      branch: selectedBranch,
      subject: selectedSubject,
      semester: selectedSem,
      scores: visibleRows,
    });
  };

  const selectedProgram = academicPrograms.find(
    (program) => program.name.toLowerCase() === selectedCourse.toLowerCase()
  );
  const branchOptions = selectedProgram?.branches || [];
  const selectedBranchData = branchOptions.find(
    (branch) => branch.name.toLowerCase() === selectedBranch.toLowerCase()
  );
  const subjectOptions = selectedBranchData?.subjects || [];
  const visibleRows = scoreData.filter((student) => {
    const courseMatches =
      !selectedCourse ||
      student.courseApplied.toLowerCase() === selectedCourse.toLowerCase();
    const branchMatches =
      !selectedBranch ||
      student.branchSpecialization.toLowerCase() === selectedBranch.toLowerCase();
    return courseMatches && branchMatches;
  });

  // Progress
  const filledCount = visibleRows.filter((s) => s[selectedSem] !== "").length;
  const progress = visibleRows.length > 0 ? (filledCount / visibleRows.length) * 100 : 0;

  const getScoreChip = (marks) => {
    const v = parseFloat(marks);
    if (isNaN(v)) return null;
    if (v >= 75) return { label: "Good", color: "#dcfce7", text: "#15803d" };
    if (v >= 50) return { label: "Average", color: "#fef9c3", text: "#a16207" };
    return { label: "Low", color: "#fee2e2", text: "#b91c1c" };
  };

  return (
    <Box className="min-h-screen bg-slate-50 p-4 md:p-6">
      <Paper
        elevation={0}
        sx={{ borderRadius: 3, border: "1px solid #e2e8f0", overflow: "hidden", backgroundColor: "#fff" }}
      >
        {/* ── Header ── */}
        <Box
          className="flex items-center justify-between px-5 py-4"
          sx={{ borderBottom: "1px solid #e2e8f0", backgroundColor: "#f8fafc" }}
        >
          {goBack && (
            <Tooltip title="Go back" arrow TransitionComponent={Fade}>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={goBack}
                variant="outlined"
                size="small"
                sx={{
                  borderColor: "#cbd5e1", color: "#475569", borderRadius: 2,
                  textTransform: "none", fontWeight: 600,
                  "&:hover": { borderColor: "#94a3b8", backgroundColor: "#f1f5f9" },
                }}
              >
                Back
              </Button>
            </Tooltip>
          )}

          <Box className="flex items-center gap-2">
            <SchoolIcon sx={{ color: "#6366f1", fontSize: 22 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#0f172a" }}>
              Student Semester Scores
            </Typography>
          </Box>

          <Button
            startIcon={saved ? <CheckCircleIcon /> : <SaveIcon />}
            onClick={handleSave}
            variant="contained"
            size="small"
            sx={{
              borderRadius: 2, textTransform: "none", fontWeight: 600, minWidth: 100,
              backgroundColor: saved ? "#22c55e" : "#6366f1",
              "&:hover": { backgroundColor: saved ? "#16a34a" : "#4f46e5" },
              transition: "background-color 0.3s ease",
            }}
          >
            {saved ? "Saved!" : "Save All"}
          </Button>
        </Box>

        <Box className="p-5 flex flex-col gap-5">
          {/* ── Year + Semester Selector ── */}
          <Paper
            elevation={0}
            sx={{ p: 2.5, borderRadius: 2, border: "1px solid #e2e8f0", backgroundColor: "#fafafa" }}
          >
            <Box className="flex flex-wrap items-center gap-4">
              {/* Year Toggle */}
              <Box className="flex flex-col gap-1">
                <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600, letterSpacing: 0.4 }}>
                  YEAR
                </Typography>
                <ToggleButtonGroup
                  value={selectedYear}
                  exclusive
                  onChange={handleYearChange}
                  size="small"
                  sx={{
                    "& .MuiToggleButton-root": {
                      borderRadius: "8px !important",
                      border: "1px solid #e2e8f0 !important",
                      px: 2, py: 0.6,
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      color: "#64748b",
                      textTransform: "none",
                      mx: 0.3,
                      "&.Mui-selected": {
                        backgroundColor: "#6366f1",
                        color: "#fff",
                        borderColor: "#6366f1 !important",
                        "&:hover": { backgroundColor: "#4f46e5" },
                      },
                    },
                  }}
                >
                  {[1, 2, 3, 4].map((y) => (
                    <ToggleButton key={y} value={y}>
                      Year {y}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Box>

              {/* Divider */}
              <Box sx={{ height: 36, width: "1px", backgroundColor: "#e2e8f0" }} />

              {/* Semester Toggle */}
              <Box className="flex flex-col gap-1">
                <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600, letterSpacing: 0.4 }}>
                  SEMESTER
                </Typography>
                <ToggleButtonGroup
                  value={selectedSem}
                  exclusive
                  onChange={(_, val) => val && setSelectedSem(val)}
                  size="small"
                  sx={{
                    "& .MuiToggleButton-root": {
                      borderRadius: "8px !important",
                      border: "1px solid #e2e8f0 !important",
                      px: 2.5, py: 0.6,
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      color: "#64748b",
                      textTransform: "none",
                      mx: 0.3,
                      "&.Mui-selected": {
                        backgroundColor: "#e0e7ff",
                        color: "#4338ca",
                        borderColor: "#a5b4fc !important",
                      },
                    },
                  }}
                >
                  {semesterOptions[selectedYear].map((sem) => (
                    <ToggleButton key={sem} value={sem}>
                      {sem}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Box>

              {/* Course, Branch and Subject */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, minmax(0, 1fr))",
                    lg: "repeat(3, minmax(0, 1fr))",
                  },
                  gap: 1,
                  minWidth: { lg: 620 },
                }}
              >
                <TextField
                  select
                  size="small"
                  label="Course"
                  value={selectedCourse}
                  onChange={(event) => {
                    setSelectedCourse(event.target.value);
                    setSelectedBranch("");
                    setSelectedSubject("");
                  }}
                  SelectProps={{ native: true }}
                >
                  <option value="">All courses</option>
                  {academicPrograms.map((program) => (
                    <option key={program._id} value={program.name}>{program.name}</option>
                  ))}
                </TextField>

                <TextField
                  select
                  size="small"
                  label="Branch"
                  value={selectedBranch}
                  disabled={!selectedCourse}
                  onChange={(event) => {
                    setSelectedBranch(event.target.value);
                    setSelectedSubject("");
                  }}
                  SelectProps={{ native: true }}
                >
                  <option value="">All branches</option>
                  {branchOptions.map((branch) => (
                    <option key={branch.name} value={branch.name}>{branch.name}</option>
                  ))}
                </TextField>

                <TextField
                  select
                  size="small"
                  label="Subject"
                  value={selectedSubject}
                  disabled={!selectedBranch}
                  onChange={(event) => setSelectedSubject(event.target.value)}
                  SelectProps={{ native: true }}
                >
                  <option value="">Select subject</option>
                  {subjectOptions.map((subject) => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </TextField>
              </Box>

              {/* Active badge */}
              <Box className="flex items-center gap-1 ml-auto">
                <CalendarTodayIcon sx={{ fontSize: 14, color: "#94a3b8" }} />
                <Chip
                  label={`Year ${selectedYear} · ${selectedSem}`}
                  size="small"
                  sx={{
                    backgroundColor: "#ede9fe", color: "#6d28d9",
                    fontWeight: 700, fontSize: "0.75rem", height: 24,
                  }}
                />
              </Box>
            </Box>
          </Paper>

          {/* ── Progress + Table ── */}
          <Box>
            <Box className="flex items-center justify-between mb-1">
              <Typography variant="subtitle2" sx={{ color: "#334155", fontWeight: 700 }}>
                Enter Marks — {selectedSem}
              </Typography>
              <Typography variant="caption" sx={{ color: "#64748b" }}>
                {filledCount} / {visibleRows.length} filled
              </Typography>
            </Box>

            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 5, borderRadius: 3, mb: 2, backgroundColor: "#e2e8f0",
                "& .MuiLinearProgress-bar": {
                  backgroundColor: progress === 100 ? "#22c55e" : "#6366f1",
                  borderRadius: 3, transition: "background-color 0.4s ease",
                },
              }}
            />

            <TableContainer
              component={Paper}
              elevation={0}
              sx={{ border: "1px solid #e2e8f0", borderRadius: 2, overflow: "hidden" }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f1f5f9" }}>
                    {[
                      "Student ID",
                      "Name",
                      "Course",
                      "Branch",
                      "Subject",
                      `Marks (${selectedSem})`,
                    ].map((h) => (
                      <TableCell
                        key={h}
                        sx={{ fontWeight: 700, color: "#334155", fontSize: "0.8rem", py: 1.5, borderBottom: "1.5px solid #e2e8f0" }}
                      >
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {visibleRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} sx={{ textAlign: "center", py: 4, color: "#94a3b8", fontStyle: "italic" }}>
                        No students match the selected Course and Branch.
                      </TableCell>
                    </TableRow>
                  ) : (
                    visibleRows.map((s, idx) => {
                      const chip = getScoreChip(s[selectedSem]);
                      return (
                        <TableRow
                          key={idx}
                          sx={{
                            backgroundColor: idx % 2 === 0 ? "#fff" : "#fafafa",
                            "&:hover": { backgroundColor: "#f1f5f9" },
                            transition: "background-color 0.15s ease",
                          }}
                        >
                          <TableCell sx={{ fontSize: "0.82rem", color: "#64748b", py: 1 }}>
                            {s.studentId || "-"}
                          </TableCell>
                          <TableCell sx={{ fontSize: "0.85rem", fontWeight: 600, color: "#1e293b", py: 1 }}>
                            {s.fullName || "-"}
                          </TableCell>
                          <TableCell sx={{ py: 1 }}>
                            <Chip
                              label={s.courseApplied || "-"}
                              size="small"
                              sx={{ backgroundColor: "#ede9fe", color: "#6d28d9", fontWeight: 600, fontSize: "0.72rem", height: 22 }}
                            />
                          </TableCell>
                          <TableCell sx={{ py: 1 }}>
                            <Chip
                              label={s.branchSpecialization || "-"}
                              size="small"
                              sx={{ backgroundColor: "#e0f2fe", color: "#0369a1", fontWeight: 600, fontSize: "0.72rem", height: 22 }}
                            />
                          </TableCell>
                          <TableCell sx={{ py: 1 }}>
                            <Chip
                              label={selectedSubject || "-"}
                              size="small"
                              sx={{ backgroundColor: "#fef3c7", color: "#92400e", fontWeight: 600, fontSize: "0.72rem", height: 22 }}
                            />
                          </TableCell>
                          <TableCell sx={{ py: 1 }}>
                            <Box className="flex items-center gap-2">
                              <TextField
                                type="text"
                                value={s[selectedSem]}
                                onChange={(e) => handleChange(s.studentId, selectedSem, e.target.value)}
                                placeholder="—"
                                size="small"
                                inputProps={{ inputMode: "decimal" }}
                                sx={{
                                  width: 110,
                                  "& .MuiOutlinedInput-root": {
                                    borderRadius: 2, fontSize: "0.85rem",
                                    "& fieldset": { borderColor: "#e2e8f0" },
                                    "&:hover fieldset": { borderColor: "#6366f1" },
                                    "&.Mui-focused fieldset": { borderColor: "#6366f1" },
                                  },
                                }}
                              />
                              {chip && (
                                <Chip
                                  label={chip.label}
                                  size="small"
                                  sx={{ backgroundColor: chip.color, color: chip.text, fontWeight: 700, fontSize: "0.7rem", height: 22 }}
                                />
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default SemesterScore;