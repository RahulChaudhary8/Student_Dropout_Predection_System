import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Chip,
  Avatar,
  Tooltip,
  Fade,
  Divider,
  Badge,
  CircularProgress,
} from "@mui/material";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CampaignIcon from "@mui/icons-material/Campaign";
import NotificationsOffIcon from "@mui/icons-material/NotificationsOff";

const riskConfig = {
  High: {
    bg: "#fee2e2", text: "#b91c1c", border: "#fca5a5",
    chipBg: "#ef4444", dot: "#ef4444", avatarBg: "#fca5a5",
  },
  Moderate: {
    bg: "#fff7ed", text: "#c2410c", border: "#fdba74",
    chipBg: "#f97316", dot: "#f97316", avatarBg: "#fed7aa",
  },
  Low: {
    bg: "#f0fdf4", text: "#15803d", border: "#86efac",
    chipBg: "#22c55e", dot: "#22c55e", avatarBg: "#bbf7d0",
  },
};

const getInitials = (name = "") =>
  name.split(" ").filter(Boolean).map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "?";

// Notifications dismissed by the mentor persist locally so refreshing the
// page doesn't bring back alerts they already acknowledged. Keyed by
// student_id so it survives new fetches of the same underlying data.
const DISMISSED_KEY = "dismissedNotificationIds";

const loadDismissed = () => {
  try {
    return new Set(JSON.parse(localStorage.getItem(DISMISSED_KEY)) || []);
  } catch {
    return new Set();
  }
};

const saveDismissed = (set) => {
  localStorage.setItem(DISMISSED_KEY, JSON.stringify([...set]));
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notified, setNotified] = useState(false);
  const [sending, setSending] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/students", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      const dismissed = loadDismissed();

      const highRiskOnly = (res.data || [])
        .filter((s) => s.risk === "High" || s.risk === "Moderate")
        .filter((s) => !dismissed.has(s.studentId || s.student_id))
        .map((s) => ({
          id: s.studentId || s.student_id,
          name: s.fullName || s.name || "Unknown",
          risk: s.risk,
          probability: s.dropout_probability ?? 0,
        }))
        // Highest risk / probability shown first
        .sort((a, b) => b.probability - a.probability);

      setNotifications(highRiskOnly);
    } catch (err) {
      console.error("❌ Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = (id) => {
    const dismissed = loadDismissed();
    dismissed.add(id);
    saveDismissed(dismissed);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const notifyAll = async () => {
    if (notifications.length === 0) return;
    setSending(true);
    try {
      const payload = notifications.map((n) => ({
        studentId: n.id,
        studentName: n.name,
        risk: n.risk,
      }));

      await axios.post(
        "http://localhost:5000/api/mentor-notify/send-alert",
        { students: payload },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setNotified(true);
      setTimeout(() => setNotified(false), 2500);
    } catch (err) {
      console.error("❌ Failed to notify students:", err);
      alert("❌ Notify failed. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const highCount = notifications.filter((n) => n.risk === "High").length;

  return (
    <Box sx={{ width: "100%", maxWidth: 480 }}>
      <Paper
        elevation={0}
        sx={{ borderRadius: 3, border: "1px solid #e2e8f0", overflow: "hidden", backgroundColor: "#fff" }}
      >
        {/* ── Header ── */}
        <Box
          className="flex items-center justify-between px-4 py-3"
          sx={{ borderBottom: "1px solid #e2e8f0", backgroundColor: "#f8fafc" }}
        >
          <Box className="flex items-center gap-2">
            <Badge badgeContent={notifications.length} color="error" max={9}>
              <NotificationsActiveIcon sx={{ color: "#6366f1", fontSize: 20 }} />
            </Badge>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, pt: 4, color: "#0f172a" }}>
              High-Risk Alerts
            </Typography>
          </Box>

          {highCount > 0 && (
            <Chip
              label={`${highCount} Critical`}
              size="small"
              sx={{
                backgroundColor: "#fee2e2", color: "#b91c1c",
                fontWeight: 700, fontSize: "0.7rem", height: 22,
                animation: "pulse 2s infinite",
                "@keyframes pulse": {
                  "0%, 100%": { opacity: 1 },
                  "50%": { opacity: 0.6 },
                },
              }}
            />
          )}
        </Box>

        {/* ── Notification Cards ── */}
        <Box>
          {loading ? (
            <Box className="flex flex-col items-center justify-center py-10 gap-2">
              <CircularProgress size={28} />
              <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                Loading alerts...
              </Typography>
            </Box>
          ) : notifications.length === 0 ? (
            <Box className="flex flex-col items-center justify-center py-10 gap-2">
              <NotificationsOffIcon sx={{ fontSize: 36, color: "#cbd5e1" }} />
              <Typography variant="body2" sx={{ color: "#94a3b8", fontStyle: "italic" }}>
                All caught up — no alerts!
              </Typography>
            </Box>
          ) : (
            notifications.map((n, idx) => {
              const cfg = riskConfig[n.risk] || riskConfig["Low"];
              return (
                <Fade in key={n.id} timeout={300}>
                  <Box>
                    <Box
                      sx={{
                        display: "flex", alignItems: "center", gap: 2,
                        px: 3, py: 2,
                        backgroundColor: cfg.bg,
                        borderLeft: `4px solid ${cfg.dot}`,
                        transition: "background-color 0.2s ease",
                        "&:hover": { filter: "brightness(0.97)" },
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 38, height: 38,
                          backgroundColor: cfg.avatarBg,
                          color: cfg.text,
                          fontSize: "0.78rem", fontWeight: 700, flexShrink: 0,
                        }}
                      >
                        {getInitials(n.name)}
                      </Avatar>

                      <Box className="flex flex-col flex-1 min-w-0">
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 700, color: "#1e293b", lineHeight: 1.3,
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                          }}
                        >
                          {n.name}
                        </Typography>
                        <Box className="flex items-center gap-1.5 mt-0.5">
                          <Chip
                            label={n.risk}
                            size="small"
                            sx={{
                              backgroundColor: cfg.chipBg, color: "#fff",
                              fontWeight: 700, fontSize: "0.65rem", height: 18,
                            }}
                          />
                          <Typography variant="caption" sx={{ color: cfg.text, fontWeight: 600 }}>
                            {n.probability?.toFixed?.(1) ?? n.probability}% dropout risk
                          </Typography>
                        </Box>
                      </Box>

                      <Box className="flex items-center gap-1 flex-shrink-0">
                        <Tooltip title="View details" arrow TransitionComponent={Fade}>
                          <IconButton
                            size="small"
                            onClick={() => alert(`View details for ${n.name}`)}
                            sx={{
                              backgroundColor: "#fff", border: "1px solid #e2e8f0",
                              "&:hover": { backgroundColor: "#f1f5f9" },
                              width: 30, height: 30,
                            }}
                          >
                            <InfoOutlinedIcon sx={{ fontSize: 15, color: "#6366f1" }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Mark as read" arrow TransitionComponent={Fade}>
                          <IconButton
                            size="small"
                            onClick={() => markAsRead(n.id)}
                            sx={{
                              backgroundColor: "#fff", border: "1px solid #e2e8f0",
                              "&:hover": { backgroundColor: "#f0fdf4" },
                              width: 30, height: 30,
                            }}
                          >
                            <CheckCircleOutlineIcon sx={{ fontSize: 15, color: "#22c55e" }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                    {idx < notifications.length - 1 && (
                      <Divider sx={{ borderColor: "#f1f5f9" }} />
                    )}
                  </Box>
                </Fade>
              );
            })
          )}
        </Box>

        {/* ── Footer / Notify All ── */}
        {!loading && notifications.length > 0 && (
          <Box
            className="px-4 py-3"
            sx={{ borderTop: "1px solid #e2e8f0", backgroundColor: "#f8fafc" }}
          >
            <Button
              fullWidth
              disabled={sending}
              startIcon={
                sending ? (
                  <CircularProgress size={16} color="inherit" />
                ) : notified ? (
                  <CheckCircleOutlineIcon />
                ) : (
                  <CampaignIcon />
                )
              }
              onClick={notifyAll}
              variant="contained"
              size="small"
              sx={{
                borderRadius: 2, textTransform: "none", fontWeight: 700,
                fontSize: "0.85rem",
                backgroundColor: notified ? "#22c55e" : "#6366f1",
                "&:hover": { backgroundColor: notified ? "#16a34a" : "#4f46e5" },
                transition: "background-color 0.3s ease",
              }}
            >
              {sending
                ? "Sending..."
                : notified
                  ? `✓ Alerts Sent to ${notifications.length} Students`
                  : `Notify All ${notifications.length} High-Risk Students`}
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default Notifications;