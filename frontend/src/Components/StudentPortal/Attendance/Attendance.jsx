import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  IconButton,
  Tooltip as MuiTooltip,
  Fade,
  Grow,
  Chip,
} from "@mui/material";
import EventNoteRoundedIcon from "@mui/icons-material/EventNoteRounded";
import PieChartRoundedIcon from "@mui/icons-material/PieChartRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";

const COLORS = { Present: "#4CAF50", Absent: "#E74C3C", Leave: "#f39c12" };

const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();

const fmtDate = (year, month, day) =>
  `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

// studentId should come from the logged-in student's auth context / props.
// Adjust the endpoint below to whatever your backend actually exposes.
const Attendance = ({ studentId }) => {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [attendanceMap, setAttendanceMap] = useState({}); // { "2026-07-09": "Present", ... }
  const [selectedDay, setSelectedDay] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch this student's real attendance from the backend whenever the
  // student changes (mentor-side marking writes to the same collection
  // this reads from).
  useEffect(() => {
    if (!studentId) return;
    setLoading(true);
    axios.get(`http://localhost:5000/attendance/${studentId}`)
      .then((res) => {
        const map = {};
        (res.data || []).forEach((rec) => {
          // normalize date to YYYY-MM-DD in case backend returns a full ISO timestamp
          const dateKey = (rec.date || "").slice(0, 10);
          if (dateKey) map[dateKey] = rec.status;
        });
        setAttendanceMap(map);
      })
      .catch((err) => {
        console.error("❌ Failed to load attendance:", err);
      })
      .finally(() => setLoading(false));
  }, [studentId]);

  const goPrevMonth = () => {
    setSelectedDay(null);
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goNextMonth = () => {
    setSelectedDay(null);
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const daysInMonth = getDaysInMonth(viewMonth, viewYear);
  const calendarDays = useMemo(() => {
    const days = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = fmtDate(viewYear, viewMonth, day);
      const status = attendanceMap[dateStr] || "None";
      days.push({ day, dateStr, status });
    }
    return days;
  }, [daysInMonth, viewMonth, viewYear, attendanceMap]);

  // Monthly summary derived from real data for the month currently in view
  const summary = useMemo(() => {
    let present = 0,
      absent = 0,
      leave = 0;
    calendarDays.forEach((d) => {
      if (d.status === "Present") present++;
      else if (d.status === "Absent") absent++;
      else if (d.status === "Leave") leave++;
    });
    return { present, absent, leave };
  }, [calendarDays]);

  const pieData = [
    { name: "Present", value: summary.present },
    { name: "Absent", value: summary.absent },
    { name: "Leave", value: summary.leave },
  ].filter((d) => d.value > 0);

  const totalMarked = summary.present + summary.absent + summary.leave;
  const attendancePct =
    totalMarked > 0 ? ((summary.present / totalMarked) * 100).toFixed(1) : "0.0";

  const monthLabel = new Date(viewYear, viewMonth).toLocaleString("default", {
    month: "long",
  });

  return (
    <Fade in timeout={450}>
      <Box>
        {/* Summary */}
        <Grow in timeout={400}>
          <Card elevation={0} sx={{ border: "1px solid #e2e8f0", mb: 3 }}>
            <CardContent>
              <Box className="flex items-center gap-2 mb-2">
                <EventNoteRoundedIcon sx={{ color: "#6c5ce7" }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Attendance Overview — {monthLabel} {viewYear}
                </Typography>
              </Box>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={3}>
                  <Box sx={{ bgcolor: "#f1f3f6", borderRadius: 2, p: 2, textAlign: "center" }}>
                    <Typography variant="body2" color="text.secondary">
                      Days Present
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: "success.main" }}>
                      {summary.present}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Box sx={{ bgcolor: "#f1f3f6", borderRadius: 2, p: 2, textAlign: "center" }}>
                    <Typography variant="body2" color="text.secondary">
                      Days Absent
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: "error.main" }}>
                      {summary.absent}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Box sx={{ bgcolor: "#f1f3f6", borderRadius: 2, p: 2, textAlign: "center" }}>
                    <Typography variant="body2" color="text.secondary">
                      Days on Leave
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: "warning.main" }}>
                      {summary.leave}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Box sx={{ bgcolor: "#f1f3f6", borderRadius: 2, p: 2, textAlign: "center" }}>
                    <Typography variant="body2" color="text.secondary">
                      Attendance %
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: "#6c5ce7" }}>
                      {attendancePct}%
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grow>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          {/* Pie chart from real data */}
          <Grid item xs={12} md={5}>
            <Grow in timeout={550}>
              <Card elevation={0} sx={{ border: "1px solid #e2e8f0", height: "100%", textAlign: "center" }}>
                <CardContent>
                  <Box className="flex items-center justify-center gap-2 mb-1">
                    <PieChartRoundedIcon sx={{ color: "#6c5ce7" }} />
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      This Month's Distribution
                    </Typography>
                  </Box>
                  {pieData.length === 0 ? (
                    <Typography color="text.secondary" sx={{ py: 6 }}>
                      Is month ka koi attendance mark nahi hua abhi.
                    </Typography>
                  ) : (
                    <Box className="flex justify-center">
                      <PieChart width={300} height={250}>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          dataKey="value"
                          label
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grow>
          </Grid>

          {/* Selected day detail */}
          <Grid item xs={12} md={7}>
            <Grow in timeout={650}>
              <Card elevation={0} sx={{ border: "1px solid #e2e8f0", height: "100%" }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                    Day Detail
                  </Typography>
                  {selectedDay ? (
                    <Box className="flex items-center gap-3">
                      <Typography variant="body1">
                        <strong>
                          {new Date(selectedDay.dateStr).toLocaleDateString("default", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </strong>
                      </Typography>
                      <Chip
                        label={selectedDay.status === "None" ? "Not Marked" : selectedDay.status}
                        sx={{
                          fontWeight: 700,
                          bgcolor:
                            selectedDay.status === "None"
                              ? "#e0e0e0"
                              : COLORS[selectedDay.status],
                          color: selectedDay.status === "None" ? "#555" : "#fff",
                        }}
                      />
                    </Box>
                  ) : (
                    <Typography color="text.secondary">
                      Calendar me kisi bhi date pe click karke uska status dekhein.
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grow>
          </Grid>
        </Grid>

        {/* Calendar with month navigation */}
        <Grow in timeout={750}>
          <Card elevation={0} sx={{ border: "1px solid #e2e8f0" }}>
            <CardContent>
              <Box className="flex items-center justify-between mb-2">
                <Box className="flex items-center gap-2">
                  <CalendarMonthRoundedIcon sx={{ color: "#6c5ce7" }} />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Attendance Calendar — {monthLabel} {viewYear}
                  </Typography>
                </Box>
                <Box className="flex items-center gap-1">
                  <IconButton onClick={goPrevMonth} size="small">
                    <ChevronLeftRoundedIcon />
                  </IconButton>
                  <IconButton onClick={goNextMonth} size="small">
                    <ChevronRightRoundedIcon />
                  </IconButton>
                </Box>
              </Box>

              {loading && (
                <Typography color="text.secondary" sx={{ mb: 1 }}>
                  Loading attendance...
                </Typography>
              )}

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, 1fr)",
                  gap: 1,
                  mt: 2,
                }}
              >
                {calendarDays.map((d, index) => {
                  const isToday =
                    d.dateStr === fmtDate(today.getFullYear(), today.getMonth(), today.getDate());
                  const isSelected = selectedDay?.dateStr === d.dateStr;
                  return (
                    <MuiTooltip key={index} title={`${d.dateStr} — ${d.status}`}>
                      <Box
                        onClick={() => setSelectedDay(d)}
                        sx={{
                          height: 48,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: 2,
                          fontWeight: 700,
                          cursor: "pointer",
                          transition: "transform 0.15s ease",
                          border: isToday ? "2px solid #6c5ce7" : isSelected ? "2px solid #333" : "none",
                          bgcolor:
                            d.status === "Present"
                              ? "#4caf50"
                              : d.status === "Absent"
                                ? "#e74c3c"
                                : d.status === "Leave"
                                  ? "#f39c12"
                                  : "#e0e0e0",
                          color: d.status === "None" ? "#777" : "#fff",
                          "&:hover": { transform: "scale(1.08)" },
                        }}
                      >
                        {d.day}
                      </Box>
                    </MuiTooltip>
                  );
                })}
              </Box>

              <Box className="flex gap-5 mt-3 flex-wrap">
                <Box className="flex items-center gap-1.5">
                  <Box sx={{ width: 16, height: 16, borderRadius: 0.5, bgcolor: "#4caf50" }} />
                  <Typography variant="body2">Present</Typography>
                </Box>
                <Box className="flex items-center gap-1.5">
                  <Box sx={{ width: 16, height: 16, borderRadius: 0.5, bgcolor: "#e74c3c" }} />
                  <Typography variant="body2">Absent</Typography>
                </Box>
                <Box className="flex items-center gap-1.5">
                  <Box sx={{ width: 16, height: 16, borderRadius: 0.5, bgcolor: "#f39c12" }} />
                  <Typography variant="body2">Leave</Typography>
                </Box>
                <Box className="flex items-center gap-1.5">
                  <Box sx={{ width: 16, height: 16, borderRadius: 0.5, bgcolor: "#e0e0e0" }} />
                  <Typography variant="body2">Not Marked</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grow>
      </Box>
    </Fade>
  );
};

export default Attendance;