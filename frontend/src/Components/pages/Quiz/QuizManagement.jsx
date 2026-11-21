import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  MenuItem,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddLocationAltRoundedIcon from "@mui/icons-material/AddLocationAltRounded";
import AssignmentTurnedInRoundedIcon from "@mui/icons-material/AssignmentTurnedInRounded";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import QuizRoundedIcon from "@mui/icons-material/QuizRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";

const API = "http://localhost:5000";
const EMPTY_FORM = {
  title: "",
  description: "",
  courseApplied: "",
  branchSpecialization: "",
  latitude: "",
  longitude: "",
  allowedRadius: "100",
  startTime: "",
  endTime: "",
};

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    backgroundColor: "#fff",
  },
};

function formatDate(value) {
  return new Date(value).toLocaleString();
}

export default function QuizManagement() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const auth = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);
  const [quizzes, setQuizzes] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [courseTargets, setCourseTargets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [notice, setNotice] = useState({ open: false, message: "", severity: "success" });

  const notify = (message, severity = "success") => {
    setNotice({ open: true, message, severity });
  };

  const load = useCallback(async () => {
    try {
      const [quizRes, submissionRes, targetRes] = await Promise.all([
        axios.get(`${API}/api/quiz/mentor`, auth),
        axios.get(`${API}/api/quiz/mentor/submissions`, auth),
        axios.get(`${API}/api/quiz/mentor/targets`, auth),
      ]);
      setQuizzes(quizRes.data.quizzes);
      setSubmissions(submissionRes.data.submissions);
      setCourseTargets(targetRes.data.targets);
    } catch (error) {
      notify(error.response?.data?.error || "Unable to load quiz data.", "error");
    } finally {
      setLoading(false);
    }
  }, [auth]);

  useEffect(() => {
    load();
  }, [load]);

  const updateForm = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === "courseApplied" ? { branchSpecialization: "" } : {}),
    }));
  };

  const createQuiz = async (event) => {
    event.preventDefault();
    const start = new Date(form.startTime);
    const end = new Date(form.endTime);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      notify("Enter valid quiz start and end date/time.", "error");
      return;
    }
    if (end <= start) {
      notify("End date and time must be after the start date and time.", "error");
      return;
    }

    setSaving(true);
    try {
      await axios.post(
        `${API}/api/quiz/create`,
        {
          ...form,
          latitude: Number(form.latitude),
          longitude: Number(form.longitude),
          allowedRadius: Number(form.allowedRadius),
        },
        auth
      );
      setForm(EMPTY_FORM);
      notify("Quiz created successfully.");
      await load();
    } catch (error) {
      notify(error.response?.data?.error || "Quiz creation failed.", "error");
    } finally {
      setSaving(false);
    }
  };

  const selectedCourse = courseTargets.find((target) => target.course === form.courseApplied);
  const availableBranches = selectedCourse?.branches || [];

  const useLocation = () => {
    if (!navigator.geolocation) {
      notify("Location services are not supported by this browser.", "error");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setForm((current) => ({
          ...current,
          latitude: coords.latitude.toFixed(6),
          longitude: coords.longitude.toFixed(6),
        }));
        setLocating(false);
        notify("Current location added.");
      },
      () => {
        setLocating(false);
        notify("Location permission is required to use your current location.", "error");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const activeQuizCount = quizzes.filter((quiz) => {
    const now = Date.now();
    return quiz.isActive && now >= new Date(quiz.startTime).getTime() && now <= new Date(quiz.endTime).getTime();
  }).length;

  return (
    <Box sx={{ minHeight: "100%", bgcolor: "#f5f7fb", p: { xs: 2, sm: 3, md: 4 } }}>
      <Box sx={{ maxWidth: 1400, mx: "auto" }}>
        <Box
          sx={{
            mb: 3,
            p: { xs: 2.5, sm: 3.5 },
            borderRadius: 4,
            color: "#fff",
            background: "linear-gradient(120deg, #312e81 0%, #4f46e5 55%, #7c3aed 100%)",
            boxShadow: "0 12px 30px rgba(79,70,229,0.2)",
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ p: 1.5, display: "flex", borderRadius: 3, bgcolor: "rgba(255,255,255,0.16)" }}>
              <QuizRoundedIcon sx={{ fontSize: 32 }} />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, fontSize: { xs: 23, sm: 30 } }}>
                Quiz Management
              </Typography>
              <Typography sx={{ mt: 0.5, color: "rgba(255,255,255,0.82)" }}>
                Create location-based quizzes and review student responses.
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 2, mb: 3 }}>
          {[
            { label: "Total quizzes", value: quizzes.length, icon: <QuizRoundedIcon />, color: "#4f46e5" },
            { label: "Currently active", value: activeQuizCount, icon: <ScheduleRoundedIcon />, color: "#059669" },
            { label: "Submissions", value: submissions.length, icon: <AssignmentTurnedInRoundedIcon />, color: "#d97706" },
          ].map((stat) => (
            <Card key={stat.label} elevation={0} sx={{ border: "1px solid #e6eaf2", borderRadius: 3 }}>
              <CardContent sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 2.5 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
                  <Typography variant="h4" sx={{ mt: 0.5, fontWeight: 800, color: "#172033" }}>{stat.value}</Typography>
                </Box>
                <Box sx={{ color: stat.color, p: 1.5, borderRadius: 2.5, bgcolor: `${stat.color}14`, display: "flex" }}>
                  {stat.icon}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>

        <Card component="form" onSubmit={createQuiz} elevation={0} sx={{ mb: 3, border: "1px solid #e6eaf2", borderRadius: 3 }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.5 }}>
              <AddLocationAltRoundedIcon color="primary" />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 750 }}>Create a quiz</Typography>
                <Typography variant="body2" color="text.secondary">Choose the course and optional branch that can access this quiz, then set its schedule and location.</Typography>
              </Box>
            </Stack>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" }, gap: 2 }}>
              <TextField name="title" label="Quiz title" value={form.title} onChange={updateForm} required inputProps={{ maxLength: 150 }} sx={fieldSx} />
              <TextField
                select
                name="courseApplied"
                label="Course"
                value={form.courseApplied}
                onChange={updateForm}
                required
                sx={fieldSx}
              >
                {courseTargets.length === 0 && <MenuItem value="" disabled>No student courses available</MenuItem>}
                {courseTargets.map((target) => (
                  <MenuItem key={target.course} value={target.course}>{target.course}</MenuItem>
                ))}
              </TextField>
              <TextField
                select
                name="branchSpecialization"
                label="Branch (optional)"
                value={form.branchSpecialization}
                onChange={updateForm}
                disabled={!form.courseApplied}
                sx={fieldSx}
              >
                <MenuItem value="">All branches</MenuItem>
                {availableBranches.map((branch) => (
                  <MenuItem key={branch} value={branch}>{branch}</MenuItem>
                ))}
              </TextField>
              <TextField name="allowedRadius" label="Allowed radius (meters)" type="number" value={form.allowedRadius} onChange={updateForm} required inputProps={{ min: 1, step: 1 }} sx={fieldSx} />
              <TextField name="latitude" label="Latitude" type="number" value={form.latitude} onChange={updateForm} required inputProps={{ min: -90, max: 90, step: "any" }} sx={fieldSx} />
              <TextField name="longitude" label="Longitude" type="number" value={form.longitude} onChange={updateForm} required inputProps={{ min: -180, max: 180, step: "any" }} sx={fieldSx} />
              <TextField name="startTime" label="Start date and time" type="datetime-local" value={form.startTime} onChange={updateForm} required InputLabelProps={{ shrink: true }} sx={fieldSx} />
              <TextField name="endTime" label="End date and time" type="datetime-local" value={form.endTime} onChange={updateForm} required inputProps={{ min: form.startTime }} InputLabelProps={{ shrink: true }} sx={fieldSx} />
              <TextField name="description" label="Description (optional)" value={form.description} onChange={updateForm} multiline minRows={2} inputProps={{ maxLength: 1000 }} sx={{ ...fieldSx, gridColumn: { md: "1 / -1" } }} />
            </Box>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "center" }} sx={{ mt: 2.5 }}>
              <Tooltip title="Fill latitude and longitude from this device's current location">
                <span>
                  <Button
                    variant="outlined"
                    startIcon={locating ? <CircularProgress size={18} /> : <PlaceRoundedIcon />}
                    onClick={useLocation}
                    disabled={locating}
                    sx={{ borderRadius: 2, py: 1.1, textTransform: "none", fontWeight: 700 }}
                  >
                    {locating ? "Getting location..." : "Use current location"}
                  </Button>
                </span>
              </Tooltip>
              <Button
                type="submit"
                variant="contained"
                disabled={saving}
                startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <QuizRoundedIcon />}
                sx={{ borderRadius: 2, py: 1.1, px: 3, textTransform: "none", fontWeight: 700, boxShadow: "none" }}
              >
                {saving ? "Creating..." : "Create quiz"}
              </Button>
              <Typography variant="caption" color="text.secondary">
                Students must be within the selected radius to start.
              </Typography>
            </Stack>
          </CardContent>
        </Card>

        <Card elevation={0} sx={{ mb: 3, border: "1px solid #e6eaf2", borderRadius: 3, overflow: "hidden" }}>
          <Box sx={{ p: 2.5, borderBottom: "1px solid #edf0f5" }}>
            <Typography variant="h6" sx={{ fontWeight: 750 }}>Your quizzes</Typography>
            <Typography variant="body2" color="text.secondary">Schedule, location and availability for each quiz.</Typography>
          </Box>
          {loading ? (
            <Box sx={{ py: 7, display: "flex", justifyContent: "center" }}><CircularProgress /></Box>
          ) : quizzes.length === 0 ? (
            <Box sx={{ py: 6, px: 2, textAlign: "center" }}>
              <QuizRoundedIcon sx={{ color: "#94a3b8", fontSize: 38, mb: 1 }} />
              <Typography sx={{ fontWeight: 700 }}>No quizzes created yet</Typography>
              <Typography variant="body2" color="text.secondary">Create your first quiz using the form above.</Typography>
            </Box>
          ) : (
            <TableContainer sx={{ maxHeight: 420 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    {["Title", "Course", "Branch", "Status", "Location", "Radius", "Starts", "Ends"].map((heading) => (
                      <TableCell key={heading} sx={{ bgcolor: "#f8fafc", fontWeight: 750, whiteSpace: "nowrap" }}>{heading}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {quizzes.map((quiz) => {
                    const now = Date.now();
                    const active = quiz.isActive && now >= new Date(quiz.startTime).getTime() && now <= new Date(quiz.endTime).getTime();
                    return (
                      <TableRow hover key={quiz._id}>
                        <TableCell sx={{ fontWeight: 650 }}>{quiz.title}</TableCell>
                        <TableCell>{quiz.courseApplied}</TableCell>
                        <TableCell>{quiz.branchSpecialization || "All branches"}</TableCell>
                        <TableCell><Chip size="small" color={active ? "success" : "default"} label={active ? "Active" : "Scheduled / ended"} /></TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap" }}>{Number(quiz.latitude).toFixed(5)}, {Number(quiz.longitude).toFixed(5)}</TableCell>
                        <TableCell>{quiz.allowedRadius} m</TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap" }}>{formatDate(quiz.startTime)}</TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap" }}>{formatDate(quiz.endTime)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>

        <Card elevation={0} sx={{ border: "1px solid #e6eaf2", borderRadius: 3, overflow: "hidden" }}>
          <Box sx={{ p: 2.5, borderBottom: "1px solid #edf0f5" }}>
            <Typography variant="h6" sx={{ fontWeight: 750 }}>Student submissions</Typography>
            <Typography variant="body2" color="text.secondary">Submitted responses are private to mentors.</Typography>
          </Box>
          {loading ? (
            <Box sx={{ py: 7, display: "flex", justifyContent: "center" }}><CircularProgress /></Box>
          ) : submissions.length === 0 ? (
            <Box sx={{ py: 6, px: 2, textAlign: "center" }}>
              <AssignmentTurnedInRoundedIcon sx={{ color: "#94a3b8", fontSize: 38, mb: 1 }} />
              <Typography sx={{ fontWeight: 700 }}>No submissions yet</Typography>
              <Typography variant="body2" color="text.secondary">Student submissions will appear here.</Typography>
            </Box>
          ) : (
            <TableContainer sx={{ maxHeight: 420 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    {["Student", "Email", "Quiz", "Submitted", ""].map((heading, index) => (
                      <TableCell key={`${heading}-${index}`} sx={{ bgcolor: "#f8fafc", fontWeight: 750, whiteSpace: "nowrap" }}>{heading}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow hover key={submission._id}>
                      <TableCell sx={{ fontWeight: 650 }}>{submission.studentName}</TableCell>
                      <TableCell>{submission.email}</TableCell>
                      <TableCell>{submission.quizId?.title || "Quiz"}</TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>{formatDate(submission.submittedAt)}</TableCell>
                      <TableCell>
                        <Button size="small" variant="outlined" startIcon={<VisibilityRoundedIcon />} onClick={() => navigate(`/mentor/quiz/submissions/${submission._id}`)} sx={{ textTransform: "none", borderRadius: 2 }}>
                          View answers
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>
      </Box>

      <Snackbar open={notice.open} autoHideDuration={5000} onClose={() => setNotice((current) => ({ ...current, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={notice.severity} variant="filled" onClose={() => setNotice((current) => ({ ...current, open: false }))}>
          {notice.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
