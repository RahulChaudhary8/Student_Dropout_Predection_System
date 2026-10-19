import React from "react";
import { useNavigate } from "react-router-dom";
import About from "../Abouts/About";
import Contact from "../Contacts/Contact";
import Features from "../Feature/Features";
import { Box, Typography, Button, Fade, Slide } from "@mui/material";
import RocketLaunchRoundedIcon from "@mui/icons-material/RocketLaunchRounded";

export default function Home() {
  const navigate = useNavigate();

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          px: 2,
          background: "linear-gradient(to bottom right, #eff6ff, #ffffff, #f5f3ff)",
        }}
      >
        <Fade in timeout={600}>
          <Box sx={{ maxWidth: 800 }}>
            <Slide in direction="down" timeout={500}>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 800,
                  color: "#1f2937",
                  fontSize: { xs: "2.2rem", md: "3rem" },
                  mb: 2,
                }}
              >
                AI-Powered Student Dropout Prediction
              </Typography>
            </Slide>

            <Fade in timeout={700}>
              <Typography
                sx={{
                  color: "#4b5563",
                  fontSize: "1.125rem",
                  maxWidth: 700,
                  mx: "auto",
                  mb: 4,
                }}
              >
                Identify at-risk students early using attendance, scores, and
                fee insights. Help mentors intervene before it's too late.
              </Typography>
            </Fade>

            <Box className="flex flex-wrap justify-center gap-4">
              <Button
                onClick={() => navigate("/loginoptions")}
                size="large"
                endIcon={<RocketLaunchRoundedIcon />}
                className="transition-all duration-200"
                sx={{
                  px: 4,
                  py: 1.4,
                  color: "#fff",
                  fontWeight: 700,
                  borderRadius: 3,
                  background: "linear-gradient(to right, #2563eb, #4f46e5)",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
                  "&:hover": { transform: "scale(1.05)" },
                }}
              >
                Get Started
              </Button>

              <Button
                size="large"
                variant="outlined"
                sx={{
                  px: 4,
                  py: 1.4,
                  borderRadius: 3,
                  borderWidth: 2,
                  borderColor: "#4f46e5",
                  color: "#4f46e5",
                  fontWeight: 700,
                  "&:hover": { borderWidth: 2, bgcolor: "#eef2ff" },
                }}
              >
                Learn More
              </Button>
            </Box>
          </Box>
        </Fade>
      </Box>

      {/* Feature / About / Contact sections (each renders its own layout) */}
      <Box>
        <Features />
        <About />
        <Contact />
      </Box>
    </Box>
  );
}