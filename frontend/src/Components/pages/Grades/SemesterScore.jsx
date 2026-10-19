import React, { useState, useEffect } from "react";
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
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setScoreData(
      students.map((s) => ({
        student_id: s.student_id,
        name: s.name,
        course: s.course,
        Sem1: s.Sem1 || "", Sem2: s.Sem2 || "",
        Sem3: s.Sem3 || "", Sem4: s.Sem4 || "",
        Sem5: s.Sem5 || "", Sem6: s.Sem6 || "",
        Sem7: s.Sem7 || "", Sem8: s.Sem8 || "",
      }))
    );
  }, [students]);

  const handleChange = (idx, sem, value) => {
    if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
      const updated = [...scoreData];
      updated[idx][sem] = value;
      setScoreData(updated);
    }
  };

  const handleYearChange = (_, val) => {
    if (!val) return;
    setSelectedYear(val);
    setSelectedSem(semesterOptions[val][0]);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    console.log("Saved:", scoreData);
  };

  // Progress
  const filledCount = scoreData.filter((s) => s[selectedSem] !== "").length;
  const progress = scoreData.length > 0 ? (filledCount / scoreData.length) * 100 : 0;

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
                {filledCount} / {scoreData.length} filled
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
                    {["Student ID", "Name", "Course", `Marks (${selectedSem})`].map((h) => (
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
                  {scoreData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} sx={{ textAlign: "center", py: 4, color: "#94a3b8", fontStyle: "italic" }}>
                        No student records available.
                      </TableCell>
                    </TableRow>
                  ) : (
                    scoreData.map((s, idx) => {
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
                            {s.student_id || "-"}
                          </TableCell>
                          <TableCell sx={{ fontSize: "0.85rem", fontWeight: 600, color: "#1e293b", py: 1 }}>
                            {s.name || "-"}
                          </TableCell>
                          <TableCell sx={{ py: 1 }}>
                            <Chip
                              label={s.course || "-"}
                              size="small"
                              sx={{ backgroundColor: "#ede9fe", color: "#6d28d9", fontWeight: 600, fontSize: "0.72rem", height: 22 }}
                            />
                          </TableCell>
                          <TableCell sx={{ py: 1 }}>
                            <Box className="flex items-center gap-2">
                              <TextField
                                type="text"
                                value={s[selectedSem]}
                                onChange={(e) => handleChange(idx, selectedSem, e.target.value)}
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