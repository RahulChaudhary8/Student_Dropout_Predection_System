import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Chip,
  Button,
  Fade,
  Grow,
} from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import EventBusyRoundedIcon from "@mui/icons-material/EventBusyRounded";
import InboxRoundedIcon from "@mui/icons-material/InboxRounded";

function statusTone(status) {
  if (status === "Approved") return "success";
  if (status === "Denied") return "error";
  return "warning";
}

const AdminLeaveDashboard = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);

  const fetchLeaves = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/leaves");
      setLeaveRequests(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`http://localhost:5000/api/leaves/${id}`, { status });
      fetchLeaves();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  return (
    <Fade in timeout={450}>
      <Box>
        <Box className="flex items-center gap-2 mb-5">
          <EventBusyRoundedIcon color="primary" />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Leave Requests
          </Typography>
        </Box>

        {leaveRequests.length === 0 ? (
          <Grow in timeout={400}>
            <Card
              elevation={0}
              sx={{ border: "1px solid #e2e8f0" }}
              className="flex flex-col items-center justify-center py-16"
            >
              <InboxRoundedIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1.5 }} />
              <Typography color="text.secondary">No leave requests available.</Typography>
            </Card>
          </Grow>
        ) : (
          <Grow in timeout={500}>
            <Card elevation={0} sx={{ border: "1px solid #e2e8f0" }}>
              <TableContainer sx={{ overflowX: "auto" }}>
                <Table sx={{ minWidth: 800 }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "secondary.main" }}>
                      {[
                        "Student Name",
                        "Leave Type",
                        "Start Date",
                        "End Date",
                        "Reason",
                        "Status",
                        "Actions",
                      ].map((head) => (
                        <TableCell
                          key={head}
                          sx={{ color: "#fff", fontWeight: 700, letterSpacing: 0.3 }}
                        >
                          {head}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {leaveRequests.map((leave, idx) => (
                      <TableRow
                        key={leave._id}
                        hover
                        sx={{
                          bgcolor: idx % 2 === 0 ? "#f9fafb" : "#ffffff",
                          transition: "background 0.2s ease",
                          "&:hover": { bgcolor: "rgba(37, 99, 235, 0.06)" },
                        }}
                      >
                        <TableCell>{leave.studentName}</TableCell>
                        <TableCell>{leave.leaveType}</TableCell>
                        <TableCell>{leave.startDate}</TableCell>
                        <TableCell>{leave.endDate}</TableCell>
                        <TableCell sx={{ maxWidth: 220 }}>{leave.reason}</TableCell>
                        <TableCell>
                          <Chip
                            label={leave.status}
                            color={statusTone(leave.status)}
                            size="small"
                            sx={{
                              fontWeight: 700,
                              textTransform: "uppercase",
                              fontSize: 11,
                              animation:
                                leave.status === "Pending" ? "pulseGlow 2s infinite" : "none",
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          {leave.status === "Pending" && (
                            <Box className="flex gap-2">
                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                startIcon={<CheckCircleRoundedIcon />}
                                onClick={() => updateStatus(leave._id, "Approved")}
                                className="transition-all duration-300"
                                sx={{
                                  "&:hover": { transform: "translateY(-2px)", boxShadow: 3 },
                                }}
                              >
                                Approve
                              </Button>
                              <Button
                                size="small"
                                variant="contained"
                                color="error"
                                startIcon={<CancelRoundedIcon />}
                                onClick={() => updateStatus(leave._id, "Denied")}
                                className="transition-all duration-300"
                                sx={{
                                  "&:hover": { transform: "translateY(-2px)", boxShadow: 3 },
                                }}
                              >
                                Deny
                              </Button>
                            </Box>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Grow>
        )}

        <style>{`
          @keyframes pulseGlow {
            0%, 100% { box-shadow: 0 0 0 0 rgba(217, 119, 6, 0.4); }
            50% { box-shadow: 0 0 0 6px rgba(217, 119, 6, 0); }
          }
        `}</style>
      </Box>
    </Fade>
  );
};

export default AdminLeaveDashboard;