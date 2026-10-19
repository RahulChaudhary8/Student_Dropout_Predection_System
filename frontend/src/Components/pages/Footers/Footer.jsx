// src/Components/Footer.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Box, Grid, Typography, Link as MuiLink, Divider, Fade } from "@mui/material";
import SmartToyRoundedIcon from "@mui/icons-material/SmartToyRounded";
import MailRoundedIcon from "@mui/icons-material/MailRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";

const quickLinks = [
  { label: "Home", to: "/home" },
  { label: "Dashboard", to: "/dashboard" },
  { label: "Login", to: "/login" },
  { label: "Sign Up", to: "/signup" },
  { label: "Forgot Password", to: "/forgot-password" },
];

export default function Footer() {
  return (
    <Fade in timeout={500}>
      <Box
        component="footer"
        sx={{
          bgcolor: "#0d1117",
          color: "#c9d1d9",
          pt: 5,
          pb: 1.5,
          px: 2.5,
          mt: 5,
        }}
      >
        <Grid container spacing={3} sx={{ maxWidth: 1200, mx: "auto" }}>
          {/* Project Info */}
          <Grid item xs={12} sm={6} md={4}>
            <Box className="flex items-center gap-2 mb-1.5">
              <SmartToyRoundedIcon sx={{ color: "#58a6ff" }} />
              <Typography variant="h6" sx={{ color: "#58a6ff", fontWeight: 700 }}>
                AI Prediction System
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ lineHeight: 1.7, color: "#c9d1d9" }}>
              An intelligent web platform for predictions and analysis.
              Designed to simplify data-driven decisions using AI.
            </Typography>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="subtitle1" sx={{ color: "#58a6ff", fontWeight: 700, mb: 1.5 }}>
              Quick Links
            </Typography>
            <Box className="flex flex-col gap-1.5">
              {quickLinks.map((link) => (
                <MuiLink
                  key={link.to}
                  component={Link}
                  to={link.to}
                  underline="none"
                  sx={{
                    color: "#c9d1d9",
                    fontSize: 14,
                    transition: "color 0.3s ease",
                    "&:hover": { color: "#58a6ff" },
                  }}
                >
                  {link.label}
                </MuiLink>
              ))}
            </Box>
          </Grid>

          {/* Contact */}
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="subtitle1" sx={{ color: "#58a6ff", fontWeight: 700, mb: 1.5 }}>
              Contact
            </Typography>
            <Box className="flex items-center gap-1.5 mb-1">
              <MailRoundedIcon sx={{ fontSize: 18, color: "#8b949e" }} />
              <Typography variant="body2">support@aipredict.com</Typography>
            </Box>
            <Box className="flex items-center gap-1.5">
              <PhoneRoundedIcon sx={{ fontSize: 18, color: "#8b949e" }} />
              <Typography variant="body2">+91 98765 43210</Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ borderColor: "#30363d", mt: 3.5 }} />
        <Typography
          variant="caption"
          sx={{ display: "block", textAlign: "center", color: "#8b949e", pt: 1.8, fontSize: 13 }}
        >
          © {new Date().getFullYear()} AI Prediction System | All Rights Reserved
        </Typography>
      </Box>
    </Fade>
  );
}