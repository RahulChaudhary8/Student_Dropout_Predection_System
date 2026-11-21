import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  LinearProgress,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import PsychologyRoundedIcon from "@mui/icons-material/PsychologyRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";

const API = "http://localhost:5000";

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const toRadians = (value) => (value * Math.PI) / 180;
  const earthRadius = 6371000;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const OPTIONS = ["A", "B", "C", "D"];

export default function MentalHealthQuiz({ onBack }) {
  const navigate = useNavigate();
  const [stage, setStage] = useState("loading");
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [location, setLocation] = useState(null);
  const [message, setMessage] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const token = localStorage.getItem("token");
  const auth = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);

  const goBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    navigate("/studentportal");
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const attempt = await axios.get(`${API}/api/quiz/check-attempt`, auth);
        if (!active) return;
        if (attempt.data.submitted) {
          setStage("submitted");
          setMessage("You have already submitted this quiz.");
        } else {
          setStage("start");
        }
      } catch (error) {
        if (!active) return;
        setStage("error");
        setMessage(error.response?.data?.error || "Unable to load quiz status.");
      }
    })();
    return () => {
      active = false;
    };
  }, [auth]);

  const startQuiz = () => {
    if (!navigator.geolocation) {
      setStage("error");
      setMessage("Location services are not supported by this browser.");
      return;
    }

    setMessage("");
    setStage("loading");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          const activeQuiz = await axios.get(`${API}/api/quiz/active`, auth);
          const activeQuizData = activeQuiz.data.quiz;
          const distance = calculateDistance(
            coords.latitude,
            coords.longitude,
            activeQuizData.latitude,
            activeQuizData.longitude
          );
          if (distance > activeQuizData.allowedRadius) {
            setStage("error");
            setMessage("You are outside the permitted quiz area.");
            return;
          }

          const attempt = await axios.get(`${API}/api/quiz/check-attempt`, auth);
          if (attempt.data.submitted) {
            setStage("submitted");
            setMessage("You have already submitted this quiz.");
            return;
          }

          const questionRes = await axios.get(
            `${API}/api/quiz/questions/random?count=10`,
            auth
          );
          if (questionRes.data.questions.length !== 10) {
            throw new Error("The quiz questions are not ready. Please contact your mentor.");
          }
          setQuiz(activeQuizData);
          setLocation(coords);
          setQuestions(questionRes.data.questions);
          setAnswers({});
          setCurrent(0);
          setStage("questions");
        } catch (error) {
          setStage("error");
          setMessage(error.response?.data?.error || error.message || "Unable to start the quiz.");
        }
      },
      () => {
        setStage("error");
        setMessage("Location permission is required to access the quiz.");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const submitQuiz = async () => {
    if (Object.keys(answers).length !== questions.length) {
      setMessage("Please answer all 10 questions before submitting.");
      setConfirmOpen(false);
      return;
    }

    try {
      setConfirmOpen(false);
      setStage("loading");
      await axios.post(
        `${API}/api/quiz/submit`,
        {
          quizId: quiz._id,
          latitude: location.latitude,
          longitude: location.longitude,
          answers: questions.map((question) => ({
            questionId: question._id,
            selectedOption: answers[question._id],
          })),
        },
        auth
      );
      setStage("submitted");
      setMessage("");
    } catch (error) {
      setStage("error");
      setMessage(error.response?.data?.error || "Quiz submission failed.");
    }
  };

  const pageHeader = (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={2}
      alignItems={{ sm: "center" }}
      justifyContent="space-between"
      sx={{ mb: 2.5 }}
    >
      <Button
        onClick={goBack}
        startIcon={<ArrowBackRoundedIcon />}
        variant="outlined"
        sx={{ alignSelf: "flex-start", borderRadius: 2, textTransform: "none", fontWeight: 700 }}
      >
        Back to student dashboard
      </Button>
      <Typography variant="body2" color="text.secondary">
        Your answers are private and visible only to your mentor.
      </Typography>
    </Stack>
  );

  if (stage === "loading") {
    return (
      <Box className="min-h-[380px] flex items-center justify-center p-4" sx={{ minHeight: 380 }}>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress />
          <Typography color="text.secondary">Preparing your quiz...</Typography>
        </Stack>
      </Box>
    );
  }

  if (stage === "submitted") {
    return (
      <Box sx={{ maxWidth: 760, mx: "auto", p: { xs: 2, sm: 3 } }}>
        {pageHeader}
        <Card elevation={0} sx={{ border: "1px solid #bbf7d0", borderRadius: 4, overflow: "hidden" }}>
          <Box sx={{ height: 8, bgcolor: "#10b981" }} />
          <CardContent sx={{ p: { xs: 4, sm: 6 }, textAlign: "center" }}>
            <CheckCircleRoundedIcon sx={{ color: "#059669", fontSize: 64, mb: 1.5 }} />
            <Typography variant="h4" sx={{ fontWeight: 850, color: "#065f46", fontSize: { xs: 24, sm: 32 } }}>
              Quiz Submitted Successfully
            </Typography>
            <Typography sx={{ mt: 1.5, color: "#047857" }}>
              {message || "Your responses have been recorded."}
            </Typography>
            <Button onClick={goBack} startIcon={<ArrowBackRoundedIcon />} sx={{ mt: 3, textTransform: "none", fontWeight: 700 }}>
              Return to dashboard
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (stage === "error") {
    return (
      <Box sx={{ maxWidth: 760, mx: "auto", p: { xs: 2, sm: 3 } }}>
        {pageHeader}
        <Alert
          severity="error"
          sx={{ borderRadius: 3, alignItems: "center" }}
          action={
            <Button color="inherit" onClick={startQuiz} sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>
              Try again
            </Button>
          }
        >
          {message}
        </Alert>
      </Box>
    );
  }

  if (stage === "start") {
    return (
      <Box sx={{ maxWidth: 900, mx: "auto", p: { xs: 2, sm: 3 } }}>
        {pageHeader}
        <Card
          elevation={0}
          sx={{
            overflow: "hidden",
            border: "1px solid #e0e7ff",
            borderRadius: 4,
            background: "linear-gradient(140deg, #fff 20%, #eef2ff 100%)",
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
            <Box sx={{ maxWidth: 650, mx: "auto", textAlign: "center" }}>
              <Box sx={{ display: "inline-flex", p: 2, borderRadius: 4, bgcolor: "#e0e7ff", color: "#4338ca", mb: 2 }}>
                <PsychologyRoundedIcon sx={{ fontSize: 42 }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 850, color: "#172033", fontSize: { xs: 26, sm: 34 } }}>
                Mental Health Check-in
              </Typography>
              <Typography sx={{ mt: 1.5, color: "#64748b", lineHeight: 1.75 }}>
                Take a few minutes to reflect on how you have been feeling. This quiz has 10 questions and your responses will be shared only with your mentor.
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 1.5, my: 3, textAlign: "left" }}>
                {[
                  ["10 questions", "Choose one response for each question."],
                  ["One attempt", "Review your answers before final submission."],
                  ["Location check", "You need to be within the permitted quiz area."],
                ].map(([title, detail]) => (
                  <Box key={title} sx={{ p: 2, borderRadius: 3, bgcolor: "#fff", border: "1px solid #e2e8f0" }}>
                    <Typography sx={{ fontWeight: 750, color: "#334155" }}>{title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{detail}</Typography>
                  </Box>
                ))}
              </Box>
              <Button
                onClick={startQuiz}
                variant="contained"
                size="large"
                startIcon={<LocationOnRoundedIcon />}
                sx={{ px: 4, py: 1.3, borderRadius: 2.5, textTransform: "none", fontWeight: 750, boxShadow: "none" }}
              >
                Verify location and start
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  const question = questions[current];
  if (!question) {
    return (
      <Box sx={{ maxWidth: 760, mx: "auto", p: 3 }}>
        {pageHeader}
        <Alert severity="error">Quiz questions could not be loaded. Please contact your mentor.</Alert>
      </Box>
    );
  }
  const progress = ((current + 1) / questions.length) * 100;

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", p: { xs: 2, sm: 3 } }}>
      {pageHeader}
      <Card elevation={0} sx={{ mb: 2, border: "1px solid #e6eaf2", borderRadius: 3 }}>
        <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
            <Typography sx={{ fontWeight: 750, color: "#334155" }}>
              Question {current + 1} <Typography component="span" color="text.secondary">of {questions.length}</Typography>
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 750, color: "#4f46e5" }}>{Math.round(progress)}%</Typography>
          </Stack>
          <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 5, bgcolor: "#e2e8f0", "& .MuiLinearProgress-bar": { borderRadius: 5, bgcolor: "#4f46e5" } }} />
        </CardContent>
      </Card>

      <Card elevation={0} sx={{ border: "1px solid #e6eaf2", borderRadius: 4 }}>
        <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
          <Typography variant="overline" sx={{ color: "#6366f1", letterSpacing: 1, fontWeight: 800 }}>
            REFLECTION {String(current + 1).padStart(2, "0")}
          </Typography>
          <Typography variant="h5" sx={{ mt: 0.5, fontWeight: 800, lineHeight: 1.4, color: "#172033", fontSize: { xs: 20, sm: 25 } }}>
            {question.questionText}
          </Typography>

          <RadioGroup
            value={answers[question._id] || ""}
            onChange={(event) => {
              setAnswers((previous) => ({ ...previous, [question._id]: event.target.value }));
              setMessage("");
            }}
            sx={{ mt: 3, gap: 1.2 }}
          >
            {OPTIONS.map((option) => {
              const selected = answers[question._id] === option;
              return (
                <Box
                  key={option}
                  className={`rounded-xl border transition-colors ${selected ? "border-indigo-500 bg-indigo-50" : "border-slate-200 bg-white hover:border-indigo-300"}`}
                  sx={{
                    border: "1px solid",
                    borderColor: selected ? "#6366f1" : "#e2e8f0",
                    bgcolor: selected ? "#eef2ff" : "#fff",
                    borderRadius: 3,
                    transition: "all 150ms ease",
                    "&:hover": { borderColor: "#818cf8", bgcolor: selected ? "#eef2ff" : "#f8fafc" },
                  }}
                >
                  <FormControlLabel
                    value={option}
                    control={<Radio color="primary" />}
                    label={
                      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ py: 0.8 }}>
                        <Box sx={{ width: 30, height: 30, borderRadius: 2, display: "grid", placeItems: "center", fontSize: 13, fontWeight: 800, bgcolor: selected ? "#4f46e5" : "#f1f5f9", color: selected ? "#fff" : "#475569" }}>
                          {option}
                        </Box>
                        <Typography sx={{ color: "#334155", fontWeight: selected ? 700 : 500 }}>
                          {question[`option${option}`]}
                        </Typography>
                      </Stack>
                    }
                    sx={{ m: 0, px: 1.5, width: "100%" }}
                  />
                </Box>
              );
            })}
          </RadioGroup>

          {message && <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>{message}</Alert>}

          <Stack direction="row" justifyContent="space-between" spacing={2} sx={{ mt: 3 }}>
            <Button
              disabled={current === 0}
              onClick={() => setCurrent((value) => value - 1)}
              startIcon={<ArrowBackRoundedIcon />}
              variant="outlined"
              sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700 }}
            >
              Previous
            </Button>
            {current < questions.length - 1 ? (
              <Button
                onClick={() => {
                  if (!answers[question._id]) {
                    setMessage("Please choose an answer before continuing.");
                    return;
                  }
                  setMessage("");
                  setCurrent((value) => value + 1);
                }}
                endIcon={<ArrowForwardRoundedIcon />}
                variant="contained"
                sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700, boxShadow: "none" }}
              >
                Next question
              </Button>
            ) : (
              <Button
                onClick={() => setConfirmOpen(true)}
                endIcon={<SendRoundedIcon />}
                variant="contained"
                color="success"
                sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700, boxShadow: "none" }}
              >
                Submit quiz
              </Button>
            )}
          </Stack>
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Submit your quiz?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to submit your answers? You can only attempt this quiz once.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setConfirmOpen(false)} sx={{ textTransform: "none" }}>Review answers</Button>
          <Button onClick={submitQuiz} variant="contained" color="success" sx={{ textTransform: "none", fontWeight: 700 }}>
            Confirm submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
