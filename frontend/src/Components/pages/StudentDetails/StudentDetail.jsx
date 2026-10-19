import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
  LineChart, Line, ResponsiveContainer,
} from "recharts";
import {
  Box, Paper, Typography, Button, Chip, Avatar,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Divider,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PersonIcon from "@mui/icons-material/Person";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AssignmentIcon from "@mui/icons-material/Assignment";
import BarChartIcon from "@mui/icons-material/BarChart";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import EmojiObjectsIcon from "@mui/icons-material/EmojiObjects";

const RISK_COLORS = ["#22c55e", "#f59e0b", "#ef4444"];
const RISK_PIE_LABELS = ["Attendance", "Fees", "Test Scores"];

const attendanceData = [
  { date: "Jan 15", value: 85 },
  { date: "Feb 1", value: 90 },
  { date: "Feb 15", value: 88 },
  { date: "Mar 15", value: 95 },
];

const riskData = [
  { name: "Attendance", value: 40 },
  { name: "Fees", value: 30 },
  { name: "Test Scores", value: 30 },
];

const testScores = [
  { name: "Test 1", score: 75 },
  { name: "Test 2", score: 85 },
  { name: "Test 3", score: 92 },
];

const assignments = [
  { name: "Assignment 1", due: "Apr 10", status: "Pending" },
  { name: "Assignment 2", due: "Apr 20", status: "Complete" },
  { name: "Test Scores", due: "May 5", status: "Pending" },
];

/* ── Reusable Card ── */
const Card = ({ icon, title, children, sx = {} }) => (
  <Paper
    elevation={0}
    sx={{
      borderRadius: 3, border: "1px solid #e2e8f0",
      p: 3, display: "flex", flexDirection: "column", gap: 2,
      backgroundColor: "#fff", ...sx,
    }}
  >
    {title && (
      <Box className="flex items-center gap-1.5">
        {icon && React.cloneElement(icon, { sx: { fontSize: 17, color: "#6366f1" } })}
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#334155" }}>
          {title}
        </Typography>
      </Box>
    )}
    {children}
  </Paper>
);

/* ── Custom Pie Tooltip ── */
const PieTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <Paper elevation={3} sx={{ px: 1.5, py: 1, borderRadius: 2, fontSize: "0.78rem" }}>
        <Typography variant="caption" sx={{ fontWeight: 700 }}>{payload[0].name}: {payload[0].value}%</Typography>
      </Paper>
    );
  }
  return null;
};

/* ── Main Component ── */
const StudentDetail = ({ student, onBack, onMarkForCounselling }) => {
  const [marked, setMarked] = useState(student?.marked || false);
  const [studentData, setStudentData] = useState(null);

  useEffect(() => {
    if (student?.status === "Completed") setMarked(false);
    else setMarked(student?.marked || false);
  }, [student?.status, student?.marked]);

  useEffect(() => {
    if (!student?.["Student ID"]) return;
    const fetch = async () => {
      try {
        const res = await axios.post("http://127.0.0.1:8000/predict", {
          records: [{ "Student ID": student["Student ID"] }],
          explain: true,
        });
        const result = res.data.results[0];
        setStudentData({ ...result, explanations: result.explanations ?? [] });
      } catch (err) {
        console.error("Error fetching student details:", err);
      }
    };
    fetch();
  }, [student]);

  const handleCounsel = () => {
    if (student?.status !== "Completed") {
      setMarked(true);
      onMarkForCounselling(student);
    }
  };

  if (!student) return (
    <Box className="flex items-center justify-center h-40">
      <Typography sx={{ color: "#94a3b8" }}>No student selected.</Typography>
    </Box>
  );

  const risk = student.dropout_probability
    ? student.dropout_probability.toFixed(1)
    : "70.0";

  const riskLevel = parseFloat(risk) >= 75 ? "High" : parseFloat(risk) >= 50 ? "Moderate" : "Low";
  const riskChipColors = {
    High: { bg: "#fee2e2", text: "#b91c1c" },
    Moderate: { bg: "#fef3c7", text: "#a16207" },
    Low: { bg: "#dcfce7", text: "#15803d" },
  };

  return (
    <Box className="min-h-screen bg-slate-50 p-4 md:p-6">

      {/* ── Back Button ── */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={onBack}
        variant="outlined"
        size="small"
        sx={{
          mb: 4, borderRadius: 2, textTransform: "none", fontWeight: 600,
          borderColor: "#e2e8f0", color: "#475569",
          "&:hover": { borderColor: "#94a3b8", backgroundColor: "#f1f5f9" },
        }}
      >
        Back
      </Button>

      {/* ── Grid Layout ── */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
          gap: 3,
        }}
      >
        {/* 1. Student Info */}
        <Card icon={<PersonIcon />} title="Student Info">
          <Box className="flex items-center gap-3">
            <Avatar
              src={student.photo || "/default-avatar.png"}
              alt={student.fullName}
              sx={{ width: 56, height: 56, border: "2px solid #e2e8f0" }}
            >
              {student.name?.[0] || "S"}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0f172a", lineHeight: 1.2 }}>
                {student.fullName || "N/A"}
              </Typography>
              <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                {student["studentId"] || "STU0000"}
              </Typography>
              <Box className="flex gap-1 mt-1 flex-wrap">
                <Chip label={student.courseApplied || "Course N/A"} size="small"
                  sx={{ height: 20, fontSize: "0.68rem", backgroundColor: "#ede9fe", color: "#6d28d9", fontWeight: 700 }} />
                <Chip label="Sem 4 · IT" size="small"
                  sx={{ height: 20, fontSize: "0.68rem", backgroundColor: "#f1f5f9", color: "#475569", fontWeight: 600 }} />
              </Box>
            </Box>
          </Box>
        </Card>

        {/* 2. Dropout Risk Pie */}
        <Card icon={<WarningAmberIcon />} title="Dropout Risk">
          <Box className="flex flex-col items-center gap-2">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={riskData} cx="50%" cy="50%" outerRadius={65} dataKey="value">
                  {riskData.map((_, i) => (
                    <Cell key={i} fill={RISK_COLORS[i % RISK_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            <Box className="flex items-center gap-2">
              <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a" }}>
                {risk}%
              </Typography>
              <Chip
                label={riskLevel}
                size="small"
                sx={{
                  backgroundColor: riskChipColors[riskLevel].bg,
                  color: riskChipColors[riskLevel].text,
                  fontWeight: 700, fontSize: "0.72rem", height: 22,
                }}
              />
            </Box>

            <Box className="flex gap-3 flex-wrap justify-center">
              {RISK_PIE_LABELS.map((label, i) => (
                <Box key={label} className="flex items-center gap-1">
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: RISK_COLORS[i] }} />
                  <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.7rem" }}>{label}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Card>

        {/* 3. Top Dropout Reasons (if available) */}
        {studentData?.explanations?.length > 0 && (
          <Card icon={<EmojiObjectsIcon />} title="Top Dropout Reasons">
            <Box className="flex flex-col gap-2">
              {studentData.explanations.slice(0, 3).map((exp, idx) => {
                const pct = (exp.weight * 100).toFixed(1);
                return (
                  <Box key={idx}>
                    <Box className="flex justify-between mb-0.5">
                      <Typography variant="caption" sx={{ fontWeight: 600, color: "#334155" }}>{exp.feature}</Typography>
                      <Typography variant="caption" sx={{ color: "#6366f1", fontWeight: 700 }}>{pct}%</Typography>
                    </Box>
                    <Box sx={{ height: 6, borderRadius: 3, backgroundColor: "#e2e8f0", overflow: "hidden" }}>
                      <Box sx={{ height: "100%", width: `${pct}%`, backgroundColor: "#6366f1", borderRadius: 3, transition: "width 0.6s ease" }} />
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Card>
        )}

        {/* 4. Attendance Line Chart */}
        <Card icon={<TrendingUpIcon />} title="Attendance Trend">
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} />
              <YAxis domain={[80, 100]} tick={{ fontSize: 10, fill: "#94a3b8" }} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: "0.78rem", border: "1px solid #e2e8f0" }} />
              <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} dot={{ r: 3, fill: "#6366f1" }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* 5. Counseling */}
        <Card icon={<SupportAgentIcon />} title="Counseling Details">
          <Box className="flex flex-col gap-1.5">
            {[["Mentor", "John Doe"], ["Last Session", "Mar 17"], ["Status", student?.status || "Pending"]].map(([k, v]) => (
              <Box key={k} className="flex justify-between items-center">
                <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 600 }}>{k}</Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: "#334155" }}>{v}</Typography>
              </Box>
            ))}
          </Box>
          <Divider sx={{ borderColor: "#f1f5f9" }} />
          <Button
            fullWidth
            startIcon={marked ? <CheckCircleIcon /> : <SupportAgentIcon />}
            onClick={handleCounsel}
            disabled={marked || student?.status === "Completed"}
            variant={marked ? "outlined" : "contained"}
            size="small"
            sx={{
              borderRadius: 2, textTransform: "none", fontWeight: 700,
              backgroundColor: marked ? "transparent" : "#6366f1",
              borderColor: marked ? "#22c55e" : "transparent",
              color: marked ? "#16a34a" : "#fff",
              "&:hover": { backgroundColor: marked ? "#f0fdf4" : "#4f46e5" },
              "&:disabled": { backgroundColor: "#f1f5f9", color: "#22c55e", borderColor: "#86efac" },
              transition: "all 0.25s ease",
            }}
          >
            {marked ? "✔ Marked for Counselling" : "Mark for Counselling"}
          </Button>
        </Card>

        {/* 6. Assignments */}
        <Card icon={<AssignmentIcon />} title="Assignments">
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                  {["Assignment", "Due", "Status"].map((h) => (
                    <TableCell key={h} sx={{ fontWeight: 700, color: "#475569", fontSize: "0.75rem", py: 1, borderBottom: "1.5px solid #e2e8f0" }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {assignments.map((a, i) => (
                  <TableRow key={i} sx={{ "&:hover": { backgroundColor: "#f8fafc" } }}>
                    <TableCell sx={{ fontSize: "0.8rem", color: "#334155", py: 1 }}>{a.name}</TableCell>
                    <TableCell sx={{ fontSize: "0.78rem", color: "#64748b", py: 1 }}>{a.due}</TableCell>
                    <TableCell sx={{ py: 1 }}>
                      <Chip
                        label={a.status}
                        size="small"
                        sx={{
                          height: 20, fontSize: "0.65rem", fontWeight: 700,
                          backgroundColor: a.status === "Complete" ? "#dcfce7" : "#fee2e2",
                          color: a.status === "Complete" ? "#15803d" : "#b91c1c",
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        {/* 7. Test Scores Bar Chart */}
        <Card icon={<BarChartIcon />} title="Test Scores">
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={testScores} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#94a3b8" }} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: "0.78rem", border: "1px solid #e2e8f0" }} />
              <Bar dataKey="score" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

      </Box>
    </Box>
  );
};

export default StudentDetail;