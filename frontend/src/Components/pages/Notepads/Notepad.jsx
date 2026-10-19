import React, { useState, useEffect } from "react";
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
  Avatar,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import NoteAltOutlinedIcon from "@mui/icons-material/NoteAltOutlined";
import MenuBookIcon from "@mui/icons-material/MenuBook";

const API_URL = "http://localhost:5000/api/notes";

export default function Notepad() {
  const [notes, setNotes] = useState([]);
  const [input, setInput] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await axios.get(API_URL);
        setNotes(res.data);
      } catch (err) {
        console.error("Error fetching notes:", err);
      }
    };
    fetchNotes();
  }, []);

  const addNote = async () => {
    if (input.trim() === "") return;
    setAdding(true);
    try {
      const res = await axios.post(API_URL, { content: input });
      setNotes([res.data, ...notes]);
      setInput("");
      setCurrentPage(0);
    } catch (err) {
      console.error("Error adding note:", err);
    } finally {
      setAdding(false);
    }
  };

  const deleteNote = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      const updated = notes.filter((n) => n._id !== id);
      setNotes(updated);
      setCurrentPage(Math.min(currentPage, Math.max(updated.length - 1, 0)));
    } catch (err) {
      console.error("Error deleting note:", err);
    }
  };

  const prevPage = () => setCurrentPage((p) => Math.max(p - 1, 0));
  const nextPage = () => setCurrentPage((p) => Math.min(p + 1, notes.length - 1));

  const currentNote = notes[currentPage];

  // Format date if available
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    });
  };

  return (
    <Box className="min-h-screen bg-amber-50 flex items-start justify-center p-6">
      <Box sx={{ width: "100%", maxWidth: 680 }}>

        {/* ── Page Title ── */}
        <Box className="flex items-center gap-2 mb-5">
          <MenuBookIcon sx={{ color: "#b45309", fontSize: 26 }} />
          <Typography variant="h5" sx={{ fontWeight: 800, color: "#78350f", fontFamily: "'Courier New', monospace" }}>
            My Notebook
          </Typography>
          <Chip
            label={`${notes.length} note${notes.length !== 1 ? "s" : ""}`}
            size="small"
            sx={{ backgroundColor: "#fde68a", color: "#92400e", fontWeight: 700, fontSize: "0.72rem", height: 22, ml: 1 }}
          />
        </Box>

        {/* ── Write Area ── */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: "1px solid #fcd34d",
            overflow: "hidden",
            mb: 4,
            backgroundColor: "#fffbeb",
          }}
        >
          {/* Ruled textarea */}
          <Box
            sx={{
              backgroundImage: "repeating-linear-gradient(transparent 0px, transparent 29px, #fde68a 30px)",
              backgroundSize: "100% 30px",
              p: "16px 20px",
            }}
          >
            <TextField
              multiline
              minRows={6}
              fullWidth
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Write your note here..."
              variant="standard"
              InputProps={{ disableUnderline: true }}
              sx={{
                "& textarea": {
                  fontFamily: "'Courier New', monospace",
                  fontSize: "0.95rem",
                  lineHeight: "30px",
                  color: "#1c1917",
                  "&::placeholder": { color: "#a8a29e" },
                },
              }}
            />
          </Box>

          <Divider sx={{ borderColor: "#fcd34d" }} />

          <Box className="flex items-center justify-between px-4 py-2 bg-amber-50">
            <Typography variant="caption" sx={{ color: "#a8a29e", fontFamily: "monospace" }}>
              {input.length} characters
            </Typography>
            <Button
              onClick={addNote}
              disabled={adding || input.trim() === ""}
              startIcon={<AddIcon />}
              size="small"
              variant="contained"
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 700,
                fontSize: "0.82rem",
                backgroundColor: "#f59e0b",
                color: "#fff",
                "&:hover": { backgroundColor: "#d97706" },
                "&:disabled": { backgroundColor: "#fde68a", color: "#d97706" },
                transition: "background-color 0.2s ease",
              }}
            >
              {adding ? "Adding..." : "Add Note"}
            </Button>
          </Box>
        </Paper>

        {/* ── Book / Page Viewer ── */}
        {notes.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3, border: "1px dashed #fcd34d",
              p: 5, textAlign: "center", backgroundColor: "#fffbeb", mb: 4,
            }}
          >
            <NoteAltOutlinedIcon sx={{ fontSize: 40, color: "#fcd34d", mb: 1 }} />
            <Typography variant="body2" sx={{ color: "#a8a29e", fontFamily: "monospace" }}>
              No notes yet. Write your first one above!
            </Typography>
          </Paper>
        ) : (
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px solid #fcd34d",
              overflow: "hidden",
              mb: 4,
              backgroundColor: "#fffbeb",
              position: "relative",
            }}
          >
            {/* Book spine decoration */}
            <Box
              sx={{
                position: "absolute", left: 0, top: 0, bottom: 0,
                width: 8, backgroundColor: "#f59e0b", borderRadius: "12px 0 0 12px",
              }}
            />

            <Box sx={{ pl: "24px", pr: 3, pt: 3, pb: 2 }}>
              {/* Page header */}
              <Box className="flex items-center justify-between mb-3">
                <Chip
                  label={`Page ${currentPage + 1} of ${notes.length}`}
                  size="small"
                  sx={{ backgroundColor: "#fde68a", color: "#92400e", fontWeight: 700, fontSize: "0.72rem", height: 22 }}
                />
                {currentNote?.createdAt && (
                  <Typography variant="caption" sx={{ color: "#a8a29e", fontFamily: "monospace" }}>
                    {formatDate(currentNote.createdAt)}
                  </Typography>
                )}
              </Box>

              {/* Content */}
              <Box
                sx={{
                  backgroundImage: "repeating-linear-gradient(transparent 0px, transparent 29px, #fde68a 30px)",
                  backgroundSize: "100% 30px",
                  minHeight: 150, py: 1,
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "'Courier New', monospace",
                    fontSize: "0.95rem",
                    lineHeight: "30px",
                    color: "#1c1917",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {currentNote?.content}
                </Typography>
              </Box>
            </Box>

            {/* Page nav */}
            <Divider sx={{ borderColor: "#fde68a" }} />
            <Box className="flex items-center justify-between px-4 py-2 bg-amber-50">
              <Tooltip title="Previous page" arrow TransitionComponent={Fade}>
                <span>
                  <IconButton
                    size="small" onClick={prevPage} disabled={currentPage === 0}
                    sx={{
                      backgroundColor: currentPage === 0 ? "transparent" : "#fef3c7",
                      "&:hover": { backgroundColor: "#fde68a" },
                      "&:disabled": { opacity: 0.3 },
                    }}
                  >
                    <ArrowBackIosNewIcon sx={{ fontSize: 14, color: "#b45309" }} />
                  </IconButton>
                </span>
              </Tooltip>

              {/* Page dots */}
              <Box className="flex gap-1">
                {notes.slice(0, Math.min(notes.length, 7)).map((_, i) => (
                  <Box
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    sx={{
                      width: i === currentPage ? 18 : 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: i === currentPage ? "#f59e0b" : "#fde68a",
                      cursor: "pointer",
                      transition: "all 0.25s ease",
                    }}
                  />
                ))}
              </Box>

              <Tooltip title="Next page" arrow TransitionComponent={Fade}>
                <span>
                  <IconButton
                    size="small" onClick={nextPage} disabled={currentPage === notes.length - 1}
                    sx={{
                      backgroundColor: currentPage === notes.length - 1 ? "transparent" : "#fef3c7",
                      "&:hover": { backgroundColor: "#fde68a" },
                      "&:disabled": { opacity: 0.3 },
                    }}
                  >
                    <ArrowForwardIosIcon sx={{ fontSize: 14, color: "#b45309" }} />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          </Paper>
        )}

        {/* ── All Notes List ── */}
        {notes.length > 0 && (
          <Paper
            elevation={0}
            sx={{ borderRadius: 3, border: "1px solid #fcd34d", overflow: "hidden", backgroundColor: "#fffbeb" }}
          >
            <Box className="px-4 py-3 flex items-center justify-between" sx={{ borderBottom: "1px solid #fde68a", backgroundColor: "#fef9c3" }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#78350f", fontFamily: "monospace" }}>
                All Notes
              </Typography>
              <Chip
                label={notes.length}
                size="small"
                sx={{ backgroundColor: "#f59e0b", color: "#fff", fontWeight: 700, fontSize: "0.72rem", height: 20 }}
              />
            </Box>

            <Box>
              {notes.map((note, idx) => (
                <Box
                  key={note._id}
                  onClick={() => setCurrentPage(idx)}
                  sx={{
                    display: "flex", alignItems: "center", gap: 2,
                    px: 3, py: 1.5,
                    borderBottom: idx !== notes.length - 1 ? "1px solid #fef3c7" : "none",
                    backgroundColor: idx === currentPage ? "#fef3c7" : "transparent",
                    cursor: "pointer",
                    transition: "background-color 0.15s ease",
                    "&:hover": { backgroundColor: "#fef9c3" },
                  }}
                >
                  <Avatar
                    sx={{ width: 26, height: 26, fontSize: "0.7rem", fontWeight: 700, backgroundColor: "#f59e0b", color: "#fff" }}
                  >
                    {idx + 1}
                  </Avatar>

                  <Typography
                    variant="body2"
                    sx={{
                      flex: 1, fontFamily: "monospace", fontSize: "0.82rem",
                      color: idx === currentPage ? "#78350f" : "#57534e",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}
                  >
                    {note.content.substring(0, 60)}{note.content.length > 60 ? "…" : ""}
                  </Typography>

                  <Tooltip title="Delete note" arrow TransitionComponent={Fade}>
                    <IconButton
                      size="small"
                      onClick={(e) => { e.stopPropagation(); deleteNote(note._id); }}
                      sx={{
                        color: "#ef4444",
                        "&:hover": { backgroundColor: "#fee2e2" },
                        transition: "background-color 0.2s",
                      }}
                    >
                      <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              ))}
            </Box>
          </Paper>
        )}
      </Box>
    </Box>
  );
}