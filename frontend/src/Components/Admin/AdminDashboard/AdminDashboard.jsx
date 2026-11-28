import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  ThemeProvider,
  CssBaseline,
  Drawer,
  AppBar,
  Toolbar,
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
  Grid,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Chip,
  Avatar,
  Divider,
  Fade,
  Grow,
  Slide,
  Menu,
  MenuItem,
} from "@mui/material";
import SpaceDashboardRoundedIcon from "@mui/icons-material/SpaceDashboardRounded";

import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import SupervisorAccountRoundedIcon from "@mui/icons-material/SupervisorAccountRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import ForumRoundedIcon from "@mui/icons-material/ForumRounded";
import EventBusyRoundedIcon from "@mui/icons-material/EventBusyRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import PendingActionsRoundedIcon from "@mui/icons-material/PendingActionsRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import EventNoteRoundedIcon from "@mui/icons-material/EventNoteRounded";

import theme from "./theme";

import ManageStudents from "../Pages/ManageStudents";
import ManageMentors from "../Pages/ManageMentors";
import ManageAcademics from "../Pages/ManageAcademics";
import FeeManagement from "../Fee/FeeManagement";
import AdminLeaveDashboard from "../Leave/AdminLeaveDashboard";
import ManageTimetable from "../Pages/ManageTimetable";
import CounsellingDashboard from "../../pages/Counsellings/CounsellingDashboard";
import Counselling from "../../pages/Counsellings/Counselling";
import Counsellor from "../../pages/Counsellings/Counsellor";
import ResultManagement from "../../pages/Grades/ResultManagement";
import PromotionManagement from "../../pages/Grades/PromotionManagement";

const DRAWER_WIDTH = 230;

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: <SpaceDashboardRoundedIcon /> },
  { key: "fees", label: "Fee Management", icon: <PaymentsRoundedIcon /> },
  { key: "mentors", label: "Manage Mentors", icon: <SupervisorAccountRoundedIcon /> },
  { key: "students", label: "Manage Students", icon: <SchoolRoundedIcon /> },
  { key: "academics", label: "Courses & Subjects", icon: <MenuBookRoundedIcon /> },
  { key: "timetable", label: "Manage Timetable", icon: <EventNoteRoundedIcon /> },
  { key: "results", label: "Academic Results", icon: <MenuBookRoundedIcon /> },
  { key: "promotions", label: "Student Promotions", icon: <PendingActionsRoundedIcon /> },
  { key: "counselling", label: "Counselling", icon: <ForumRoundedIcon /> },
  { key: "leave", label: "Leave Management", icon: <EventBusyRoundedIcon /> },
];

function riskTone(p) {
  const probability = p > 1 ? p : p * 100;
  if (probability >= 70) return { label: "High", color: "error" };
  if (probability >= 40) return { label: "Moderate", color: "warning" };
  return { label: "Low", color: "success" };
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [students, setStudents] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalMentors, setTotalMentors] = useState(0);
  const [academicPrograms, setAcademicPrograms] = useState([]);
  const [interventionSummary, setInterventionSummary] = useState({
    total: 0,
    active: 0,
    completed: 0,
    followUpsDue: 0,
  });
  const [counsellingView, setCounsellingView] = useState("dashboard");

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
    localStorage.removeItem("admin");

    // Login Page
    window.location.href = "/loginoptions";
  };



  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    Promise.allSettled([
      axios.get("http://localhost:5000/api/students"),
      axios.get("http://localhost:5000/api/mentors/count"),
      axios.get("http://localhost:5000/api/academics", { headers }),
      axios.get("http://localhost:5000/api/interventions/summary", { headers }),
    ])
      .then(([studentsResult, mentorsResult, academicsResult, interventionsResult]) => {
        if (studentsResult.status === "fulfilled") {
          const studentList = Array.isArray(studentsResult.value.data)
            ? studentsResult.value.data
            : [];
          setStudents(studentList);
          setTotalStudents(studentList.length);
        } else {
          console.error("Failed to load students:", studentsResult.reason);
        }

        if (mentorsResult.status === "fulfilled") {
          setTotalMentors(mentorsResult.value.data.totalMentors || 0);
        } else {
          console.error("Failed to load mentors:", mentorsResult.reason);
        }

        if (academicsResult.status === "fulfilled") {
          setAcademicPrograms(
            Array.isArray(academicsResult.value.data) ? academicsResult.value.data : []
          );
        } else {
          console.error("Failed to load academic programs:", academicsResult.reason);
        }

        if (interventionsResult.status === "fulfilled") {
          setInterventionSummary(interventionsResult.value.data);
        } else {
          console.error("Failed to load intervention summary:", interventionsResult.reason);
        }
      });
  }, []);

  const highRiskStudents = students
    .filter((student) =>
      student.risk === "High" ||
      Number(student.dropout_probability || 0) >= 70
    )
    .sort((a, b) =>
      Number(b.dropout_probability || 0) - Number(a.dropout_probability || 0)
    );

  const atRiskCount = students.filter((student) =>
    student.risk === "High" ||
    student.risk === "Moderate" ||
    Number(student.dropout_probability || 0) >= 40
  ).length;

  const predictedStudents = students.filter(
    (student) => student.predictedAt || student.dropout_probability > 0
  );
  const dropoutPercentage = predictedStudents.length
    ? (
        (predictedStudents.filter((student) =>
          student.risk === "High" ||
          Number(student.dropout_probability || 0) >= 70
        ).length / predictedStudents.length) *
        100
      ).toFixed(1)
    : "0.0";

  const summaryCards = [
    {
      label: "Total Students",
      value: totalStudents,
      icon: <SchoolRoundedIcon />,
      tone: "primary",
    },
    {
      label: "Total Mentors",
      value: totalMentors,
      icon: <GroupsRoundedIcon />,
      tone: "secondary",
    },
    {
      label: "At-Risk Students",
      value: atRiskCount,
      icon: <PendingActionsRoundedIcon />,
      tone: "warning",
    },
  ];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
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
              bgcolor: "secondary.main",
              color: "#fff",
              border: "none",
            },
          }}
        >
          <Toolbar sx={{ py: 3 }}>
            <Box className="flex items-center gap-2">
              <ShieldRoundedIcon sx={{ color: "primary.light" }} />
              <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: "-0.01em" }}>
                Admin Panel
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
                      bgcolor: isActive ? "primary.main" : "transparent",
                      "&:hover": {
                        bgcolor: isActive ? "primary.dark" : "rgba(255,255,255,0.08)",
                        transform: "translateX(4px)",
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: "#fff", minWidth: 36 }}>
                      {item.icon}
                    </ListItemIcon>
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
            sx={{
              bgcolor: "background.paper",
              color: "text.primary",
              borderBottom: "1px solid #e2e8f0",
            }}
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
                  A
                </Avatar>

                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Admin
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
                      className="rounded-2xl px-8 py-7 mb-6 flex items-center justify-between relative overflow-hidden"
                      sx={{
                        background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 60%, #0f172a 130%)",
                        color: "#fff",
                        boxShadow: "0 10px 30px -10px rgba(37, 99, 235, 0.5)",
                      }}
                    >
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                          Welcome, Admin!
                        </Typography>
                        <Typography sx={{ opacity: 0.9 }}>
                          Here you can manage the entire system.
                        </Typography>
                      </Box>
                      <ShieldRoundedIcon
                        sx={{
                          fontSize: 90,
                          opacity: 0.25,
                          position: "absolute",
                          right: 28,
                        }}
                      />
                    </Box>
                  </Slide>

                  {/* Summary Cards */}
                  <Grid container spacing={3} className="mb-6">
                    {summaryCards.map((c, idx) => (
                      <Grid item xs={12} sm={4} key={c.label}>
                        <Grow in timeout={400 + idx * 150}>
                          <Card
                            elevation={0}
                            className="transition-all duration-300"
                            sx={{
                              border: "1px solid #e2e8f0",
                              "&:hover": {
                                transform: "translateY(-4px)",
                                boxShadow: "0 12px 24px -8px rgba(15, 23, 42, 0.15)",
                              },
                            }}
                          >
                            <CardContent className="flex items-center gap-4">
                              <Avatar
                                sx={{
                                  bgcolor: `${c.tone}.main`,
                                  width: 48,
                                  height: 48,
                                }}
                              >
                                {c.icon}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  {c.label}
                                </Typography>
                                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                  {c.value}
                                </Typography>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grow>
                      </Grid>
                    ))}
                  </Grid>

                  <Grid container spacing={3}>
                    {/* High Risk Students */}
                    <Grid item xs={12} md={7}>
                      <Grow in timeout={650}>
                        <Card elevation={0} sx={{ border: "1px solid #e2e8f0", height: "100%" }}>
                          <CardContent>
                            <Typography variant="h6" className="mb-3">
                              High Risk Students
                            </Typography>
                            <TableContainer sx={{ maxHeight: 360 }}>
                              <Table stickyHeader size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell sx={{ fontWeight: 700 }}>Student ID</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Course</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Risk Level</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }} align="right">
                                      Dropout %
                                    </TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {highRiskStudents.map((stu, idx) => {
                                    const probability = Number(stu.dropout_probability || 0);
                                    const tone = riskTone(probability);
                                    return (
                                      <Fade in timeout={400 + idx * 120} key={stu.studentId || stu._id || idx}>
                                        <TableRow
                                          hover
                                          className="transition-colors"
                                          sx={{
                                            "&:hover": { bgcolor: "rgba(37, 99, 235, 0.04)" },
                                          }}
                                        >
                                          <TableCell>{stu.studentId || "N/A"}</TableCell>
                                          <TableCell>{stu.fullName || stu.name || "Unknown"}</TableCell>
                                          <TableCell>{stu.courseApplied || stu.course || "N/A"}</TableCell>
                                          <TableCell>
                                            <Chip
                                              label={tone.label}
                                              color={tone.color}
                                              size="small"
                                              sx={{
                                                fontWeight: 700,
                                                animation:
                                                  tone.label === "High"
                                                    ? "pulseGlow 2s infinite"
                                                    : "none",
                                              }}
                                            />
                                          </TableCell>
                                          <TableCell align="right" sx={{ fontWeight: 600 }}>
                                            {probability.toFixed(1)}%
                                          </TableCell>
                                        </TableRow>
                                      </Fade>
                                    );
                                  })}
                                  {highRiskStudents.length === 0 && (
                                    <TableRow>
                                      <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                                        <Typography color="text.secondary">
                                          No high-risk students found.
                                        </Typography>
                                      </TableCell>
                                    </TableRow>
                                  )}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </CardContent>
                        </Card>
                      </Grow>
                    </Grid>

                    {/* Institute Summary */}
                    <Grid item xs={12} md={5}>
                      <Grow in timeout={800}>
                        <Card elevation={0} sx={{ border: "1px solid #e2e8f0", height: "100%" }}>
                          <CardContent>
                            <Typography variant="h6" className="mb-3">
                              Institute Summary
                            </Typography>
                            {[
                              { label: "Courses / Programs", value: academicPrograms.length },
                              {
                                label: "Configured Periods",
                                value: academicPrograms.reduce(
                                  (total, program) => total + Number(program.periodCount || 0),
                                  0
                                ),
                              },
                              { label: "High-Risk Percentage", value: `${dropoutPercentage}%` },
                              { label: "Predicted Students", value: predictedStudents.length },
                              { label: "Active Interventions", value: interventionSummary.active },
                              { label: "Follow-ups Due (7 Days)", value: interventionSummary.followUpsDue },
                            ].map((row, idx) => (
                              <Box key={row.label}>
                                <Box className="flex justify-between items-center py-2.5">
                                  <Typography color="text.secondary">{row.label}</Typography>
                                  <Typography sx={{ fontWeight: 700 }}>{row.value}</Typography>
                                </Box>
                                {idx < 5 && <Divider />}
                              </Box>
                            ))}
                          </CardContent>
                        </Card>
                      </Grow>
                    </Grid>
                  </Grid>
                </Box>
              </Fade>
            )}

            {activeTab === "students" && (
              <Fade in timeout={400}>
                <Box>
                  <ManageStudents isActiveTab={activeTab === "students"} />
                </Box>
              </Fade>
            )}

            {activeTab === "fees" && (
              <Fade in timeout={400}>
                <Box>
                  <FeeManagement />
                </Box>
              </Fade>
            )}

            {activeTab === "mentors" && (
              <Fade in timeout={400}>
                <Box>
                  <ManageMentors />
                </Box>
              </Fade>
            )}

            {activeTab === "academics" && (
              <Fade in timeout={400}>
                <Box>
                  <ManageAcademics />
                </Box>
              </Fade>
            )}

            {activeTab === "timetable" && (
              <Fade in timeout={400}>
                <Box>
                  <ManageTimetable />
                </Box>
              </Fade>
            )}

            {activeTab === "results" && (
              <Fade in timeout={400}>
                <Box>
                  <ResultManagement />
                </Box>
              </Fade>
            )}

            {activeTab === "promotions" && (
              <Fade in timeout={400}>
                <Box>
                  <PromotionManagement />
                </Box>
              </Fade>
            )}

            {activeTab === "counselling" && (
              <Fade in timeout={400}>
                {counsellingView === "dashboard" ? (
                  <CounsellingDashboard
                    onSelectCounselling={() => setCounsellingView("select")}
                    onGiveCounselling={() => setCounsellingView("give")}
                  />
                ) : counsellingView === "select" ? (
                  <Counselling
                    students={highRiskStudents}
                    goBack={() => setCounsellingView("dashboard")}
                  />
                ) : (
                  <Counsellor
                    students={highRiskStudents}
                    goBack={() => setCounsellingView("dashboard")}
                  />
                )}
              </Fade>
            )}

            {activeTab === "leave" && (
              <Fade in timeout={400}>
                <Box>
                  <AdminLeaveDashboard />
                </Box>
              </Fade>
            )}
          </Box>
        </Box>
      </Box>

      <style>{`
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4); }
          50% { box-shadow: 0 0 0 6px rgba(220, 38, 38, 0); }
        }
      `}</style>
    </ThemeProvider>
  );
}