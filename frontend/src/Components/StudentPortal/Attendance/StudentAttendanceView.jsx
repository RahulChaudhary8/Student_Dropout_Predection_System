import React, { useState, useEffect, useMemo } from "react";
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
    TextField,
    MenuItem,
    Chip,
    Fade,
    Grow,
    CircularProgress,
} from "@mui/material";
import EventNoteRoundedIcon from "@mui/icons-material/EventNoteRounded";
import InboxRoundedIcon from "@mui/icons-material/InboxRounded";

function statusTone(status) {
    if (status === "Present") return "success";
    if (status === "Absent") return "error";
    if (status === "Leave") return "warning";
    return "default";
}

// studentId should come from your auth context (the logged-in student).
const StudentAttendanceView = ({ studentId }) => {
    const [records, setRecords] = useState([]);
    const [subject, setSubject] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!studentId) return;
        setLoading(true);
        setError("");

        axios
            .get(`http://localhost:5000/attendance/${studentId}`)
            .then((res) => {
                // Sort newest date first so students see recent records at top
                const sorted = [...(res.data || [])].sort((a, b) =>
                    b.date.localeCompare(a.date)
                );
                setRecords(sorted);
            })
            .catch((err) => {
                console.error("❌ Failed to load attendance:", err);
                setError("Attendance data load nahi ho paaya. Please try again.");
            })
            .finally(() => setLoading(false));
    }, [studentId]);

    // Build subject dropdown dynamically from whatever subjects actually
    // appear in this student's records — no hardcoded list needed, so it
    // automatically supports English, Hindi, Maths, Science, or any other
    // subject the mentor has marked attendance for.
    const subjectsList = useMemo(() => {
        return [...new Set(records.map((r) => r.course).filter(Boolean))].sort();
    }, [records]);

    const filteredRecords = subject
        ? records.filter((r) => r.course === subject)
        : records;

    // Quick per-subject summary (shown only when a subject is selected)
    const summary = useMemo(() => {
        if (!subject) return null;
        let present = 0,
            absent = 0,
            leave = 0;
        filteredRecords.forEach((r) => {
            if (r.status === "Present") present++;
            else if (r.status === "Absent") absent++;
            else if (r.status === "Leave") leave++;
        });
        const total = present + absent + leave;
        const pct = total > 0 ? ((present / total) * 100).toFixed(1) : "0.0";
        return { present, absent, leave, total, pct };
    }, [filteredRecords, subject]);

    return (
        <Fade in timeout={450}>
            <Box>
                <Box className="flex flex-wrap justify-between items-center gap-3 mb-5">
                    <Box className="flex items-center gap-2">
                        <EventNoteRoundedIcon color="primary" />
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                            My Attendance
                        </Typography>
                    </Box>

                    <TextField
                        select
                        size="small"
                        label="Subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        sx={{ minWidth: 220 }}
                    >
                        <MenuItem value="">-- All Subjects --</MenuItem>
                        {subjectsList.map((s) => (
                            <MenuItem key={s} value={s}>
                                {s}
                            </MenuItem>
                        ))}
                    </TextField>
                </Box>

                {summary && (
                    <Grow in timeout={350}>
                        <Card elevation={0} sx={{ border: "1px solid #e2e8f0", mb: 3 }}>
                            <CardContent>
                                <Box className="flex flex-wrap gap-4">
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            Present
                                        </Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 700, color: "success.main" }}>
                                            {summary.present}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            Absent
                                        </Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 700, color: "error.main" }}>
                                            {summary.absent}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            Leave
                                        </Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 700, color: "warning.main" }}>
                                            {summary.leave}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            Attendance %
                                        </Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 700, color: "#6c5ce7" }}>
                                            {summary.pct}%
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grow>
                )}

                {loading ? (
                    <Box className="flex justify-center py-16">
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Card elevation={0} sx={{ border: "1px solid #e2e8f0" }} className="py-10 text-center">
                        <Typography color="error">{error}</Typography>
                    </Card>
                ) : filteredRecords.length === 0 ? (
                    <Grow in timeout={400}>
                        <Card
                            elevation={0}
                            sx={{ border: "1px solid #e2e8f0" }}
                            className="flex flex-col items-center justify-center py-16"
                        >
                            <InboxRoundedIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1.5 }} />
                            <Typography color="text.secondary">
                                {subject
                                    ? `${subject} ke liye abhi tak koi attendance record nahi hai.`
                                    : "Abhi tak koi attendance record nahi hai."}
                            </Typography>
                        </Card>
                    </Grow>
                ) : (
                    <Grow in timeout={500}>
                        <Card elevation={0} sx={{ border: "1px solid #e2e8f0" }}>
                            <TableContainer sx={{ maxHeight: 480, overflowY: "auto" }}>
                                <Table stickyHeader size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 700, bgcolor: "#f8fafc" }}>Date</TableCell>
                                            <TableCell sx={{ fontWeight: 700, bgcolor: "#f8fafc" }}>Subject</TableCell>
                                            <TableCell sx={{ fontWeight: 700, bgcolor: "#f8fafc" }}>Status</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredRecords.map((r, idx) => (
                                            <TableRow key={`${r.date}-${r.course}-${idx}`} hover>
                                                <TableCell>
                                                    {new Date(r.date).toLocaleDateString("default", {
                                                        weekday: "short",
                                                        day: "numeric",
                                                        month: "short",
                                                        year: "numeric",
                                                    })}
                                                </TableCell>
                                                <TableCell>{r.course}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={r.status}
                                                        color={statusTone(r.status)}
                                                        size="small"
                                                        sx={{ fontWeight: 700 }}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Card>
                    </Grow>
                )}
            </Box>
        </Fade>
    );
};

export default StudentAttendanceView;