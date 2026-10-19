// src/Components/pages/SignUp.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
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
import PersonAddRoundedIcon from "@mui/icons-material/PersonAddRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import MailRoundedIcon from "@mui/icons-material/MailRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import RocketLaunchRoundedIcon from "@mui/icons-material/RocketLaunchRounded";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const isError = message.includes("❌") || message.includes("not configured");

  const handleSignUp = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setMessage("");
    if (!name || !email || !password) {
      setMessage("All fields are required ❌");
      return;
    }
    if (!API_URL) {
      setMessage("API URL not configured (VITE_API_URL)");
      return;
    }

    try {
      setIsLoading(true);
      const res = await axios.post(`${API_URL}/auth/register`, {
        name,
        email,
        password,
      });
      const data = res?.data || {};
      console.log("Signup response:", data);

      if (data.msg?.includes("Signup successful")) {
        navigate("/login", { replace: true });
      } else {
        setMessage(data.msg || "Signup failed ❌");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setMessage(
        err?.response?.data?.msg || err?.message || "Error signing up ❌"
      );
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
                  <PersonAddRoundedIcon />
                </Avatar>
                <Typography variant="h5" sx={{ fontWeight: 700, color: "#333" }}>
                  Create Account
                </Typography>
              </Box>
            </Fade>

            <Box component="form" onSubmit={handleSignUp} className="flex flex-col gap-4">
              <TextField
                fullWidth
                label="Name"
                placeholder="Enter Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                InputProps={{
                  startAdornment: (
                    <BadgeRoundedIcon sx={{ color: "#4f46e5", mr: 1 }} fontSize="small" />
                  ),
                }}
              />
              <TextField
                fullWidth
                type="email"
                label="Email"
                placeholder="Enter Email"
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
                placeholder="Enter Password"
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
                    {message.replace(/\s*❌\s*$/, "")}
                  </Alert>
                </Fade>
              )}

              <Button
                type="submit"
                fullWidth
                disabled={isLoading}
                endIcon={!isLoading && <RocketLaunchRoundedIcon />}
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
                {isLoading ? "Creating..." : "Sign Up"}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grow>
    </Box>
  );
}