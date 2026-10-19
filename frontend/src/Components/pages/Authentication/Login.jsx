import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import {
  Box,
  Card,
  CardContent,
  Avatar,
  Typography,
  TextField,
  Button,
  Alert,
  Fade,
  Grow,
} from "@mui/material";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import MailRoundedIcon from "@mui/icons-material/MailRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isError =
    message.includes("❌") ||
    /failed|not configured|enter email|invalid|wrong/i.test(message) &&
    !message.includes("✅");

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!API_URL) return setMessage("API URL not configured (VITE_API_URL)");

    if (!email || !password) {
      setMessage("Please enter email and password.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });
      const data = res?.data || {};
      console.log("🔑 Login response:", data);
      if (data.success) {
        login({ token: data.token, user: data.user });
        setMessage(data.msg || "Login successful ✅");
        navigate("/dashboard", { replace: true });
      } else {
        const msg = data.msg || "Login failed ❌ Please try again";
        setMessage(msg);

        const lowered = String(msg).toLowerCase();
        if (
          lowered.includes("not found") ||
          lowered.includes("no user") ||
          lowered.includes("doesn't exist")
        ) {
          setTimeout(() => navigate("/signup", { replace: true }), 1200);
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      const errMsg =
        err?.response?.data?.msg || err?.message || "Login failed ❌";
      setMessage(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2.5,
        background: "linear-gradient(to right, #2563eb, #4f46e5)",
      }}
    >
      <Grow in timeout={500}>
        <Card
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: 400,
            borderRadius: 4,
            boxShadow: "0 8px 20px rgba(0, 0, 0, 0.25)",
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Fade in timeout={500}>
              <Box className="flex flex-col items-center mb-4">
                <Avatar
                  sx={{
                    width: 56,
                    height: 56,
                    mb: 1.5,
                    background: "linear-gradient(to right, #2563eb, #4f46e5)",
                  }}
                >
                  <LoginRoundedIcon />
                </Avatar>
                <Typography variant="h5" sx={{ fontWeight: 700, color: "#333" }}>
                  Login
                </Typography>
              </Box>
            </Fade>

            <Box component="form" onSubmit={handleLogin} className="flex flex-col gap-4">
              <TextField
                fullWidth
                type="email"
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                InputProps={{
                  startAdornment: (
                    <MailRoundedIcon sx={{ color: "#4f46e5", mr: 1 }} fontSize="small" />
                  ),
                }}
              />
              <TextField
                fullWidth
                type="password"
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                InputProps={{
                  startAdornment: (
                    <LockRoundedIcon sx={{ color: "#4f46e5", mr: 1 }} fontSize="small" />
                  ),
                }}
              />

              {message && (
                <Fade in timeout={300}>
                  <Alert severity={isError ? "error" : "success"}>
                    {message.replace(/\s*[✅❌]\s*$/, "")}
                  </Alert>
                </Fade>
              )}

              <Button
                type="submit"
                fullWidth
                disabled={isLoading}
                className="transition-all duration-200"
                sx={{
                  py: 1.3,
                  color: "#fff",
                  fontWeight: 700,
                  background: "linear-gradient(to right, #2563eb, #4f46e5)",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.2)",
                  "&:hover": { transform: "scale(1.05)" },
                  "&.Mui-disabled": { opacity: 0.7, color: "#fff" },
                }}
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </Box>

            <Typography sx={{ mt: 3, textAlign: "center", fontSize: 14, color: "text.secondary" }}>
              <Link to="/forgot-password" style={{ color: "#4f46e5", fontWeight: 500, textDecoration: "none" }}>
                Forgot Password?
              </Link>
              {" | "}
              <Link to="/signup" style={{ color: "#4f46e5", fontWeight: 500, textDecoration: "none" }}>
                Sign Up
              </Link>
            </Typography>
          </CardContent>
        </Card>
      </Grow>
    </Box>
  );
}