import React, { useState } from "react";
import axios from "axios";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Chip,
  Tooltip,
  Fade,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  LinearProgress,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SaveIcon from "@mui/icons-material/Save";
import QuizIcon from "@mui/icons-material/Quiz";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";

const emptyQuestion = () => ({
  question: "",
  options: ["", "", "", ""],
  correctAnswer: 0,
});

const OPTION_LABELS = ["A", "B", "C", "D"];
const OPTION_COLORS = ["#6366f1", "#0ea5e9", "#f59e0b", "#22c55e"];
const OPTION_LIGHT = ["#ede9fe", "#e0f2fe", "#fef3c7", "#dcfce7"];
const OPTION_TEXT = ["#4338ca", "#0369a1", "#a16207", "#15803d"];

const MentorQuizCreate = () => {
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState([emptyQuestion()]);
  const [saved, setSaved] = useState(false);

  /* ── Helpers ── */
  const updateQuestion = (i, field, value) => {
    const next = [...questions];
    next[i] = { ...next[i], [field]: value };
    setQuestions(next);
  };

  const updateOption = (i, j, value) => {
    const next = [...questions];
    next[i].options[j] = value;
    setQuestions(next);
  };

  const addQuestion = () => setQuestions([...questions, emptyQuestion()]);

  const removeQuestion = (i) => {
    if (questions.length === 1) return;
    setQuestions(questions.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async () => {
    try {
      await axios.post("http://localhost:5000/api/quiz/create", {
        title,
        mentorId: "mentor123",
        questions,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error("Error saving quiz:", err);
    }
  };

  // Progress: questions with both question text + all 4 options filled
  const filled = questions.filter(
    (q) => q.question.trim() && q.options.every((o) => o.trim())
  ).length;
  const progress = (filled / questions.length) * 100;

  return (
    <Box className="min-h-screen bg-slate-50 p-4 md:p-8">
      <Box sx={{ maxWidth: 720, mx: "auto" }}>

        {/* ── Page Header ── */}
        <Box className="flex items-center gap-2 mb-6">
          <QuizIcon sx={{ color: "#6366f1", fontSize: 26 }} />
          <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a" }}>
            Create Quiz
          </Typography>
          <Chip
            label={`${questions.length} Q`}
            size="small"
            sx={{ backgroundColor: "#ede9fe", color: "#6d28d9", fontWeight: 700, fontSize: "0.72rem", height: 22, ml: 1 }}
          />
        </Box>

        {/* ── Quiz Title ── */}
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #e2e8f0", mb: 4 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#334155", mb: 1.5 }}>
            Quiz Title
          </Typography>
          <TextField
            fullWidth
            placeholder="e.g. Python Basics — Week 3"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2, fontSize: "0.95rem",
                "& fieldset": { borderColor: "#e2e8f0" },
                "&:hover fieldset": { borderColor: "#6366f1" },
                "&.Mui-focused fieldset": { borderColor: "#6366f1" },
              },
            }}
          />
        </Paper>

        {/* ── Progress ── */}
        <Box className="flex items-center justify-between mb-2">
          <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
            QUESTIONS
          </Typography>
          <Typography variant="caption" sx={{ color: "#64748b" }}>
            {filled} / {questions.length} complete
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 5, borderRadius: 3, mb: 4, backgroundColor: "#e2e8f0",
            "& .MuiLinearProgress-bar": {
              backgroundColor: progress === 100 ? "#22c55e" : "#6366f1",
              borderRadius: 3, transition: "background-color 0.4s ease",
            },
          }}
        />

        {/* ── Questions ── */}
        <Box className="flex flex-col gap-4">
          {questions.map((q, i) => (
            <Fade in key={i} timeout={300}>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: "1px solid #e2e8f0",
                  overflow: "hidden",
                  transition: "box-shadow 0.2s ease",
                  "&:hover": { boxShadow: "0 4px 16px rgba(99,102,241,0.08)" },
                }}
              >
                {/* Card Header */}
                <Box
                  className="flex items-center justify-between px-4 py-2.5"
                  sx={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}
                >
                  <Box className="flex items-center gap-2">
                    <Avatar index={i} />
                    <Typography variant="caption" sx={{ fontWeight: 700, color: "#475569" }}>
                      Question {i + 1}
                    </Typography>
                  </Box>
                  <Tooltip title="Remove question" arrow TransitionComponent={Fade}>
                    <span>
                      <IconButton
                        size="small"
                        onClick={() => removeQuestion(i)}
                        disabled={questions.length === 1}
                        sx={{
                          color: "#ef4444",
                          "&:hover": { backgroundColor: "#fee2e2" },
                          "&:disabled": { opacity: 0.3 },
                        }}
                      >
                        <DeleteOutlineIcon sx={{ fontSize: 17 }} />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>

                <Box className="p-4 flex flex-col gap-4">
                  {/* Question Input */}
                  <TextField
                    fullWidth
                    placeholder={`Question ${i + 1}`}
                    value={q.question}
                    onChange={(e) => updateQuestion(i, "question", e.target.value)}
                    size="small"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2, fontSize: "0.9rem",
                        "& fieldset": { borderColor: "#e2e8f0" },
                        "&:hover fieldset": { borderColor: "#6366f1" },
                        "&.Mui-focused fieldset": { borderColor: "#6366f1" },
                      },
                    }}
                  />

                  {/* Options Grid */}
                  <Box className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt, j) => {
                      const isCorrect = q.correctAnswer === j;
                      return (
                        <Box
                          key={j}
                          sx={{
                            display: "flex", alignItems: "center", gap: 1,
                            p: 1, borderRadius: 2,
                            border: isCorrect ? `1.5px solid ${OPTION_COLORS[j]}` : "1.5px solid #e2e8f0",
                            backgroundColor: isCorrect ? OPTION_LIGHT[j] : "#fafafa",
                            transition: "all 0.2s ease",
                          }}
                        >
                          {/* Option label badge */}
                          <Box
                            sx={{
                              width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                              backgroundColor: isCorrect ? OPTION_COLORS[j] : "#e2e8f0",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              transition: "background-color 0.2s ease",
                            }}
                          >
                            <Typography sx={{ fontSize: "0.65rem", fontWeight: 800, color: isCorrect ? "#fff" : "#94a3b8" }}>
                              {OPTION_LABELS[j]}
                            </Typography>
                          </Box>

                          <TextField
                            fullWidth
                            placeholder={`Option ${j + 1}`}
                            value={opt}
                            onChange={(e) => updateOption(i, j, e.target.value)}
                            size="small"
                            variant="standard"
                            InputProps={{ disableUnderline: true }}
                            sx={{
                              "& input": {
                                fontSize: "0.82rem", color: isCorrect ? OPTION_TEXT[j] : "#334155",
                                fontWeight: isCorrect ? 700 : 400,
                                "&::placeholder": { color: "#cbd5e1" },
                              },
                            }}
                          />

                          {/* Correct toggle */}
                          <Tooltip title={isCorrect ? "Correct answer" : "Set as correct"} arrow TransitionComponent={Fade}>
                            <IconButton
                              size="small"
                              onClick={() => updateQuestion(i, "correctAnswer", j)}
                              sx={{ flexShrink: 0, p: 0.3 }}
                            >
                              {isCorrect
                                ? <CheckCircleIcon sx={{ fontSize: 18, color: OPTION_COLORS[j] }} />
                                : <RadioButtonUncheckedIcon sx={{ fontSize: 18, color: "#cbd5e1" }} />
                              }
                            </IconButton>
                          </Tooltip>
                        </Box>
                      );
                    })}
                  </Box>

                  {/* Correct Answer Summary */}
                  <Box className="flex items-center gap-1.5">
                    <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                      Correct answer:
                    </Typography>
                    <Chip
                      label={`Option ${OPTION_LABELS[q.correctAnswer]} — ${q.options[q.correctAnswer] || "not filled"}`}
                      size="small"
                      sx={{
                        backgroundColor: OPTION_LIGHT[q.correctAnswer],
                        color: OPTION_TEXT[q.correctAnswer],
                        fontWeight: 700, fontSize: "0.7rem", height: 20,
                        maxWidth: 220,
                        "& .MuiChip-label": { overflow: "hidden", textOverflow: "ellipsis" },
                      }}
                    />
                  </Box>
                </Box>
              </Paper>
            </Fade>
          ))}
        </Box>

        {/* ── Footer Actions ── */}
        <Box className="flex items-center justify-between mt-6 gap-3 flex-wrap">
          <Button
            startIcon={<AddCircleOutlineIcon />}
            onClick={addQuestion}
            variant="outlined"
            sx={{
              borderRadius: 2, textTransform: "none", fontWeight: 600,
              borderColor: "#6366f1", color: "#6366f1",
              "&:hover": { backgroundColor: "#ede9fe", borderColor: "#4f46e5" },
            }}
          >
            Add Question
          </Button>

          <Button
            startIcon={saved ? <CheckCircleIcon /> : <SaveIcon />}
            onClick={handleSubmit}
            variant="contained"
            disabled={!title.trim()}
            sx={{
              borderRadius: 2, textTransform: "none", fontWeight: 700,
              px: 3, minWidth: 130,
              backgroundColor: saved ? "#22c55e" : "#6366f1",
              "&:hover": { backgroundColor: saved ? "#16a34a" : "#4f46e5" },
              "&:disabled": { backgroundColor: "#e2e8f0", color: "#94a3b8" },
              transition: "background-color 0.3s ease",
            }}
          >
            {saved ? "Quiz Saved!" : "Save Quiz"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

// Small numbered avatar badge
const Avatar = ({ index }) => (
  <Box
    sx={{
      width: 22, height: 22, borderRadius: "50%",
      backgroundColor: "#ede9fe", display: "flex",
      alignItems: "center", justifyContent: "center",
    }}
  >
    <Typography sx={{ fontSize: "0.65rem", fontWeight: 800, color: "#6d28d9" }}>
      {index + 1}
    </Typography>
  </Box>
);

export default MentorQuizCreate;