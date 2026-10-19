import React, { useState, useEffect } from "react";
import { Box, Typography, Card, Collapse, Fade, Grow } from "@mui/material";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import ForumRoundedIcon from "@mui/icons-material/ForumRounded";
import InboxRoundedIcon from "@mui/icons-material/InboxRounded";

const studentData = {
  name: "Shivangi",
  attendance: 68,
  testScore: 55,
  feeStatus: "pending",
  counsellingSchedule: [
    {
      id: 1,
      date: "2025-09-28",
      time: "10:00 AM",
      topic: "Attendance Improvement",
      details: "Discuss strategies to improve attendance and participation in classes.",
    },
    {
      id: 2,
      date: "2025-09-30",
      time: "2:00 PM",
      topic: "Test Score Guidance",
      details: "Plan extra practice sessions and mock tests to improve scores.",
    },
  ],
};

const TYPE_STYLES = {
  info: {
    gradient: "linear-gradient(135deg, #5dade2, #2980b9)",
    icon: <InfoRoundedIcon />,
  },
  warning: {
    gradient: "linear-gradient(135deg, #f7b733, #f39c12)",
    icon: <WarningAmberRoundedIcon />,
  },
  alert: {
    gradient: "linear-gradient(135deg, #e74c3c, #c0392b)",
    icon: <ErrorRoundedIcon />,
  },
  counselling: {
    gradient: "linear-gradient(135deg, #58d68d, #27ae60)",
    icon: <ForumRoundedIcon />,
  },
};

const StudentNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const generatedNotifications = [];

    if (studentData.attendance < 75) {
      generatedNotifications.push({
        id: 1,
        message: `Your attendance is low (${studentData.attendance}%). Please improve!`,
        details:
          "Your attendance is below the required 75%. You are advised to attend all remaining classes to avoid issues.",
        type: "alert",
      });
    }

    if (studentData.testScore < 60) {
      generatedNotifications.push({
        id: 2,
        message: `Your latest test score is ${studentData.testScore}. Consider extra practice.`,
        details:
          "The last test score indicates the need for improvement. Join tutoring sessions or extra practice classes.",
        type: "warning",
      });
    }

    if (studentData.feeStatus === "pending") {
      generatedNotifications.push({
        id: 3,
        message: "Your fee is pending. Please pay to avoid penalties.",
        details: "Pending fees must be cleared before next month to avoid fines or restricted access.",
        type: "info",
      });
    }

    studentData.counsellingSchedule.forEach((counselling) => {
      generatedNotifications.push({
        id: `c-${counselling.id}`,
        message: `Counselling on ${counselling.date} at ${counselling.time} - Topic: ${counselling.topic}`,
        details: counselling.details,
        type: "counselling",
      });
    });

    setNotifications(generatedNotifications);
  }, []);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <Fade in timeout={450}>
      <Box sx={{ maxWidth: 700, mx: "auto" }}>
        <Box className="flex items-center gap-2 mb-4">
          <NotificationsRoundedIcon sx={{ color: "#6c5ce7" }} />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Notifications
          </Typography>
        </Box>

        {notifications.length === 0 ? (
          <Box className="flex flex-col items-center justify-center py-14">
            <InboxRoundedIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1.5 }} />
            <Typography color="text.secondary" sx={{ fontStyle: "italic" }}>
              No notifications
            </Typography>
          </Box>
        ) : (
          <Box className="flex flex-col gap-3">
            {notifications.map((notif, idx) => {
              const style = TYPE_STYLES[notif.type] || TYPE_STYLES.info;
              const isExpanded = expandedId === notif.id;
              return (
                <Grow in timeout={350 + idx * 120} key={notif.id}>
                  <Card
                    onClick={() => toggleExpand(notif.id)}
                    elevation={0}
                    className="cursor-pointer transition-all duration-200"
                    sx={{
                      background: style.gradient,
                      color: "#fff",
                      borderRadius: 3,
                      px: 2.5,
                      py: 2,
                      boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "0 5px 16px rgba(0,0,0,0.15)",
                      },
                    }}
                  >
                    <Box className="flex items-start gap-2">
                      <Box sx={{ mt: 0.2 }}>{style.icon}</Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ color: "#fff", fontWeight: 600, lineHeight: 1.5 }}>
                          {notif.message}
                        </Typography>
                        <Collapse in={isExpanded} timeout={250}>
                          <Typography sx={{ color: "#fff", lineHeight: 1.5, mt: 1, opacity: 0.95 }}>
                            {notif.details}
                          </Typography>
                        </Collapse>
                      </Box>
                    </Box>
                  </Card>
                </Grow>
              );
            })}
          </Box>
        )}
      </Box>
    </Fade>
  );
};

export default StudentNotifications;
