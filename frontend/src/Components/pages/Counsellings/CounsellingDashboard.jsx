import React from "react";
import { Box, Grid, Card, CardContent, Avatar, Typography, Grow } from "@mui/material";
import PersonSearchRoundedIcon from "@mui/icons-material/PersonSearchRounded";
import CastForEducationRoundedIcon from "@mui/icons-material/CastForEducationRounded";

const options = [
  {
    key: "select",
    title: "Select Counselling",
    desc: "Choose a student for counselling session.",
    icon: <PersonSearchRoundedIcon sx={{ fontSize: 40 }} />,
  },
  {
    key: "give",
    title: "Give Counselling",
    desc: "Conduct counselling sessions with selected students.",
    icon: <CastForEducationRoundedIcon sx={{ fontSize: 40 }} />,
  },
];

const CounsellingDashboard = ({ onSelectCounselling, onGiveCounselling }) => {
  const handlers = {
    select: onSelectCounselling,
    give: onGiveCounselling,
  };

  return (
    <Box
      sx={{
        minHeight: "60vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "#f0f4f8",
        p: 4,
      }}
    >
      <Grid container spacing={4} sx={{ maxWidth: 900 }}>
        {options.map((opt, idx) => (
          <Grid item xs={12} sm={6} key={opt.key}>
            <Grow in timeout={400 + idx * 180}>
              <Card
                elevation={0}
                onClick={handlers[opt.key]}
                className="cursor-pointer transition-all duration-300"
                sx={{
                  height: 300,
                  borderRadius: 4,
                  boxShadow: "0px 6px 16px rgba(0, 0, 0, 0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 12px 24px rgba(0,0,0,0.25)",
                  },
                }}
              >
                <CardContent sx={{ textAlign: "center" }}>
                  <Avatar
                    sx={{
                      bgcolor: "transparent",
                      color: "#4a90e2",
                      width: 70,
                      height: 70,
                      mx: "auto",
                      mb: 2.5,
                    }}
                  >
                    {opt.icon}
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: "#333", mb: 1.5 }}>
                    {opt.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#666" }}>
                    {opt.desc}
                  </Typography>
                </CardContent>
              </Card>
            </Grow>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default CounsellingDashboard;