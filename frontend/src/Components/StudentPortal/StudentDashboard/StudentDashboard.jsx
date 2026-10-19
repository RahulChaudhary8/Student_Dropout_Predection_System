import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import FeePayment from "../FeePayment/FeePayment";
import Attendance from "../Attendance/Attendance";
import StudentAttendanceView from "../Attendance/StudentAttendanceView";
// apna actual relative path use karein jahan aapne file save ki hai
import LeaveForm from "../LeaveForm/LeaveForm";
import StudentNotifications from "../StudentNotification/StudentNotifications";

import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
  Grid,
  Avatar,
  Divider,
  Fade,
  Grow,
  Slide,
  CircularProgress,
  Menu,
  MenuItem,
} from "@mui/material";
import SpaceDashboardRoundedIcon from "@mui/icons-material/SpaceDashboardRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import EventNoteRoundedIcon from "@mui/icons-material/EventNoteRounded";
import EventBusyRoundedIcon from "@mui/icons-material/EventBusyRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import HowToRegRoundedIcon from "@mui/icons-material/HowToRegRounded";
import PaidRoundedIcon from "@mui/icons-material/PaidRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";

const DRAWER_WIDTH = 220;

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: <SpaceDashboardRoundedIcon /> },
  { key: "fees", label: "Fee Payment", icon: <PaymentsRoundedIcon /> },
  { key: "attendance", label: "View Attendance", icon: <EventNoteRoundedIcon /> },
  { key: "attendance-subject", label: "Subject-wise Attendance", icon: <EventNoteRoundedIcon /> },
  { key: "leave", label: "Apply For Leave", icon: <EventBusyRoundedIcon /> },
  { key: "notification", label: "Notification", icon: <NotificationsRoundedIcon /> },
];

const attendanceData = [
  { name: "Present", value: 80 },
  { name: "Absent", value: 20 },
];
const testScores = [
  { subject: "Math", score: 85 },
  { subject: "Physics", score: 78 },
  { subject: "Chemistry", score: 92 },
  { subject: "CS", score: 88 },
  { subject: "English", score: 74 },
];

const COLORS = ["#4CAF50", "#E74C3C"];

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);


  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();

    // Local Storage Clear
    localStorage.removeItem("token");
    localStorage.removeItem("student");

    // Login Page
    window.location.href = "/loginoptions";
  };


  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://localhost:5000/api/student-profile/profile",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setStudent(res.data);
      } catch (err) {
        console.error("❌ Error fetching student profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, []);

  if (loading) {
    return (
      <Box className="flex flex-col items-center justify-center" sx={{ minHeight: "100vh" }}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography color="text.secondary">Loading profile...</Typography>
      </Box>
    );
  }

  if (!student) {
    return (
      <Box className="flex items-center justify-center" sx={{ minHeight: "100vh" }}>
        <Typography color="text.secondary">No student profile found.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            bgcolor: "#34495e",
            color: "#fff",
            border: "none",
          },
        }}
      >
        <Toolbar sx={{ py: 3 }}>
          <Box className="flex items-center gap-2">
            <SchoolRoundedIcon sx={{ color: "#a29bfe" }} />
            <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: "-0.01em" }}>
              Student Panel
            </Typography>
          </Box>
        </Toolbar>
        <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />
        <List className="px-2 pt-2" sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          {NAV_ITEMS.map((item, idx) => {
            const isActive = activeTab === item.key;
            return (
              <Grow in timeout={300 + idx * 80} key={item.key}>
                <ListItemButton
                  onClick={() => setActiveTab(item.key)}
                  sx={{
                    borderRadius: 2,
                    transition: "all 0.25s ease",
                    bgcolor: isActive ? "#6c5ce7" : "transparent",
                    "&:hover": {
                      bgcolor: isActive ? "#5a4bd4" : "rgba(255,255,255,0.08)",
                      transform: "translateX(4px)",
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: "#fff", minWidth: 36 }}>{item.icon}</ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{ fontSize: 14, fontWeight: isActive ? 700 : 500 }}
                  />
                </ListItemButton>
              </Grow>
            );
          })}
        </List>
      </Drawer>

      {/* Main content */}
      <Box component="main" className="flex-1 flex flex-col">
        <AppBar
          position="sticky"
          elevation={0}
          sx={{ bgcolor: "background.paper", color: "text.primary", borderBottom: "1px solid #e2e8f0" }}
        >
          <Toolbar className="flex justify-between">
            <Typography variant="h6" sx={{ fontWeight: 700, textTransform: "capitalize" }}>
              {NAV_ITEMS.find((n) => n.key === activeTab)?.label || "Dashboard"}
            </Typography>
            <Box
              onClick={handleMenuOpen}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                cursor: "pointer",
                bgcolor: "#f5f5f5",
                px: 1.5,
                py: 0.5,
                borderRadius: 10,
                "&:hover": {
                  bgcolor: "#ececec",
                },
              }}
            >
              <Avatar
                sx={{
                  bgcolor: "#6c5ce7",
                  width: 36,
                  height: 36,
                }}
              >
                {(student?.studentName || "S")[0].toUpperCase()}
              </Avatar>

              <Typography
                variant="body2"
                sx={{ fontWeight: 600 }}
              >
                {student?.studentName}
              </Typography>

              <KeyboardArrowDownRoundedIcon />
            </Box>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
            >
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutRoundedIcon color="error" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        <Box className="p-6 md:p-10">
          {activeTab === "dashboard" && (
            <Fade in timeout={500}>
              <Box>
                {/* Welcome Banner */}
                <Slide in direction="down" timeout={450}>
                  <Box
                    className="rounded-2xl px-8 py-7 mb-6 flex items-center justify-between"
                    sx={{
                      minHeight: "25vh",
                      background: "linear-gradient(135deg, #6c5ce7, #0984e3)",
                      color: "#fff",
                      boxShadow: "0 10px 30px -10px rgba(108, 92, 231, 0.5)",
                    }}
                  >
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                        Welcome, {student?.fullName || "Student"}!
                      </Typography>
                      <Typography sx={{ opacity: 0.9 }}>Glad to see you back 🎉</Typography>
                    </Box>
                    <SchoolRoundedIcon sx={{ fontSize: 70, color: "#ffeaa7" }} />
                  </Box>
                </Slide>

                {/* Student Info */}
                <Grow in timeout={550}>
                  <Card elevation={0} sx={{ border: "1px solid #e2e8f0", mb: 3 }}>
                    <CardContent className="flex items-center gap-4">
                      <Avatar sx={{ width: 80, height: 80, border: "3px solid #3498db" }}>
                        <SchoolRoundedIcon sx={{ fontSize: 36 }} />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 700, mb: 1.5, pb: 0.5, borderBottom: "2px solid #f0f0f0" }}
                        >
                          Student Information
                        </Typography>
                        <Box className="flex flex-wrap gap-6">
                          <Typography variant="body2">
                            <strong>ID:</strong> {student?.studentId}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Course:</strong> {student?.course}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Year:</strong> {student?.year}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Mentor Assigned:</strong>{" "}
                            {student.assignedMentorId
                              ? `${student.assignedMentorId.firstName} ${student.assignedMentorId.lastName}`
                              : "Not Assigned"}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grow>

                {/* Quick Stats */}
                <Grid container spacing={3} className="mb-6">
                  <Grid item xs={12} sm={4}>
                    <Grow in timeout={400}>
                      <Card
                        elevation={0}
                        className="transition-all duration-300"
                        sx={{
                          border: "1px solid #e2e8f0",
                          "&:hover": { transform: "translateY(-4px)", boxShadow: "0 12px 24px -8px rgba(15,23,42,0.15)" },
                        }}
                      >
                        <CardContent className="flex items-center gap-3">
                          <Avatar sx={{ bgcolor: "success.main", width: 44, height: 44 }}>
                            <HowToRegRoundedIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Attendance
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                              80%
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grow>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Grow in timeout={500}>
                      <Card
                        elevation={0}
                        className="transition-all duration-300"
                        sx={{
                          border: "1px solid #e2e8f0",
                          "&:hover": { transform: "translateY(-4px)", boxShadow: "0 12px 24px -8px rgba(15,23,42,0.15)" },
                        }}
                      >
                        <CardContent className="flex items-center gap-3">
                          <Avatar
                            sx={{
                              bgcolor: student.tuitionFeesUpToDate === "Yes" ? "success.main" : "warning.main",
                              width: 44,
                              height: 44,
                            }}
                          >
                            <PaidRoundedIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Fees
                            </Typography>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                              {student.tuitionFeesUpToDate === "Yes" ? "Up-to-date" : "Pending"}
                            </Typography>
                            {student.totalCourseFees && student.paidFees !== undefined && (
                              <Typography variant="caption" color="text.secondary">
                                {student.paidFees} / {student.totalCourseFees}
                                {student.dueDate && student.tuitionFeesUpToDate !== "Yes"
                                  ? ` — Due by ${student.dueDate}`
                                  : ""}
                              </Typography>
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    </Grow>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Grow in timeout={600}>
                      <Card
                        elevation={0}
                        className="transition-all duration-300"
                        sx={{
                          border: "1px solid #e2e8f0",
                          "&:hover": { transform: "translateY(-4px)", boxShadow: "0 12px 24px -8px rgba(15,23,42,0.15)" },
                        }}
                      >
                        <CardContent className="flex items-center gap-3">
                          <Avatar sx={{ bgcolor: "success.main", width: 44, height: 44 }}>
                            <ShieldRoundedIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Dropout Risk
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                              Low
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grow>
                  </Grid>
                </Grid>

                {/* Charts */}
                <Grid container spacing={3}>
                  <Grid item xs={12} md={5}>
                    <Grow in timeout={700}>
                      <Card elevation={0} sx={{ border: "1px solid #e2e8f0" }}>
                        <CardContent>
                          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                            Attendance Overview
                          </Typography>
                          <Box className="flex justify-center">
                            <PieChart width={300} height={250}>
                              <Pie
                                data={attendanceData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                label
                              >
                                {attendanceData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                              <Legend />
                            </PieChart>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grow>
                  </Grid>

                  <Grid item xs={12} md={7}>
                    <Grow in timeout={800}>
                      <Card elevation={0} sx={{ border: "1px solid #e2e8f0" }}>
                        <CardContent>
                          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                            Test Scores
                          </Typography>
                          <Box className="flex justify-center">
                            <BarChart width={420} height={250} data={testScores}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="subject" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="score" fill="#3498db" radius={[6, 6, 0, 0]} />
                            </BarChart>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grow>
                  </Grid>
                </Grid>
              </Box>
            </Fade>
          )}

          {activeTab === "fees" && (
            <Fade in timeout={400}>
              <Box>
                <FeePayment />
              </Box>
            </Fade>
          )}
          {activeTab === "attendance" && (
            <Fade in timeout={400}>
              <Box>
                <Attendance studentId={student?.studentId} />
              </Box>
            </Fade>
          )}

          {activeTab === "attendance-subject" && (
            <Fade in timeout={400}>
              <Box>
                <StudentAttendanceView studentId={student?.studentId} />  {/* ✅ new tab */}
              </Box>
            </Fade>
          )}

          {activeTab === "leave" && (
            <Fade in timeout={400}>
              <Box>
                <LeaveForm studentId={student._id} />
              </Box>
            </Fade>
          )}
          {activeTab === "notification" && (
            <Fade in timeout={400}>
              <Box>
                <StudentNotifications />
              </Box>
            </Fade>
          )}
        </Box>
      </Box>
    </Box>
  );
}