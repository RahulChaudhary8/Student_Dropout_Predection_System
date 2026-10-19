import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Avatar,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Fade,
  Grow,
} from "@mui/material";
import BuildRoundedIcon from "@mui/icons-material/BuildRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import CastForEducationRoundedIcon from "@mui/icons-material/CastForEducationRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import MailRoundedIcon from "@mui/icons-material/MailRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";

const roleOptions = [
  {
    role: "admin",
    title: "Admin Login",
    desc: "Access system settings and manage everything.",
    icon: <BuildRoundedIcon />,
  },
  {
    role: "mentor",
    title: "Mentor / Teacher Login",
    desc: "Access student data, monitor risks, and give counseling.",
    icon: <CastForEducationRoundedIcon />,
  },
  {
    role: "student",
    title: "Student Login",
    desc: "Student View there attendence and score details.",
    icon: <SchoolRoundedIcon />,
  },
];

export default function LoginOptions() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState("");
  const [email, setEmail] = useState("");
  const [mentorId, setMentorId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const activeRoleInfo = roleOptions.find((r) => r.role === selectedRole);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { role: selectedRole, password };

      if (selectedRole === "admin") payload.email = email;
      if (selectedRole === "mentor") payload.mentorId = mentorId;
      if (selectedRole === "student") payload.studentId = studentId;

      const res = await axios.post("http://localhost:5000/api/role-auth/login", payload);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", selectedRole);

      if (selectedRole === "admin") navigate("/admin");
      if (selectedRole === "mentor") navigate("/dashboard");
      if (selectedRole === "student") navigate("/studentportal");
    } catch (err) {
      alert(err.response?.data?.msg || "Login failed");
    }
  };

  const handleBack = () => {
    setSelectedRole("");
    setEmail("");
    setMentorId("");
    setStudentId("");
    setPassword("");
    setShowPassword(false);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: { xs: 6, md: 8 },
        px: 2,
        textAlign: "center",
      }}
    >
      <Fade in timeout={500}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: "secondary.main", mb: 5 }}>
          Select Your Login
        </Typography>
      </Fade>

      {/* Role Selection Cards */}
      {!selectedRole && (
        <Grid container spacing={3} justifyContent="center" sx={{ maxWidth: 1100, mx: "auto" }}>
          {roleOptions.map((opt, idx) => (
            <Grid item xs={12} sm={6} md={4} key={opt.role}>
              <Grow in timeout={350 + idx * 150}>
                <Card
                  elevation={0}
                  className="transition-all duration-300"
                  sx={{
                    height: "100%",
                    borderRadius: 4,
                    border: "1px solid #e2e8f0",
                    bgcolor: "#f9f9f9",
                    "&:hover": {
                      transform: "translateY(-6px)",
                      bgcolor: "#eef6ff",
                      boxShadow: "0 14px 28px -10px rgba(37, 99, 235, 0.25)",
                    },
                  }}
                >
                  <CardContent sx={{ p: 0.5, display: "flex", flexDirection: "column", height: "100%" }}>
                    <Avatar
                      sx={{
                        bgcolor: "primary.main",
                        width: 52,
                        height: 52,
                        mb: 2,
                      }}
                    >
                      {opt.icon}
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                      {opt.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3, flexGrow: 1 }}>
                      {opt.desc}
                    </Typography>
                    <Button
                      fullWidth
                      onClick={() => setSelectedRole(opt.role)}
                      className="transition-all duration-200"
                      sx={{
                        py: 1.2,
                        color: "#fff",
                        fontWeight: 700,
                        background: "linear-gradient(135deg, #667eea, #764ba2)",
                        "&:hover": {
                          background: "linear-gradient(135deg, #764ba2, #667eea)",
                          transform: "translateY(-2px)",
                        },
                      }}
                    >
                      Login Here
                    </Button>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Role-based Login Form — single shared card, fields swap inline */}
      {selectedRole && (
        <Grow in timeout={400}>
          <Card
            elevation={0}
            sx={{
              maxWidth: 400,
              mx: "auto",
              borderRadius: 4,
              border: "1px solid #e2e8f0",
              boxShadow: "0 10px 30px -10px rgba(15, 23, 42, 0.15)",
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Fade in timeout={400} key={selectedRole}>
                <Box>
                  <Box className="flex flex-col items-center mb-4">
                    <Avatar
                      sx={{
                        width: 56,
                        height: 56,
                        mb: 1.5,
                        background: "linear-gradient(135deg, #667eea, #764ba2)",
                      }}
                    >
                      {activeRoleInfo.icon}
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {activeRoleInfo.title}
                    </Typography>
                  </Box>

                  <Box component="form" onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {selectedRole === "admin" && (
                      <TextField
                        fullWidth
                        type="email"
                        label="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <MailRoundedIcon sx={{ color: "#764ba2" }} fontSize="small" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}

                    {selectedRole === "mentor" && (
                      <TextField
                        fullWidth
                        label="Mentor ID"
                        value={mentorId}
                        onChange={(e) => setMentorId(e.target.value)}
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <BadgeRoundedIcon sx={{ color: "#764ba2" }} fontSize="small" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}

                    {selectedRole === "student" && (
                      <TextField
                        fullWidth
                        label="Student ID"
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <BadgeRoundedIcon sx={{ color: "#764ba2" }} fontSize="small" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}

                    <TextField
                      fullWidth
                      type={showPassword ? "text" : "password"}
                      label="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockRoundedIcon sx={{ color: "#764ba2" }} fontSize="small" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              size="small"
                              onClick={() => setShowPassword((prev) => !prev)}
                              edge="end"
                            >
                              {showPassword ? (
                                <VisibilityOffRoundedIcon fontSize="small" />
                              ) : (
                                <VisibilityRoundedIcon fontSize="small" />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />

                    <Button
                      type="submit"
                      fullWidth
                      startIcon={<LoginRoundedIcon />}
                      className="transition-all duration-200"
                      sx={{
                        py: 1.3,
                        mt: 0.5,
                        color: "#fff",
                        fontWeight: 700,
                        background: "linear-gradient(135deg, #667eea, #764ba2)",
                        "&:hover": {
                          background: "linear-gradient(135deg, #764ba2, #667eea)",
                          transform: "translateY(-2px)",
                        },
                      }}
                    >
                      Login
                    </Button>
                  </Box>

                  <Button
                    fullWidth
                    startIcon={<ArrowBackRoundedIcon />}
                    onClick={handleBack}
                    sx={{ mt: 2, color: "text.secondary", fontWeight: 600 }}
                  >
                    Back to Role Selection
                  </Button>
                </Box>
              </Fade>
            </CardContent>
          </Card>
        </Grow>
      )}
    </Box>
  );
}