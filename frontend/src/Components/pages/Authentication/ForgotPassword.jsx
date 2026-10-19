// src/Components/pages/ForgotPassword.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Avatar,
  Fade,
  Grow,
} from "@mui/material";
import LockResetRoundedIcon from "@mui/icons-material/LockResetRounded";
import MailRoundedIcon from "@mui/icons-material/MailRounded";
import PinRoundedIcon from "@mui/icons-material/PinRounded";
import VpnKeyRoundedIcon from "@mui/icons-material/VpnKeyRounded";

const steps = ["Email", "Verify OTP", "Reset Password"];

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const isError = message.includes("❌");

  const validateEmail = (mail) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(mail).toLowerCase());

  const handleSendOTP = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setMessage("");
    if (!email) return setMessage("Enter your email ❌");
    if (!validateEmail(email)) return setMessage("Enter a valid email ❌");
    if (!API_URL) return setMessage("API URL not configured (VITE_API_URL) ❌");

    try {
      setIsLoading(true);
      const res = await axios.post(`${API_URL}/auth/forgot-password`, {
        email,
      });
      const data = res?.data || {};
      setMessage(data.msg || "OTP sent ✅");
      setStep(2);
      setResendTimer(60);
    } catch (err) {
      console.error("send OTP error:", err);
      setMessage(
        err?.response?.data?.msg || err?.message || "Error sending OTP ❌"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setMessage("");
    if (!otp) return setMessage("Enter OTP ❌");
    if (!API_URL) return setMessage("API URL not configured (VITE_API_URL) ❌");

    try {
      setIsLoading(true);
      const res = await axios.post(`${API_URL}/auth/verify-otp`, {
        email,
        otp,
      });
      const data = res?.data || {};
      if (data.success) {
        setMessage(data.msg || "OTP verified ✅");
        setStep(3);
      } else {
        setMessage(data.msg || "OTP verification failed ❌");
      }
    } catch (err) {
      console.error("verify OTP error:", err);
      setMessage(
        err?.response?.data?.msg || err?.message || "OTP verification failed ❌"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    await handleSendOTP();
  };

  const handleResetPassword = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setMessage("");
    if (!newPassword) return setMessage("Enter new password ❌");
    if (!API_URL) return setMessage("API URL not configured (VITE_API_URL) ❌");

    try {
      setIsLoading(true);
      const res = await axios.post(`${API_URL}/auth/reset-password`, {
        email,
        otp,
        newPassword,
      });
      const data = res?.data || {};

      if (data.success || data.msg?.includes("successful")) {
        setMessage(data.msg || "Password reset successful ✅");
        navigate("/login", { replace: true });
      } else {
        setMessage(data.msg || "Password reset failed ❌");
      }
    } catch (err) {
      console.error("reset password error:", err);
      setMessage(
        err?.response?.data?.msg ||
        err?.message ||
        "Error resetting password ❌"
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
            maxWidth: 420,
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
                  <LockResetRoundedIcon />
                </Avatar>
                <Typography variant="h5" sx={{ fontWeight: 700, color: "#333" }}>
                  Forgot Password
                </Typography>
              </Box>
            </Fade>

            <Stepper activeStep={step - 1} alternativeLabel sx={{ mb: 3 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            <Box
              component="form"
              onSubmit={
                step === 1
                  ? handleSendOTP
                  : step === 2
                    ? handleVerifyOTP
                    : handleResetPassword
              }
              className="flex flex-col gap-4"
            >
              {step === 1 && (
                <Fade in timeout={350}>
                  <Box className="flex flex-col gap-4">
                    <TextField
                      fullWidth
                      type="email"
                      label="Registered Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      InputProps={{
                        startAdornment: (
                          <MailRoundedIcon sx={{ color: "#4f46e5", mr: 1 }} fontSize="small" />
                        ),
                      }}
                    />
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
                        "&:hover": { transform: "scale(1.03)" },
                        "&.Mui-disabled": { opacity: 0.7, color: "#fff" },
                      }}
                    >
                      {isLoading ? "Sending..." : "Send OTP"}
                    </Button>
                  </Box>
                </Fade>
              )}

              {step === 2 && (
                <Fade in timeout={350}>
                  <Box className="flex flex-col gap-4">
                    <TextField
                      fullWidth
                      label="Enter OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      inputMode="numeric"
                      inputProps={{ pattern: "[0-9]*" }}
                      InputProps={{
                        startAdornment: (
                          <PinRoundedIcon sx={{ color: "#4f46e5", mr: 1 }} fontSize="small" />
                        ),
                      }}
                    />
                    <Box className="flex gap-2">
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
                          "&:hover": { transform: "scale(1.03)" },
                          "&.Mui-disabled": { opacity: 0.7, color: "#fff" },
                        }}
                      >
                        {isLoading ? "Verifying..." : "Verify OTP"}
                      </Button>
                      <Button
                        type="button"
                        fullWidth
                        variant="outlined"
                        onClick={handleResend}
                        disabled={resendTimer > 0 || isLoading}
                        sx={{ py: 1.3, fontWeight: 700 }}
                      >
                        {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend"}
                      </Button>
                    </Box>
                  </Box>
                </Fade>
              )}

              {step === 3 && (
                <Fade in timeout={350}>
                  <Box className="flex flex-col gap-4">
                    <TextField
                      fullWidth
                      type="password"
                      label="New Password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      InputProps={{
                        startAdornment: (
                          <VpnKeyRoundedIcon sx={{ color: "#4f46e5", mr: 1 }} fontSize="small" />
                        ),
                      }}
                    />
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
                        "&:hover": { transform: "scale(1.03)" },
                        "&.Mui-disabled": { opacity: 0.7, color: "#fff" },
                      }}
                    >
                      {isLoading ? "Resetting..." : "Reset Password"}
                    </Button>
                  </Box>
                </Fade>
              )}
            </Box>

            {message && (
              <Fade in timeout={300}>
                <Alert severity={isError ? "error" : "success"} sx={{ mt: 2.5 }}>
                  {message.replace(/\s*[✅❌]\s*$/, "")}
                </Alert>
              </Fade>
            )}
          </CardContent>
        </Card>
      </Grow>
    </Box>
  );
}