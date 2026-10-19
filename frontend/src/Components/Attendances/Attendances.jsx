import React, { useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  TextField,
  MenuItem,
  Chip,
  Button,
  ButtonGroup,
  Alert,
  Fade,
  Grow,
} from "@mui/material";
import EventNoteRoundedIcon from "@mui/icons-material/EventNoteRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import EventBusyRoundedIcon from "@mui/icons-material/EventBusyRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import InboxRoundedIcon from "@mui/icons-material/InboxRounded";

function statusTone(status) {
  if (status === "Present") return "success";
  if (status === "Absent") return "error";
  if (status === "Leave") return "warning";
  return "default";
}

const Attendances = ({ studentData = [], courses = [] }) => {
  // Build the subject/course dropdown from whatever data is actually on
  // the students (fullName/courseApplied is the DB shape; name/course is
  // the Excel-upload shape — same fallback pattern used elsewhere in the
  // dashboard). Filtering out empty/undefined values here is what fixes
  // the "missing key" warning below: previously an undefined courseApplied
  // could produce a single `undefined` entry in the list, and
  // key={undefined} is treated by React as if no key was given at all.
  const coursesList = [
    ...new Set(
      studentData
        .map((s) => s.courseApplied || s.course)
        .filter((c) => c !== undefined && c !== null && c !== "")
    ),
  ].sort();

  const [attendance, setAttendance] = useState({});
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [course, setCourse] = useState("");
  const [message, setMessage] = useState("");

  // NOTE: previously this compared against `s.course`, but the course
  // dropdown above is built from `courseApplied` (the actual DB field) —
  // that mismatch meant the filter almost never matched anything. Fixed
  // to check both shapes, same as coursesList above.
  const filteredStudents = course
    ? studentData.filter((s) => (s.courseApplied || s.course) === course)
    : studentData;

  const markAttendance = (id, status) => {
    setAttendance((prev) => ({
      ...prev,
      [id]: status,
    }));
  };

  const saveAttendance = async () => {
    if (!course) {
      alert("⚠️ Please select a subject before saving attendance!");
      return;
    }

    try {
      const payload = filteredStudents.map((s) => ({
        student_id: s.studentId || s.student_id,
        name: s.fullName || s.name,
        course: s.courseApplied || s.course,
        status: attendance[s.studentId || s.student_id] || "Not Marked",
        date: selectedDate,
      }));

      const response = await axios.post(
        "http://localhost:5000/attendance",
        payload
      );
      console.log(response.data);
      setMessage("✅ Attendance saved successfully!");
    } catch (error) {
      console.error(error);
      setMessage("❌ Failed to save attendance.");
    }
  };

  return (
    <Fade in timeout={450}>
      <Box>
        {/* Header */}
        <Box className="flex flex-wrap justify-between items-center gap-3 mb-5">
          <Box className="flex items-center gap-2">
            <EventNoteRoundedIcon color="primary" />
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Student Attendance
            </Typography>
          </Box>

          <Box className="flex gap-2 flex-wrap">
            <TextField
              type="date"
              size="small"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            <TextField
              select
              size="small"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="">-- Select Subject --</MenuItem>
              {coursesList.map((c, idx) => (
                <MenuItem key={`${c}-${idx}`} value={c}>
                  {c}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </Box>

        {filteredStudents.length === 0 ? (
          <Grow in timeout={400}>
            <Card
              elevation={0}
              sx={{ border: "1px solid #e2e8f0" }}
              className="flex flex-col items-center justify-center py-16"
            >
              <InboxRoundedIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1.5 }} />
              <Typography color="text.secondary">
                No students available for this subject.
              </Typography>
            </Card>
          </Grow>
        ) : (
          <>
            <Grow in timeout={500}>
              <Card elevation={0} sx={{ border: "1px solid #e2e8f0", mb: 3 }}>
                <TableContainer sx={{ overflowX: "auto" }}>
                  <Table sx={{ minWidth: 760 }}>
                    <TableHead>
                      <TableRow sx={{ bgcolor: "#f8fafc" }}>
                        <TableCell sx={{ fontWeight: 700 }}>Student ID</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Course</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Mark Attendance</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredStudents.map((s, idx) => {
                        const sid = s.studentId || s.student_id;
                        const current = attendance[sid];
                        return (
                          <TableRow
                            key={sid || idx}
                            hover
                            sx={{ "&:hover": { bgcolor: "rgba(37, 99, 235, 0.04)" } }}
                          >
                            <TableCell>{sid || "N/A"}</TableCell>
                            <TableCell>{s.fullName || s.name}</TableCell>
                            <TableCell>{s.courseApplied || s.course}</TableCell>
                            <TableCell>
                              <ButtonGroup size="small" variant="outlined">
                                <Button
                                  color="success"
                                  variant={current === "Present" ? "contained" : "outlined"}
                                  startIcon={<CheckCircleRoundedIcon />}
                                  onClick={() => markAttendance(sid, "Present")}
                                  className="transition-all duration-200"
                                  sx={{
                                    "&:hover": { transform: "translateY(-1px)" },
                                  }}
                                >
                                  Present
                                </Button>
                                <Button
                                  color="error"
                                  variant={current === "Absent" ? "contained" : "outlined"}
                                  startIcon={<CancelRoundedIcon />}
                                  onClick={() => markAttendance(sid, "Absent")}
                                  className="transition-all duration-200"
                                  sx={{
                                    "&:hover": { transform: "translateY(-1px)" },
                                  }}
                                >
                                  Absent
                                </Button>
                                <Button
                                  color="warning"
                                  variant={current === "Leave" ? "contained" : "outlined"}
                                  startIcon={<EventBusyRoundedIcon />}
                                  onClick={() => markAttendance(sid, "Leave")}
                                  className="transition-all duration-200"
                                  sx={{
                                    "&:hover": { transform: "translateY(-1px)" },
                                  }}
                                >
                                  Leave
                                </Button>
                              </ButtonGroup>
                            </TableCell>
                            <TableCell>
                              {current ? (
                                <Chip
                                  label={current}
                                  color={statusTone(current)}
                                  size="small"
                                  sx={{ fontWeight: 700 }}
                                />
                              ) : (
                                <Chip
                                  label="Not Marked"
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontWeight: 600, color: "text.secondary" }}
                                />
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            </Grow>

            <Box className="flex items-center gap-3">
              <Button
                variant="contained"
                startIcon={<SaveRoundedIcon />}
                onClick={saveAttendance}
                className="transition-all duration-300"
                sx={{
                  "&:hover": { transform: "translateY(-2px)", boxShadow: 4 },
                }}
              >
                Save Attendance
              </Button>

              {message && (
                <Fade in timeout={300}>
                  <Alert
                    severity={message.startsWith("✅") ? "success" : "error"}
                    sx={{ py: 0 }}
                  >
                    {message.replace(/^[✅❌]\s*/, "")}
                  </Alert>
                </Fade>
              )}
            </Box>
          </>
        )}
      </Box>
    </Fade>
  );
};

export default Attendances;