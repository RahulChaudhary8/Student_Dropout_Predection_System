import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  Fade,
  Slide,
  Grow,
} from "@mui/material";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import SmartToyRoundedIcon from "@mui/icons-material/SmartToyRounded";
import TrackChangesRoundedIcon from "@mui/icons-material/TrackChangesRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";

const featureList = [
  {
    icon: <InsightsRoundedIcon />,
    title: "Data Analysis",
    desc: "Analyzes academic, attendance, and socio-economic data to generate insights.",
  },
  {
    icon: <BoltRoundedIcon />,
    title: "Early Warning",
    desc: "Identifies students at risk of dropping out before it's too late.",
  },
  {
    icon: <SmartToyRoundedIcon />,
    title: "AI Predictions",
    desc: "Uses Machine Learning algorithms for accurate dropout prediction.",
  },
  {
    icon: <TrackChangesRoundedIcon />,
    title: "Targeted Support",
    desc: "Helps institutions take proactive measures to support students.",
  },
  {
    icon: <TrendingUpRoundedIcon />,
    title: "Improved Retention",
    desc: "Boosts student retention rates and overall academic performance.",
  },
  {
    icon: <PublicRoundedIcon />,
    title: "Scalable System",
    desc: "Can be applied across schools, colleges, and universities worldwide.",
  },
];

const Features = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        pt: { xs: 10, md: 14 },
        pb: { xs: 6, md: 8 },
        px: { xs: 2, md: 4 },
        textAlign: "center",
        background: "linear-gradient(135deg, #f9f9ff 0%, #eef2ff 100%)",
      }}
    >
      <Fade in timeout={600}>
        <Box sx={{ maxWidth: 1200, mx: "auto" }}>
          {/* Header */}
          <Slide in direction="down" timeout={500}>
            <Box sx={{ mb: 5 }}>
              <Avatar
                sx={{
                  bgcolor: "primary.main",
                  width: 60,
                  height: 60,
                  mx: "auto",
                  mb: 2,
                  boxShadow: "0 10px 24px -8px rgba(37, 99, 235, 0.5)",
                }}
              >
                <AutoAwesomeRoundedIcon sx={{ fontSize: 30 }} />
              </Avatar>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  color: "secondary.main",
                  letterSpacing: "-0.02em",
                  fontSize: { xs: "1.8rem", md: "2.4rem" },
                }}
              >
                Key Features
              </Typography>
            </Box>
          </Slide>

          {/* Feature Cards */}
          <Grid container spacing={3}>
            {featureList.map((feature, idx) => (
              <Grid item xs={12} sm={6} md={4} key={feature.title}>
                <Grow in timeout={350 + idx * 130}>
                  <Card
                    elevation={0}
                    className="transition-all duration-300"
                    sx={{
                      height: "100%",
                      borderRadius: 4,
                      border: "1px solid #e2e8f0",
                      "&:hover": {
                        transform: "translateY(-10px) scale(1.05)",
                        boxShadow: "0 16px 32px -8px rgba(47, 62, 158, 0.25)",
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3.5 }}>
                      <Avatar
                        sx={{
                          bgcolor: "primary.main",
                          width: 50,
                          height: 50,
                          mx: "auto",
                          mb: 2,
                        }}
                      >
                        {feature.icon}
                      </Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: "secondary.main", mb: 1 }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.7 }}>
                        {feature.desc}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grow>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Fade>
    </Box>
  );
};

export default Features;