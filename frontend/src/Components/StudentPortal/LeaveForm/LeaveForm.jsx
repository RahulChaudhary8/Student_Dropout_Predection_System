import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  MenuItem,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Chip,
  Alert,
  Fade,
  Grow,
} from "@mui/material";
import EventBusyRoundedIcon from "@mui/icons-material/EventBusyRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import InboxRoundedIcon from "@mui/icons-material/InboxRounded";

function statusTone(status) {
  if (status === "Approved") return "success";
  if (status === "Denied") return "error";
  return "warning";
}

const LeaveForm = ({ studentId }) => {
  const [leaveType, setLeaveType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [myLeaves, setMyLeaves] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const fetchLeaves = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/leaves/student/${studentId}`);
      setMyLeaves(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (studentId) fetchLeaves();
  }, [studentId]);

  const isError = message.toLowerCase().includes("error");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!leaveType || !startDate || !endDate || !reason) {
      alert("Please fill all fields!");
      return;
    }
    try {
      await axios.post("http://localhost:5000/api/leaves", {
        studentId,
        leaveType,
        startDate,
        endDate,
        reason,
      });
      setMessage("Leave request submitted successfully!");
      setLeaveType("");
      setStartDate("");
      setEndDate("");
      setReason("");
      fetchLeaves();
    } catch (err) {
      console.error(err);
      setMessage("Error submitting leave request.");
    }
  };

  return (
    <Fade in timeout={450}>
      <Box sx={{ maxWidth: 700, mx: "auto" }}>
        <Grow in timeout={450}>
          <Card elevation={0} sx={{ border: "1px solid #e2e8f0" }}>
            <CardContent sx={{ p: 3.5 }}>
              <Box className="flex justify-between items-center mb-3">
                <Box className="flex items-center gap-2">
                  <EventBusyRoundedIcon sx={{ color: "#6c5ce7" }} />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Apply For Leave
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<HistoryRoundedIcon />}
                  onClick={() => setShowHistory(!showHistory)}
                  className="transition-all duration-200"
                  sx={{ "&:hover": { transform: "translateY(-2px)", boxShadow: 3 } }}
                >
                  {showHistory ? "Hide History" : "Leave History"}
                </Button>
              </Box>

              {message && (
                <Fade in timeout={300}>
                  <Alert severity={isError ? "error" : "success"} sx={{ mb: 2.5 }}>
                    {message}
                  </Alert>
                </Fade>
              )}

              {!showHistory && (
                <Box component="form" onSubmit={handleSubmit}>
                  <Grid container spacing={2.5}>
                    <Grid item xs={12} sm={6} sx={{ minWidth: 150 }}>
                      <TextField
                        select
                        fullWidth
                        label="Leave Type"
                        value={leaveType}
                        onChange={(e) => setLeaveType(e.target.value)}

                      >

                        <MenuItem value="Casual">Casual Leave</MenuItem>
                        <MenuItem value="Sick">Sick Leave</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6} />
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type="date"
                        label="Start Date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type="date"
                        label="End Date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Reason"
                        placeholder="Enter reason"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        multiline
                        rows={3}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        color="success"
                        startIcon={<SendRoundedIcon />}
                        className="transition-all duration-300"
                        sx={{
                          px: 3,
                          py: 1.2,
                          fontWeight: 700,
                          "&:hover": { transform: "translateY(-2px)", boxShadow: 4 },
                        }}
                      >
                        Submit Leave
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {showHistory && (
                <Fade in timeout={350}>
                  <Box sx={{ mt: 1 }}>
                    {myLeaves.length === 0 ? (
                      <Box className="flex flex-col items-center justify-center py-10">
                        <InboxRoundedIcon sx={{ fontSize: 40, color: "text.secondary", mb: 1 }} />
                        <Typography color="text.secondary">No leave requests yet.</Typography>
                      </Box>
                    ) : (
                      <TableContainer sx={{ borderRadius: 2, overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
                        <Table>
                          <TableHead>
                            <TableRow sx={{ bgcolor: "#34495e" }}>
                              <TableCell sx={{ color: "#fff", fontWeight: 700 }}>Leave Type</TableCell>
                              <TableCell sx={{ color: "#fff", fontWeight: 700 }}>Start Date</TableCell>
                              <TableCell sx={{ color: "#fff", fontWeight: 700 }}>End Date</TableCell>
                              <TableCell sx={{ color: "#fff", fontWeight: 700 }}>Reason</TableCell>
                              <TableCell sx={{ color: "#fff", fontWeight: 700 }}>Status</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {myLeaves.map((leave, index) => (
                              <TableRow
                                key={leave._id}
                                hover
                                sx={{
                                  bgcolor: index % 2 === 0 ? "#f9f9f9" : "#fff",
                                  "&:hover": { bgcolor: "rgba(108, 92, 231, 0.08)" },
                                }}
                              >
                                <TableCell>{leave.leaveType}</TableCell>
                                <TableCell>{leave.startDate}</TableCell>
                                <TableCell>{leave.endDate}</TableCell>
                                <TableCell sx={{ maxWidth: 200 }}>{leave.reason}</TableCell>
                                <TableCell>
                                  <Chip
                                    label={leave.status}
                                    color={statusTone(leave.status)}
                                    size="small"
                                    sx={{ fontWeight: 700, textTransform: "uppercase", fontSize: 11 }}
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </Box>
                </Fade>
              )}
            </CardContent>
          </Card>
        </Grow>
      </Box>
    </Fade>
  );
};

export default LeaveForm;