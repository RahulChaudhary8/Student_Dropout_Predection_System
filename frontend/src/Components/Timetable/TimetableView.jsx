import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import EventNoteRoundedIcon from "@mui/icons-material/EventNoteRounded";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const getPeriodLabel = (entry) => {
  const course = entry.courseId;
  const periodName = course?.studyMode === "semester" ? "Semester" : "Year";
  return `${periodName} ${entry.period}`;
};

export default function TimetableView({ title }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/timetable/my", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setEntries(response.data);
      } catch (requestError) {
        console.error("Failed to load timetable:", requestError);
        setError(requestError.response?.data?.message || "Timetable could not be loaded.");
      } finally {
        setLoading(false);
      }
    };

    fetchTimetable();
  }, []);

  const entriesByDay = useMemo(
    () =>
      Object.fromEntries(
        DAYS.map((day) => [
          day,
          entries
            .filter((entry) => entry.dayOfWeek === day)
            .sort((first, second) => first.startTime.localeCompare(second.startTime)),
        ])
      ),
    [entries]
  );

  return (
    <Box sx={{ maxWidth: 1500, mx: "auto" }}>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
        <EventNoteRoundedIcon color="primary" />
        <Typography variant="h5" sx={{ fontWeight: 700 }}>{title}</Typography>
      </Stack>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Weekly classes, subjects, mentors, rooms, breaks, and lunch times.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading ? (
        <Box className="flex justify-center py-10"><CircularProgress /></Box>
      ) : entries.length === 0 ? (
        <Alert severity="info">
          No timetable has been published for your course or assignments yet. Please contact the admin.
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {DAYS.map((day) => (
            <Grid item xs={12} md={6} xl={4} key={day}>
              <Card elevation={0} sx={{ height: "100%", border: "1px solid #e2e8f0" }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>{day}</Typography>
                  {entriesByDay[day].length === 0 ? (
                    <Typography variant="body2" color="text.secondary">No scheduled classes</Typography>
                  ) : (
                    <Stack spacing={1.25}>
                      {entriesByDay[day].map((entry) => {
                        const courseName = entry.courseId?.name || "Course";
                        const mentorName = entry.mentorId
                          ? `${entry.mentorId.firstName} ${entry.mentorId.lastName}`
                          : "";
                        const isClass = entry.slotType === "class";
                        const eventLabel =
                          entry.slotType === "lunch"
                            ? entry.title || "Lunch"
                            : entry.slotType === "break"
                              ? entry.title || "Break"
                              : "Class";

                        return (
                          <Box
                            key={entry._id}
                            sx={{
                              p: 1.5,
                              borderRadius: 2,
                              border: "1px solid",
                              borderColor: isClass ? "#dbeafe" : "#fde68a",
                              bgcolor: isClass ? "#f8fbff" : "#fffbeb",
                            }}
                          >
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="center"
                              spacing={1}
                              sx={{ mb: 0.75 }}
                            >
                              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                {entry.startTime} – {entry.endTime}
                              </Typography>
                              <Chip
                                size="small"
                                color={isClass ? "primary" : "warning"}
                                label={eventLabel}
                              />
                            </Stack>
                            {isClass ? (
                              <>
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                  {entry.subject}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {courseName} · {entry.branch} · {getPeriodLabel(entry)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Mentor: {mentorName || "Not assigned"}
                                  {entry.room ? ` · Room: ${entry.room}` : ""}
                                </Typography>
                              </>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                {courseName} · {entry.branch} · {getPeriodLabel(entry)}
                              </Typography>
                            )}
                          </Box>
                        );
                      })}
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
