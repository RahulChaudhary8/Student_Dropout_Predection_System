import React, { useState } from "react";
import { Paper, Typography, Button, Box, Chip } from "@mui/material";
import { FaBook, FaClipboardList } from "react-icons/fa";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const cards = [
  {
    id: "class",
    icon: FaClipboardList,
    title: "Class Test / Regular Test Score",
    description: "Manage and record class test scores of students here.",
    chip: "Regular",
    chipColor: "#ede9fe",
    chipText: "#6d28d9",
    iconColor: "#6366f1",
    glowColor: "#e0e7ff",
    action: "onSelectClass",
  },
  {
    id: "semester",
    icon: FaBook,
    title: "Semester Score",
    description: "Manage and record semester exam scores of students here.",
    chip: "Semester",
    chipColor: "#dcfce7",
    chipText: "#15803d",
    iconColor: "#22c55e",
    glowColor: "#dcfce7",
    action: "onSelectSemester",
  },
];

const ScoreBoxes = ({ onSelectClass, onSelectSemester }) => {
  const [hovered, setHovered] = useState(null);
  const handlers = { onSelectClass, onSelectSemester };

  return (
    <Box className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      {/* Page Heading */}
      <Box className="text-center mb-10">
        <Typography
          variant="h5"
          sx={{ fontWeight: 800, color: "#0f172a", letterSpacing: "-0.3px" }}
        >
          Score Management
        </Typography>
        <Typography variant="body2" sx={{ color: "#94a3b8", mt: 0.5 }}>
          Select a category to enter student scores
        </Typography>
      </Box>

      {/* Cards Row */}
      <Box className="flex flex-wrap gap-6 justify-center">
        {cards.map((card) => {
          const Icon = card.icon;
          const isHovered = hovered === card.id;

          return (
            <Paper
              key={card.id}
              elevation={0}
              onMouseEnter={() => setHovered(card.id)}
              onMouseLeave={() => setHovered(null)}
              sx={{
                width: 300,
                borderRadius: 3,
                border: isHovered
                  ? `1.5px solid ${card.iconColor}`
                  : "1px solid #e2e8f0",
                backgroundColor: isHovered ? card.glowColor : "#fff",
                p: 3.5,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.28s ease",
                transform: isHovered ? "translateY(-8px)" : "translateY(0px)",
                boxShadow: isHovered
                  ? `0 12px 32px ${card.iconColor}28`
                  : "none",
              }}
            >
              {/* Badge */}
              <Box className="w-full flex justify-end mb-1">
                <Chip
                  label={card.chip}
                  size="small"
                  sx={{
                    backgroundColor: card.chipColor,
                    color: card.chipText,
                    fontWeight: 700,
                    fontSize: "0.7rem",
                    height: 20,
                  }}
                />
              </Box>

              {/* Icon Circle */}
              <Box
                sx={{
                  width: 68,
                  height: 68,
                  borderRadius: "50%",
                  backgroundColor: isHovered ? "#fff" : card.glowColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 2.5,
                  transition: "all 0.28s ease",
                  boxShadow: isHovered ? `0 0 0 6px ${card.iconColor}22` : "none",
                }}
              >
                <Icon
                  style={{
                    fontSize: 30,
                    color: card.iconColor,
                    transition: "transform 0.28s ease",
                    transform: isHovered ? "scale(1.2)" : "scale(1)",
                  }}
                />
              </Box>

              {/* Text */}
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                  color: "#0f172a",
                  mb: 1,
                  lineHeight: 1.3,
                }}
              >
                {card.title}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "#64748b", mb: 3, fontSize: "0.82rem", lineHeight: 1.6 }}
              >
                {card.description}
              </Typography>

              {/* CTA Button */}
              <Button
                endIcon={<ArrowForwardIcon />}
                onClick={handlers[card.action]}
                variant={isHovered ? "contained" : "outlined"}
                size="small"
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  px: 2.5,
                  backgroundColor: isHovered ? card.iconColor : "transparent",
                  borderColor: card.iconColor,
                  color: isHovered ? "#fff" : card.iconColor,
                  "&:hover": {
                    backgroundColor: card.iconColor,
                    color: "#fff",
                  },
                  transition: "all 0.25s ease",
                }}
              >
                Enter Scores
              </Button>
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
};

export default ScoreBoxes;