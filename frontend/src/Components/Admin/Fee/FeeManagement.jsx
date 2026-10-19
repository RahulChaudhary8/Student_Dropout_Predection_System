import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  TextField,
  InputAdornment,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Chip,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Fade,
  Grow,
  Autocomplete
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import PendingActionsRoundedIcon from "@mui/icons-material/PendingActionsRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import ReportProblemRoundedIcon from "@mui/icons-material/ReportProblemRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";

function statusTone(status) {
  if (status === "Up-to-date") return "success";
  if (status === "Pending") return "warning";
  return "error";
}
const getTodayDate = () => new Date().toISOString().split("T")[0];
const FeeManagement = () => {
  const [search, setSearch] = useState("");
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({
    studentId: "",
    amount: "",
    date: getTodayDate(),
    mode: "",
    remarks: "",
  });
  const [paymentsHistory, setPaymentsHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const today = new Date();

  const fetchStudents = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/students");
      setStudents(res.data);
    } catch (error) {
      console.error("Failed to fetch students", error);
    }
  };

  const fetchPayments = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/payments");
      setPaymentsHistory(res.data);
    } catch (error) {
      console.error("Failed to fetch payments", error);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchPayments();
  }, []);

  const getStatus = (student) => {
    if (student.paidFees >= student.totalCourseFees) return "Up-to-date";
    if (!student.dueDate) return "Pending"; // due date set nahi hui abhi tak
    const due = new Date(student.dueDate);
    return today > due ? "Overdue" : "Pending";
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/payments", form);
      alert("Payment saved successfully!");
      setForm({ studentId: "", amount: "", date: getTodayDate(), mode: "", remarks: "" });
      fetchStudents();
      fetchPayments();
    } catch (error) {
      console.error(error);
      alert("Failed to save payment");
    }
  };



  const summaryCards = [
    {
      label: "Total Collected",
      value: `₹${students.reduce((acc, s) => acc + s.paidFees, 0)}`,
      icon: <AccountBalanceWalletRoundedIcon />,
      tone: "success",
    },
    {
      label: "Pending Fees",
      value: `₹${students.reduce((acc, s) => acc + (s.totalFees - s.paidFees), 0)}`,
      icon: <PendingActionsRoundedIcon />,
      tone: "warning",
    },
    {
      label: "Total Students",
      value: students.length,
      icon: <PeopleAltRoundedIcon />,
      tone: "primary",
    },
    {
      label: "Defaulters",
      value: students.filter((s) => getStatus(s) === "Overdue").length,
      icon: <ReportProblemRoundedIcon />,
      tone: "error",
    },
  ];

  const filteredStudents = students.filter(
    (s) =>
      s.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      s.studentId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Fade in timeout={450}>
      <Box>
        {/* Header */}
        <Box className="flex justify-between items-center mb-6">
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Fee Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<HistoryRoundedIcon />}
            onClick={() => setShowHistory(true)}
            className="transition-all duration-300"
            sx={{
              "&:hover": { transform: "translateY(-2px)", boxShadow: 4 },
            }}
          >
            Payment History
          </Button>
        </Box>

        {/* Summary Cards */}
        <Grid container spacing={3} className="mb-6">
          {summaryCards.map((c, idx) => (
            <Grid item xs={12} sm={6} md={3} key={c.label}>
              <Grow in timeout={350 + idx * 130}>
                <Card
                  elevation={0}
                  className="transition-all duration-300"
                  sx={{
                    border: "1px solid #e2e8f0",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 12px 24px -8px rgba(15, 23, 42, 0.15)",
                    },
                  }}
                >
                  <CardContent className="flex items-center gap-3">
                    <Avatar sx={{ bgcolor: `${c.tone}.main`, width: 44, height: 44 }}>
                      {c.icon}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {c.label}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {c.value}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
          ))}
        </Grid>

        {/* Search */}
        <Box className="flex justify-end mb-4">
          <TextField
            placeholder="Search student by name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{ width: { xs: "100%", sm: 340 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Fee Table */}
        <Grow in timeout={500}>
          <Card elevation={0} sx={{ border: "1px solid #e2e8f0", mb: 4 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f8fafc" }}>
                    <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Course</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">
                      Total Fees
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">
                      Paid Fees
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">
                      Pending Fees
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Due Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => {
                      const status = getStatus(student);
                      return (
                        <TableRow
                          key={student._id}
                          hover
                          sx={{ "&:hover": { bgcolor: "rgba(37, 99, 235, 0.04)" } }}
                        >
                          <TableCell>{student.studentId}</TableCell>
                          <TableCell>{student.fullName}</TableCell>
                          <TableCell>{student.courseApplied}</TableCell>
                          <TableCell align="right">₹{student.totalCourseFees}</TableCell>
                          <TableCell align="right">₹{student.paidFees}</TableCell>
                          <TableCell align="right">
                            ₹{student.totalCourseFees - student.paidFees}
                          </TableCell>
                          <TableCell>{student.dueDate?.slice(0, 10)}</TableCell>
                          <TableCell>
                            <Chip
                              label={status}
                              color={statusTone(status)}
                              size="small"
                              sx={{
                                fontWeight: 700,
                                animation:
                                  status === "Overdue" ? "pulseGlow 2s infinite" : "none",
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4, color: "text.secondary" }}>
                        No students found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grow>

        {/* Add Payment Form */}
        <Grow in timeout={650}>
          <Card elevation={0} sx={{ border: "1px solid #e2e8f0" }}>
            <CardContent>
              <Typography variant="h6" className="mb-4">
                Add Payment
              </Typography>
              <Box
                component="form"
                onSubmit={handlePayment}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                <Autocomplete
                  options={students}
                  getOptionLabel={(option) => `${option.studentId} — ${option.fullName}`}
                  isOptionEqualToValue={(option, value) => option.studentId === value.studentId}
                  value={students.find((s) => s.studentId === form.studentId) || null}
                  onChange={(e, newValue) => {
                    setForm({ ...form, studentId: newValue ? newValue.studentId : "" });
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Student ID"
                      required
                      size="small"
                    />
                  )}
                />
                <TextField
                  label="Amount Paid"
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  required
                  size="small"
                />
                <TextField
                  label="Date"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="Payment Mode"
                  select
                  value={form.mode}
                  onChange={(e) => setForm({ ...form, mode: e.target.value })}
                  required
                  size="small"
                >
                  <MenuItem value="">Select Payment Mode</MenuItem>
                  <MenuItem value="Cash">Cash</MenuItem>
                  <MenuItem value="UPI">UPI</MenuItem>
                  <MenuItem value="Bank">Bank</MenuItem>
                  <MenuItem value="Card">Card</MenuItem>
                </TextField>
                <TextField
                  label="Remarks"
                  value={form.remarks}
                  onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                  size="small"
                />
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveRoundedIcon />}
                  className="transition-all duration-300"
                  sx={{
                    height: 40,
                    "&:hover": { transform: "translateY(-2px)", boxShadow: 4 },
                  }}
                >
                  Save Payment
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grow>

        {/* Payment History Dialog */}
        <Dialog
          open={showHistory}
          onClose={() => setShowHistory(false)}
          maxWidth="md"
          fullWidth
          TransitionComponent={Fade}
        >
          <DialogTitle className="flex justify-between items-center">
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Payment History
            </Typography>
            <IconButton onClick={() => setShowHistory(false)} size="small">
              <CloseRoundedIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers sx={{ maxHeight: 400 }}>
            <TableContainer>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Student ID</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Mode</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Remarks</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paymentsHistory.length > 0 ? (
                    paymentsHistory.map((p, idx) => (
                      <TableRow key={idx} hover>
                        <TableCell>{p.studentId}</TableCell>
                        <TableCell>₹{p.amount}</TableCell>
                        <TableCell>{p.date?.slice(0, 10)}</TableCell>
                        <TableCell>{p.mode}</TableCell>
                        <TableCell>{p.remarks}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ color: "text.secondary" }}>
                        No payments yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowHistory(false)} variant="outlined" color="error">
              Close
            </Button>
          </DialogActions>
        </Dialog>

        <style>{`
          @keyframes pulseGlow {
            0%, 100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4); }
            50% { box-shadow: 0 0 0 6px rgba(220, 38, 38, 0); }
          }
        `}</style>
      </Box>
    </Fade>
  );
};

export default FeeManagement;