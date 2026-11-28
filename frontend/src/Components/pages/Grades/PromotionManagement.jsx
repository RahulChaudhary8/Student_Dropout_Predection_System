import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";

const API = "http://localhost:5000/api";

export default function PromotionManagement() {
  const [programs, setPrograms] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [branch, setBranch] = useState("");
  const [period, setPeriod] = useState("");
  const [students, setStudents] = useState([]);
  const [results, setResults] = useState([]);
  const [published, setPublished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [promotingId, setPromotingId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const headers = useMemo(() => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  useEffect(() => {
    axios
      .get(`${API}/results/options`, { headers })
      .then((response) => setPrograms(response.data.filter((program) => program.studyMode === "semester")))
      .catch((loadError) => setError(loadError.response?.data?.message || "Could not load courses"));
  }, [headers]);

  const selectedProgram = programs.find((program) => String(program._id) === courseId);
  const periodLabel = "Semester";

  useEffect(() => {
    setBranch("");
    setPeriod("");
  }, [courseId]);

  useEffect(() => {
    setPeriod("");
  }, [branch]);

  const loadCohort = useCallback(async () => {
    if (!courseId || !branch || !period) {
      setStudents([]);
      setResults([]);
      setPublished(false);
      return;
    }
    setLoading(true);
    setError("");
    setNotice("");
    try {
      const response = await axios.get(`${API}/results/cohort`, {
        headers,
        params: { courseId, branch, period },
      });
      setStudents(response.data.students || []);
      setResults(response.data.results || []);
      setPublished(Boolean(response.data.published));
    } catch (loadError) {
      setError(loadError.response?.data?.message || "Could not load promotion cohort");
    } finally {
      setLoading(false);
    }
  }, [branch, courseId, headers, period]);

  useEffect(() => {
    loadCohort();
  }, [loadCohort]);

  const promoteStudent = async (studentId) => {
    setPromotingId(studentId);
    setError("");
    setNotice("");
    try {
      const response = await axios.post(
        `${API}/results/promote/${encodeURIComponent(studentId)}`,
        {},
        { headers }
      );
      setNotice(response.data.message);
      await loadCohort();
    } catch (promoteError) {
      setError(promoteError.response?.data?.message || "Promotion failed");
    } finally {
      setPromotingId("");
    }
  };

  const periodCount = Number(selectedProgram?.periodCount || 0);
  const isFinalSemester = periodCount > 0 && Number(period) === periodCount;

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
        <TrendingUpRoundedIcon color="primary" />
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Student Promotions
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {notice && <Alert severity="success" sx={{ mb: 2 }}>{notice}</Alert>}

      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" }, gap: 2 }}>
          <TextField
            select
            size="small"
            label="Course"
            value={courseId}
            onChange={(event) => setCourseId(event.target.value)}
          >
            <MenuItem value="">Select course</MenuItem>
            {programs.map((program) => (
              <MenuItem key={program._id} value={program._id}>{program.name}</MenuItem>
            ))}
          </TextField>

          <TextField
            select
            size="small"
            label="Branch"
            value={branch}
            disabled={!selectedProgram}
            onChange={(event) => setBranch(event.target.value)}
          >
            <MenuItem value="">Select branch</MenuItem>
            {(selectedProgram?.branches || []).map((item) => (
              <MenuItem key={item.name} value={item.name}>{item.name}</MenuItem>
            ))}
          </TextField>

          <TextField
            select
            size="small"
            label={periodLabel}
            value={period}
            disabled={!branch}
            onChange={(event) => setPeriod(event.target.value)}
          >
            <MenuItem value="">Select semester</MenuItem>
            {Array.from({ length: periodCount }, (_, index) => index + 1).map((item) => (
              <MenuItem key={item} value={String(item)}>Semester {item}</MenuItem>
            ))}
          </TextField>
        </Box>
      </Paper>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Student ID</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>GPA</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Result</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Promotion</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!courseId || !branch || !period ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                    Select course, branch and semester.
                  </TableCell>
                </TableRow>
              ) : results.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                    No students found in this semester.
                  </TableCell>
                </TableRow>
              ) : (
                results.map((result) => {
                  const student = students.find((item) => item.studentId === result.studentId);
                  const currentSemester = Number(student?.semester || period);
                  const alreadyAdvanced = currentSemester > Number(period);
                  const canPromote =
                    published &&
                    result.status === "Pass" &&
                    !alreadyAdvanced &&
                    !isFinalSemester;
                  return (
                    <TableRow key={result.studentId} hover>
                      <TableCell>{result.rollNumber || result.studentId}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{result.fullName}</TableCell>
                      <TableCell>
                        <Chip
                          label={alreadyAdvanced ? "Promoted" : result.status}
                          color={alreadyAdvanced || result.status === "Pass" ? "success" : "error"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{result.gpa}</TableCell>
                      <TableCell>
                        {published ? "Published" : "Not published"}
                      </TableCell>
                      <TableCell align="right">
                        {isFinalSemester ? (
                          <Chip label="Final Semester" size="small" />
                        ) : (
                          <Button
                            size="small"
                            variant="contained"
                            disabled={!canPromote || promotingId === result.studentId}
                            onClick={() => promoteStudent(result.studentId)}
                          >
                            {promotingId === result.studentId
                              ? "Promoting..."
                              : `Promote to Semester ${Number(period) + 1}`}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
