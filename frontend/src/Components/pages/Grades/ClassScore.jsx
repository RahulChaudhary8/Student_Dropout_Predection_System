import React, { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Tooltip,
  Fade,
  LinearProgress,
  Box,
  InputAdornment,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import EditNoteIcon from "@mui/icons-material/EditNote";
import SchoolIcon from "@mui/icons-material/School";

const ClassScore = ({ students = [], goBack }) => {
  const [testDetails, setTestDetails] = useState({
    testName: "",
    subject: "",
    date: "",
    maxScore: "",
  });
  const [scoreData, setScoreData] = useState([]);
  const [isTestSelected, setIsTestSelected] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setScoreData(
      students.map((s) => ({
        student_id: s.student_id,
        name: s.name,
        course: s.course,
        marks: "",
      }))
    );
  }, [students]);

  const handleTestDetailChange = (e) => {
    const { name, value } = e.target;
    setTestDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleMarksChange = (idx, value) => {
    if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
      const updated = [...scoreData];
      updated[idx].marks = value;
      setScoreData(updated);
    }
  };

  const handleSave = () => {
    if (!isTestSelected) {
      alert("⚠️ Please select the test first!");
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleSelectTest = () => {
    if (
      !testDetails.testName ||
      !testDetails.subject ||
      !testDetails.date ||
      !testDetails.maxScore
    ) {
      alert("⚠️ Fill all test details before selecting!");
      return;
    }
    setIsTestSelected((prev) => !prev);
  };

  // Progress: how many students have marks entered
  const filledCount = scoreData.filter((s) => s.marks !== "").length;
  const progress = scoreData.length > 0 ? (filledCount / scoreData.length) * 100 : 0;

  const getMarkColor = (marks, max) => {
    if (!marks || !max) return "default";
    const pct = (parseFloat(marks) / parseFloat(max)) * 100;
    if (pct >= 75) return "success";
    if (pct >= 50) return "warning";
    return "error";
  };

  return (
    <Box className="min-h-screen bg-slate-50 p-4 md:p-6">
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid #e2e8f0",
          overflow: "hidden",
          backgroundColor: "#fff",
        }}
      >
        {/* ── Header ── */}
        <Box
          className="flex items-center justify-between px-5 py-4"
          sx={{ borderBottom: "1px solid #e2e8f0", backgroundColor: "#f8fafc" }}
        >
          <Tooltip title="Go back" arrow TransitionComponent={Fade}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={goBack}
              variant="outlined"
              size="small"
              sx={{
                borderColor: "#cbd5e1",
                color: "#475569",
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                "&:hover": { borderColor: "#94a3b8", backgroundColor: "#f1f5f9" },
              }}
            >
              Back
            </Button>
          </Tooltip>

          <Box className="flex items-center gap-2">
            <EditNoteIcon sx={{ color: "#6366f1", fontSize: 22 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#0f172a" }}>
              Regular Test Scores
            </Typography>
          </Box>

          <Button
            startIcon={saved ? <CheckCircleIcon /> : <SaveIcon />}
            onClick={handleSave}
            variant="contained"
            size="small"
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              backgroundColor: saved ? "#22c55e" : "#6366f1",
              "&:hover": { backgroundColor: saved ? "#16a34a" : "#4f46e5" },
              transition: "background-color 0.3s ease",
              minWidth: 100,
            }}
          >
            {saved ? "Saved!" : "Save All"}
          </Button>
        </Box>

        <Box className="p-5 flex flex-col gap-5">
          {/* ── Test Details ── */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              border: isTestSelected ? "1.5px solid #22c55e" : "1px solid #e2e8f0",
              backgroundColor: isTestSelected ? "#f0fdf4" : "#fafafa",
              transition: "all 0.3s ease",
            }}
          >
            <Box className="flex items-center justify-between mb-4">
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#1e293b" }}>
                Test Details
              </Typography>
              {isTestSelected && (
                <Chip
                  icon={<CheckCircleIcon sx={{ fontSize: "16px !important" }} />}
                  label="Test Confirmed"
                  size="small"
                  sx={{
                    backgroundColor: "#dcfce7",
                    color: "#16a34a",
                    fontWeight: 600,
                    fontSize: "0.75rem",
                  }}
                />
              )}
            </Box>

            <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              {[
                { name: "testName", label: "Test Name", type: "text", placeholder: "e.g. Unit Test 1" },
                { name: "subject", label: "Subject", type: "text", placeholder: "e.g. Mathematics" },
                { name: "date", label: "Date", type: "date" },
                { name: "maxScore", label: "Max Score", type: "number", placeholder: "e.g. 100" },
              ].map((field) => (
                <TextField
                  key={field.name}
                  name={field.name}
                  label={field.label}
                  type={field.type}
                  value={testDetails[field.name]}
                  onChange={handleTestDetailChange}
                  placeholder={field.placeholder}
                  size="small"
                  disabled={isTestSelected}
                  InputLabelProps={field.type === "date" ? { shrink: true } : {}}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      fontSize: "0.875rem",
                      backgroundColor: isTestSelected ? "#f0fdf4" : "#fff",
                      "& fieldset": { borderColor: "#e2e8f0" },
                      "&:hover fieldset": { borderColor: "#6366f1" },
                      "&.Mui-focused fieldset": { borderColor: "#6366f1" },
                    },
                  }}
                />
              ))}
            </Box>

            <Button
              onClick={handleSelectTest}
              variant={isTestSelected ? "outlined" : "contained"}
              size="small"
              startIcon={
                isTestSelected ? (
                  <RadioButtonUncheckedIcon />
                ) : (
                  <CheckCircleIcon />
                )
              }
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.85rem",
                px: 2.5,
                backgroundColor: isTestSelected ? "transparent" : "#6366f1",
                borderColor: isTestSelected ? "#22c55e" : "transparent",
                color: isTestSelected ? "#16a34a" : "#fff",
                "&:hover": {
                  backgroundColor: isTestSelected ? "#f0fdf4" : "#4f46e5",
                },
                transition: "all 0.25s ease",
              }}
            >
              {isTestSelected ? "Unselect Test" : "Confirm & Done"}
            </Button>
          </Paper>

          {/* ── Student Marks Table ── */}
          {isTestSelected && (
            <Fade in timeout={400}>
              <Box>
                {/* Progress Bar */}
                <Box className="flex items-center justify-between mb-2">
                  <Box className="flex items-center gap-2">
                    <SchoolIcon sx={{ color: "#6366f1", fontSize: 18 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#1e293b" }}>
                      Enter Student Marks
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: "#64748b" }}>
                    {filledCount} / {scoreData.length} filled
                  </Typography>
                </Box>

                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    mb: 2,
                    backgroundColor: "#e2e8f0",
                    "& .MuiLinearProgress-bar": {
                      backgroundColor: progress === 100 ? "#22c55e" : "#6366f1",
                      borderRadius: 3,
                      transition: "background-color 0.4s ease",
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
                        {["Student ID", "Name", "Course", `Marks / ${testDetails.maxScore}`].map(
                          (h) => (
                            <TableCell
                              key={h}
                              sx={{
                                fontWeight: 700,
                                color: "#334155",
                                fontSize: "0.8rem",
                                py: 1.5,
                                borderBottom: "1.5px solid #e2e8f0",
                              }}
                            >
                              {h}
                            </TableCell>
                          )
                        )}
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {scoreData.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            sx={{ textAlign: "center", py: 4, color: "#94a3b8" }}
                          >
                            No student records available.
                          </TableCell>
                        </TableRow>
                      ) : (
                        scoreData.map((s, idx) => (
                          <TableRow
                            key={idx}
                            sx={{
                              "&:hover": { backgroundColor: "#f8fafc" },
                              backgroundColor: idx % 2 === 0 ? "#fff" : "#fafafa",
                              transition: "background-color 0.15s ease",
                            }}
                          >
                            <TableCell sx={{ fontSize: "0.82rem", color: "#64748b", py: 1 }}>
                              {s.student_id || "-"}
                            </TableCell>
                            <TableCell sx={{ fontSize: "0.85rem", fontWeight: 600, color: "#1e293b", py: 1 }}>
                              {s.name || "-"}
                            </TableCell>
                            <TableCell sx={{ py: 1 }}>
                              <Chip
                                label={s.course || "-"}
                                size="small"
                                sx={{
                                  backgroundColor: "#ede9fe",
                                  color: "#6d28d9",
                                  fontWeight: 600,
                                  fontSize: "0.72rem",
                                  height: 22,
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ py: 1 }}>
                              <Box className="flex items-center gap-2">
                                <TextField
                                  type="number"
                                  value={s.marks}
                                  onChange={(e) => handleMarksChange(idx, e.target.value)}
                                  placeholder="—"
                                  size="small"
                                  inputProps={{ min: 0, max: testDetails.maxScore, step: 0.5 }}
                                  sx={{
                                    width: 110,
                                    "& .MuiOutlinedInput-root": {
                                      borderRadius: 2,
                                      fontSize: "0.85rem",
                                      "& fieldset": { borderColor: "#e2e8f0" },
                                      "&:hover fieldset": { borderColor: "#6366f1" },
                                      "&.Mui-focused fieldset": { borderColor: "#6366f1" },
                                    },
                                  }}
                                />
                                {s.marks !== "" && (
                                  <Chip
                                    label={`${((parseFloat(s.marks) / parseFloat(testDetails.maxScore)) * 100).toFixed(0)}%`}
                                    size="small"
                                    color={getMarkColor(s.marks, testDetails.maxScore)}
                                    sx={{ fontWeight: 700, fontSize: "0.7rem", height: 22 }}
                                  />
                                )}
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Fade>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default ClassScore;