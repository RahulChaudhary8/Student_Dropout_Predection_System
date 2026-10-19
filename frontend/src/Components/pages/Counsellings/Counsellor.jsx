import React, { useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
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
  TextField,
  MenuItem,
  Chip,
  Button,
  Tooltip,
  Fade,
  Grow,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ForumRoundedIcon from "@mui/icons-material/ForumRounded";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";
import VideoCallRoundedIcon from "@mui/icons-material/VideoCallRounded";
import InboxRoundedIcon from "@mui/icons-material/InboxRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import SelfImprovementRoundedIcon from "@mui/icons-material/SelfImprovementRounded";
import WorkRoundedIcon from "@mui/icons-material/WorkRounded";
import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";

const suggestions = [
  {
    icon: <PaymentsRoundedIcon />,
    title: "Financial Strain",
    desc: "Offer scholarships, fee waivers, and part-time opportunities.",
  },
  {
    icon: <MenuBookRoundedIcon />,
    title: "Academic Struggles",
    desc: "Provide career counseling, tutoring, and mentorship programs.",
  },
  {
    icon: <SelfImprovementRoundedIcon />,
    title: "Mental Health",
    desc: "Encourage peer support groups, therapy sessions, and wellness activities.",
  },
  {
    icon: <WorkRoundedIcon />,
    title: "Career Guidance",
    desc: "Encourage peer support groups, therapy sessions, and wellness activities.",
  },
  {
    icon: <SupportAgentRoundedIcon />,
    title: "Personal Issue Counselling",
    desc: "Encourage peer support groups, therapy sessions, and wellness activities.",
  },
];

function statusTone(status) {
  if (status === "Completed") return "success";
  if (status === "Ongoing") return "warning";
  return "default";
}

const Counsellor = ({ students, goBack }) => {
  const [updatedStudents, setUpdatedStudents] = useState(
    students.map((s) => ({
      ...s,
      session: s.session || null,
      status: s.status || "Pending",
    }))
  );

  const handleDateChange = (id, date) => {
    setUpdatedStudents((prev) =>
      prev.map((s) => (s.student_id === id ? { ...s, session: date } : s))
    );
  };

  const handleStatusChange = (id, value) => {
    setUpdatedStudents((prev) =>
      prev.map((s) => (s.student_id === id ? { ...s, status: value } : s))
    );
  };

  const notifyStudent = async (student) => {
    if (!student.session) {
      alert("Please select a session date first!");
      return;
    }

    const readableDate = new Date(student.session).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const meetLink = student.meet_link || "https://meet.google.com/ncc-psaz-wki";

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://127.0.0.1:5000/api/notify",
        {
          email: student.email,
          name: student.fullName || student.name,
          session_date: readableDate,
          meet_link: meetLink,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUpdatedStudents((prev) =>
        prev.map((s) =>
          s.student_id === student.student_id ? { ...s, meet_link: meetLink } : s
        )
      );

      alert(res.data.msg || "Student notified");
      console.log(res.data);
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.msg || "Failed to notify student");
    }
  };

  const counsellingStudents = updatedStudents.filter(
    (s) =>
      s.status === "Pending" ||
      s.status === "Ongoing" ||
      s.status === "Counselling"
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Fade in timeout={450}>
        <Box sx={{ width: "100%", maxWidth: 1600, mx: "auto" }}>
          <Button
            startIcon={<ArrowBackRoundedIcon />}
            onClick={goBack}
            sx={{ mb: 2.5, fontWeight: 600 }}
          >
            Back
          </Button>

          <Grow in timeout={500}>
            <Card elevation={0} sx={{ border: "1px solid #e2e8f0", p: 1 }}>
              <CardContent>
                <Box className="flex items-center gap-2 mb-1">
                  <ForumRoundedIcon color="primary" />
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    Counseling
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Manage counselling sessions, mentors, status and notifications.
                </Typography>

                {counsellingStudents.length === 0 ? (
                  <Box className="flex flex-col items-center justify-center py-14">
                    <InboxRoundedIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1.5 }} />
                    <Typography color="text.secondary">
                      No students marked for counselling.
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer sx={{ overflowX: "auto" }}>
                    <Table sx={{ minWidth: 880 }}>
                      <TableHead>
                        <TableRow sx={{ bgcolor: "#f8fafc" }}>
                          <TableCell sx={{ fontWeight: 700 }}>Student ID</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Student Name</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Session Date</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 700 }} align="right">
                            Action
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {counsellingStudents.map((s, i) => (
                          <TableRow
                            key={i}
                            hover
                            sx={{ "&:hover": { bgcolor: "rgba(37, 99, 235, 0.04)" } }}
                          >
                            <TableCell>{s.studentId}</TableCell>
                            <TableCell>{s.fullName}</TableCell>

                            {/* Date & Time picker */}
                            <TableCell>
                              <DateTimePicker
                                value={s.session ? dayjs(s.session) : null}
                                onChange={(date) =>
                                  handleDateChange(s.student_id, date ? date.toDate() : null)
                                }
                                ampm
                                slotProps={{
                                  textField: {
                                    size: "small",
                                    placeholder: "Select Date & Time",
                                    sx: { minWidth: 190 },
                                  },
                                  field: { clearable: true },
                                }}
                              />
                            </TableCell>

                            {/* Status dropdown + Chip */}
                            <TableCell>
                              <Box className="flex items-center gap-2">
                                <TextField
                                  select
                                  size="small"
                                  value={s.status}
                                  onChange={(e) =>
                                    handleStatusChange(s.student_id, e.target.value)
                                  }
                                  sx={{ minWidth: 130 }}
                                >
                                  <MenuItem value="Pending">Pending</MenuItem>
                                  <MenuItem value="Ongoing">Ongoing</MenuItem>
                                  <MenuItem value="Completed">Completed</MenuItem>
                                </TextField>
                                <Chip
                                  label={s.status}
                                  color={statusTone(s.status)}
                                  size="small"
                                  sx={{ fontWeight: 700 }}
                                />
                              </Box>
                            </TableCell>

                            {/* Notify / Join */}
                            <TableCell align="right">
                              <Box className="flex gap-1.5 justify-end">
                                <Tooltip title="Notify Student">
                                  <Button
                                    size="small"
                                    variant="contained"
                                    startIcon={<NotificationsActiveRoundedIcon />}
                                    onClick={() => notifyStudent(s)}
                                    className="transition-all duration-200"
                                    sx={{
                                      "&:hover": { transform: "translateY(-2px)", boxShadow: 3 },
                                    }}
                                  >
                                    Notify
                                  </Button>
                                </Tooltip>
                                {s.meet_link && (
                                  <Button
                                    size="small"
                                    variant="contained"
                                    color="success"
                                    startIcon={<VideoCallRoundedIcon />}
                                    href={s.meet_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="transition-all duration-200"
                                    sx={{
                                      "&:hover": { transform: "translateY(-2px)", boxShadow: 3 },
                                    }}
                                  >
                                    Join
                                  </Button>
                                )}
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                {/* Suggestions Section */}
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2.5 }}>
                    Suggestions & Solutions
                  </Typography>
                  <Grid container spacing={2.5}>
                    {suggestions.map((s, idx) => (
                      <Grid item xs={12} sm={6} md={4} key={s.title} sx={{ flexGrow: 1 }}>
                        <Grow in timeout={350 + idx * 120}>
                          <Card
                            elevation={0}
                            className="transition-all duration-300"
                            sx={{
                              height: "100%",
                              textAlign: "center",
                              bgcolor: "#f1f5f9",
                              border: "1px solid #e2e8f0",
                              "&:hover": {
                                transform: "translateY(-5px)",
                                bgcolor: "#fff",
                                boxShadow: "0 10px 22px -8px rgba(15, 23, 42, 0.15)",
                              },
                            }}
                          >
                            <CardContent>
                              <Avatar
                                sx={{
                                  bgcolor: "primary.main",
                                  width: 56,
                                  height: 56,
                                  mx: "auto",
                                  mb: 1.5,
                                }}
                              >
                                {s.icon}
                              </Avatar>
                              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                                {s.title}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {s.desc}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grow>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          </Grow>
        </Box>
      </Fade>
    </LocalizationProvider>
  );
};

export default Counsellor;
