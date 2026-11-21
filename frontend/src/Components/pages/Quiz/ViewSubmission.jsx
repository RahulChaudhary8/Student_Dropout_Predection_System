import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import AssignmentTurnedInRoundedIcon from "@mui/icons-material/AssignmentTurnedInRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import QuizRoundedIcon from "@mui/icons-material/QuizRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";

const API = "http://localhost:5000";

function Detail({ icon, label, value }) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="flex-start">
      <Box sx={{ color: "#4f46e5", display: "flex", mt: 0.25 }}>{icon}</Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
        <Typography sx={{ fontWeight: 650, overflowWrap: "anywhere" }}>{value}</Typography>
      </Box>
    </Stack>
  );
}

export default function ViewSubmission() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API}/api/quiz/mentor/submission/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (active) setSubmission(response.data.submission);
      } catch (requestError) {
        if (active) {
          setError(requestError.response?.data?.error || "Unable to load this submission.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [id]);

  const goBack = () => {
    navigate("/dashboard");
  };

  return (
    <Box className="min-h-screen bg-slate-50 p-4 md:p-8" sx={{ minHeight: "100vh", bgcolor: "#f5f7fb", p: { xs: 2, sm: 3, md: 4 } }}>
      <Box sx={{ maxWidth: 1050, mx: "auto" }}>
        <Button
          onClick={goBack}
          startIcon={<ArrowBackRoundedIcon />}
          variant="outlined"
          sx={{ mb: 2.5, borderRadius: 2, textTransform: "none", fontWeight: 700 }}
        >
          Back to submissions
        </Button>

        {loading ? (
          <Card elevation={0} sx={{ border: "1px solid #e6eaf2", borderRadius: 4 }}>
            <CardContent sx={{ py: 10, textAlign: "center" }}>
              <CircularProgress />
              <Typography sx={{ mt: 2 }} color="text.secondary">Loading submission details...</Typography>
            </CardContent>
          </Card>
        ) : error ? (
          <Alert severity="error" action={<Button color="inherit" onClick={goBack}>Back</Button>}>{error}</Alert>
        ) : submission ? (
          <>
            <Card
              elevation={0}
              sx={{
                mb: 2.5,
                overflow: "hidden",
                borderRadius: 4,
                color: "#fff",
                background: "linear-gradient(120deg, #312e81 0%, #4f46e5 60%, #7c3aed 100%)",
              }}
            >
              <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ width: 58, height: 58, bgcolor: "rgba(255,255,255,0.18)", fontSize: 24, fontWeight: 800 }}>
                    {(submission.studentName || "S").trim().charAt(0).toUpperCase()}
                  </Avatar>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="overline" sx={{ color: "rgba(255,255,255,0.75)", letterSpacing: 1.2 }}>
                      QUIZ SUBMISSION
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, fontSize: { xs: 23, sm: 30 }, overflowWrap: "anywhere" }}>
                      {submission.studentName}
                    </Typography>
                    <Typography sx={{ color: "rgba(255,255,255,0.82)" }}>
                      {submission.quizId?.title || "Mental Health Quiz"}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            <Card elevation={0} sx={{ mb: 2.5, border: "1px solid #e6eaf2", borderRadius: 4 }}>
              <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                <Typography variant="h6" sx={{ mb: 2.5, fontWeight: 800, color: "#172033" }}>Student and submission details</Typography>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" }, gap: 2.5 }}>
                  <Detail icon={<EmailRoundedIcon fontSize="small" />} label="Student email" value={submission.email} />
                  <Detail icon={<QuizRoundedIcon fontSize="small" />} label="Quiz" value={submission.quizId?.title || "Mental Health Quiz"} />
                  <Detail icon={<ScheduleRoundedIcon fontSize="small" />} label="Submitted at" value={new Date(submission.submittedAt).toLocaleString()} />
                  <Detail icon={<LocationOnRoundedIcon fontSize="small" />} label="Submitted location" value={`${Number(submission.latitude).toFixed(6)}, ${Number(submission.longitude).toFixed(6)}`} />
                  <Detail icon={<LocationOnRoundedIcon fontSize="small" />} label="Distance from quiz center" value={`${submission.distanceFromCenter} meters`} />
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <AssignmentTurnedInRoundedIcon sx={{ color: "#059669" }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Status</Typography>
                      <Box><Chip size="small" color="success" label="Submitted" /></Box>
                    </Box>
                  </Stack>
                </Box>
              </CardContent>
            </Card>

            <Card elevation={0} sx={{ border: "1px solid #e6eaf2", borderRadius: 4, overflow: "hidden" }}>
              <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: "#172033" }}>Question-wise responses</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                  Read-only answers submitted by this student.
                </Typography>
                <Stack spacing={1.5}>
                  {submission.answers.map((answer, index) => {
                    const selected = answer.questionId?.[`option${answer.selectedOption}`];
                    return (
                      <Card key={answer._id || index} variant="outlined" sx={{ borderColor: "#e6eaf2", borderRadius: 3 }}>
                        <CardContent sx={{ p: { xs: 2, sm: 2.5 }, "&:last-child": { pb: { xs: 2, sm: 2.5 } } }}>
                          <Stack direction="row" spacing={1.5} alignItems="flex-start">
                            <Avatar sx={{ width: 32, height: 32, bgcolor: "#eef2ff", color: "#4338ca", fontSize: 14, fontWeight: 800 }}>
                              {index + 1}
                            </Avatar>
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Typography sx={{ fontWeight: 750, color: "#172033" }}>
                                {answer.questionId?.questionText || "Question unavailable"}
                              </Typography>
                              <Divider sx={{ my: 1.5 }} />
                              <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ sm: "center" }}>
                                <Chip size="small" color="primary" label={`Option ${answer.selectedOption}`} />
                                <Typography color="text.secondary" sx={{ overflowWrap: "anywhere" }}>
                                  {selected || "Selected response"}
                                </Typography>
                              </Stack>
                            </Box>
                          </Stack>
                        </CardContent>
                      </Card>
                    );
                  })}
                </Stack>
              </CardContent>
            </Card>
          </>
        ) : null}
      </Box>
    </Box>
  );
}
