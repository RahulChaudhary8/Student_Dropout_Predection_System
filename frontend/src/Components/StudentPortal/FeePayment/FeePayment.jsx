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
  Divider,
  Fade,
  Grow,
  CircularProgress,
} from "@mui/material";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";

function feeStatusInfo(status) {
  if (status === "Up-to-date") return { color: "success", icon: <CheckCircleRoundedIcon fontSize="small" /> };
  if (status === "Pending") return { color: "warning", icon: <WarningAmberRoundedIcon fontSize="small" /> };
  return { color: "error", icon: <CancelRoundedIcon fontSize="small" /> };
}

// studentId prop is optional now — the component resolves its own
// studentId from the logged-in user's profile (via token), so it works
// even if the parent forgets to pass it explicitly.
const FeePayment = ({ studentId: studentIdProp }) => {
  const [feeData, setFeeData] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [resolvedStudentId, setResolvedStudentId] = useState(studentIdProp || null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  const [newPayment, setNewPayment] = useState({
    amount: "",
    mode: "UPI",
    remarks: "",
    date: new Date().toISOString().split("T")[0],
  });

  const fetchAll = async () => {
    setLoading(true);
    setError("");
    try {
      const profileRes = await axios.get(
        "http://localhost:5000/api/student-profile/profile",
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      const s = profileRes.data;
      const sid = s.studentId || studentIdProp;
      setResolvedStudentId(sid);

      setFeeData({
        totalFee: s.totalCourseFees ?? 0,
        paidFee: s.paidFees ?? 0,
        pendingFee: (s.totalCourseFees ?? 0) - (s.paidFees ?? 0),
        dueDate: s.dueDate ?? "N/A",
        status:
          s.tuitionFeesUpToDate === "Yes"
            ? "Up-to-date"
            : s.tuitionFeesUpToDate === "Overdue"
              ? "Overdue"
              : "Pending",
      });

      if (sid) {
        const historyRes = await axios.get(`http://localhost:5000/api/payments/student/${sid}`);
        setPaymentHistory(historyRes.data || []);
      }
    } catch (err) {
      console.error("❌ Failed to load fee data:", err);
      setError("Fee data load nahi ho paaya. Please refresh and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setNewPayment({ ...newPayment, [name]: value });
  };

  const handlePay = async () => {
    if (!newPayment.amount || Number(newPayment.amount) <= 0) {
      return alert("Enter a valid amount!");
    }
    if (!resolvedStudentId) {
      return alert("⚠️ Student ID resolve nahi ho paya. Please refresh the page.");
    }

    setPaying(true);
    try {
      const res = await axios.post("http://localhost:5000/api/payments", {
        studentId: resolvedStudentId,
        amount: Number(newPayment.amount),
        date: newPayment.date,
        mode: newPayment.mode,
        remarks: newPayment.remarks,
      });

      const updatedStudent = res.data.student;
      setFeeData({
        totalFee: updatedStudent.totalCourseFees ?? 0,
        paidFee: updatedStudent.paidFees ?? 0,
        pendingFee: (updatedStudent.totalCourseFees ?? 0) - (updatedStudent.paidFees ?? 0),
        dueDate: updatedStudent.dueDate ?? "N/A",
        status:
          updatedStudent.tuitionFeesUpToDate === "Yes"
            ? "Up-to-date"
            : updatedStudent.tuitionFeesUpToDate === "Overdue"
              ? "Overdue"
              : "Pending",
      });

      setPaymentHistory((prev) => [res.data.payment, ...prev]);
      setNewPayment({ ...newPayment, amount: "", remarks: "" });
    } catch (err) {
      console.error("❌ Payment failed:", err);
      alert("❌ Payment save nahi ho paya. Please try again.");
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <Box className="flex flex-col items-center justify-center gap-2 py-16">
        <CircularProgress />
        <Typography color="text.secondary" variant="body2">
          Loading fee details...
        </Typography>
      </Box>
    );
  }

  if (error || !feeData) {
    return (
      <Card elevation={0} sx={{ border: "1px solid #e2e8f0" }} className="py-10 text-center">
        <Typography color="error">{error || "No fee data found."}</Typography>
      </Card>
    );
  }

  const statusInfo = feeStatusInfo(feeData.status);

  return (
    <Fade in timeout={450}>
      <Box sx={{ maxWidth: 900, mx: "auto" }}>
        <Box className="flex flex-col gap-5">
          {/* Fee Summary */}
          <Grow in timeout={400}>
            <Card elevation={0} sx={{ border: "1px solid #e2e8f0" }}>
              <CardContent>
                <Box className="flex items-center gap-2 mb-2">
                  <ReceiptLongRoundedIcon sx={{ color: "#6c5ce7" }} />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Fee Summary</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="text.secondary">Total Fee</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>₹{feeData.totalFee}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="text.secondary">Paid Fee</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "success.main" }}>₹{feeData.paidFee}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="text.secondary">Pending Fee</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "warning.main" }}>₹{feeData.pendingFee}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="text.secondary">Due Date</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{feeData.dueDate}</Typography>
                  </Grid>
                </Grid>
                <Box className="flex items-center gap-2 mt-3">
                  <Typography variant="body2" color="text.secondary">Status:</Typography>
                  <Chip icon={statusInfo.icon} label={feeData.status} color={statusInfo.color} size="small" sx={{ fontWeight: 700 }} />
                </Box>
              </CardContent>
            </Card>
          </Grow>

          {/* Make a Payment */}
          <Grow in timeout={550}>
            <Card elevation={0} sx={{ border: "1px solid #e2e8f0" }}>
              <CardContent>
                <Box className="flex items-center gap-2 mb-2">
                  <PaymentsRoundedIcon sx={{ color: "#6c5ce7" }} />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Make a Payment</Typography>
                </Box>
                <Divider sx={{ mb: 2.5 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth type="number" name="amount" label="Enter Amount" value={newPayment.amount} onChange={handlePaymentChange} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth select name="mode" label="Payment Mode" value={newPayment.mode} onChange={handlePaymentChange}>
                      <MenuItem value="UPI">UPI</MenuItem>
                      <MenuItem value="Card">Card</MenuItem>
                      <MenuItem value="Net Banking">Net Banking</MenuItem>
                      <MenuItem value="Cash">Cash</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth type="date" name="date" label="Date" value={newPayment.date} onChange={handlePaymentChange} InputLabelProps={{ shrink: true }} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth name="remarks" label="Remarks (optional)" value={newPayment.remarks} onChange={handlePaymentChange} />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={handlePay}
                      disabled={paying}
                      startIcon={paying ? <CircularProgress size={16} color="inherit" /> : null}
                      className="transition-all duration-300"
                      sx={{ px: 4, py: 1.2, fontWeight: 700, "&:hover": { transform: "translateY(-2px)", boxShadow: 4 } }}
                    >
                      {paying ? "Processing..." : "Pay"}
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grow>

          {/* Payment History */}
          <Grow in timeout={700}>
            <Card elevation={0} sx={{ border: "1px solid #e2e8f0" }}>
              <CardContent>
                <Box className="flex items-center gap-2 mb-2">
                  <HistoryRoundedIcon sx={{ color: "#6c5ce7" }} />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Payment History</Typography>
                </Box>
                <Divider sx={{ mb: 1 }} />
                {paymentHistory.length === 0 ? (
                  <Typography color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
                    Abhi tak koi payment nahi hui.
                  </Typography>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: "#e0e7ff" }}>
                          <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Mode</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Remarks</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paymentHistory.map((p, index) => (
                          <TableRow key={p._id || index} hover sx={{ bgcolor: index % 2 === 0 ? "#fff" : "#f9f9f9", "&:hover": { bgcolor: "rgba(108, 92, 231, 0.06)" } }}>
                            <TableCell>{(p.date || "").slice(0, 10)}</TableCell>
                            <TableCell>₹{p.amount}</TableCell>
                            <TableCell>{p.mode}</TableCell>
                            <TableCell>{p.remarks}</TableCell>
                            <TableCell>
                              <Chip icon={<CheckCircleRoundedIcon fontSize="small" />} label="Success" color="success" size="small" sx={{ fontWeight: 700 }} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Grow>
        </Box>
      </Box>
    </Fade>
  );
};

export default FeePayment;