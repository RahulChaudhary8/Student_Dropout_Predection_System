import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Fade,
  Grow,
  Slide,
} from "@mui/material";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import SmartToyRoundedIcon from "@mui/icons-material/SmartToyRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import RocketLaunchRoundedIcon from "@mui/icons-material/RocketLaunchRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import TrackChangesRoundedIcon from "@mui/icons-material/TrackChangesRounded";
import TipsAndUpdatesRoundedIcon from "@mui/icons-material/TipsAndUpdatesRounded";

const cards = [
  {
    title: "Project Overview",
    icon: <InfoRoundedIcon />,
    type: "text",
    body: (
      <>
        The <strong>Student Dropout Prediction System</strong> is an
        AI-powered solution that helps educational institutions identify
        students who are at risk of dropping out. By analyzing historical
        academic data, attendance records, and socio-economic factors, this
        system predicts the likelihood of student retention.
      </>
    ),
  },
  {
    title: "How It Works",
    icon: <SmartToyRoundedIcon />,
    type: "text",
    body: (
      <>
        This system leverages <strong>Machine Learning</strong> and{" "}
        <strong>Artificial Intelligence</strong> techniques to process
        student data and generate predictions. The model is trained using
        classification algorithms (such as Logistic Regression, Random
        Forest, or Neural Networks) to ensure accurate forecasting.
      </>
    ),
  },
  {
    title: "Key Features",
    icon: <AutoAwesomeRoundedIcon />,
    type: "list",
    items: [
      { text: "Data-driven insights into student performance", icon: <InsightsRoundedIcon fontSize="small" /> },
      { text: "Early warning system for at-risk students", icon: <BoltRoundedIcon fontSize="small" /> },
      { text: "Helps institutions take preventive measures", icon: <TrackChangesRoundedIcon fontSize="small" /> },
      { text: "Improves retention and academic outcomes", icon: <TipsAndUpdatesRoundedIcon fontSize="small" /> },
    ],
  },
  {
    title: "Impact",
    icon: <RocketLaunchRoundedIcon />,
    type: "text",
    body: (
      <>
        By implementing this system, schools and colleges can{" "}
        <strong>proactively support students</strong>, improve success rates,
        and reduce dropout numbers. This not only benefits institutions but
        also contributes to a better future for students.
      </>
    ),
  },
];

const About = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: { xs: 5, md: 7 },
        px: { xs: 2, md: 4 },
        background: "linear-gradient(135deg, #eef2ff 0%, #dbe8ff 50%, #cfe0ff 100%)",
      }}
    >
      <Fade in timeout={600}>
        <Box sx={{ maxWidth: 1200, mx: "auto" }}>
          {/* Header */}
          <Slide in direction="down" timeout={500}>
            <Box sx={{ textAlign: "center", mb: 6 }}>
              <Avatar
                sx={{
                  bgcolor: "primary.main",
                  width: 64,
                  height: 64,
                  mx: "auto",
                  mb: 2,
                  boxShadow: "0 10px 24px -8px rgba(37, 99, 235, 0.5)",
                }}
              >
                <SchoolRoundedIcon sx={{ fontSize: 34 }} />
              </Avatar>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  color: "secondary.main",
                  letterSpacing: "-0.02em",
                  fontSize: { xs: "1.8rem", md: "2.6rem" },
                }}
              >
                AI/ML Student Dropout Prediction System
              </Typography>
              <Typography
                variant="h6"
                sx={{ color: "text.secondary", mt: 1, fontWeight: 500 }}
              >
                Harnessing AI to Secure Student Futures
              </Typography>
            </Box>
          </Slide>

          {/* Cards */}
          <Grid container spacing={3}>
            {cards.map((card, idx) => (
              <Grid item xs={12} sm={6} key={card.title}>
                <Grow in timeout={400 + idx * 150}>
                  <Card
                    elevation={0}
                    className="transition-all duration-300"
                    sx={{
                      height: "100%",
                      borderRadius: 4,
                      border: "1px solid #e2e8f0",
                      "&:hover": {
                        transform: "translateY(-8px) scale(1.01)",
                        boxShadow: "0 16px 32px -10px rgba(37, 99, 235, 0.25)",
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3.5 }}>
                      <Box className="flex items-center gap-2 mb-2">
                        <Avatar sx={{ bgcolor: "primary.main", width: 38, height: 38 }}>
                          {card.icon}
                        </Avatar>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: "secondary.main" }}>
                          {card.title}
                        </Typography>
                      </Box>

                      {card.type === "text" ? (
                        <Typography sx={{ color: "text.primary", lineHeight: 1.7 }}>
                          {card.body}
                        </Typography>
                      ) : (
                        <List dense>
                          {card.items.map((item) => (
                            <ListItem key={item.text} disableGutters>
                              <ListItemIcon sx={{ minWidth: 32, color: "primary.main" }}>
                                {item.icon}
                              </ListItemIcon>
                              <ListItemText
                                primary={item.text}
                                primaryTypographyProps={{ fontWeight: 500 }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      )}
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

export default About;