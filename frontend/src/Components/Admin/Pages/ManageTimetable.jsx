import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  MenuItem,
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
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import EventNoteRoundedIcon from "@mui/icons-material/EventNoteRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";

const API = "http://localhost:5000/api";
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const EMPTY_FORM = {
  courseId: "",
  branch: "",
  period: "1",
  dayOfWeek: "Monday",
  startTime: "09:00",
  endTime: "10:00",
  slotType: "class",
  title: "",
  subject: "",
  mentorId: "",
  room: "",
};

const authConfig = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

const courseIdOf = (assignment) => String(assignment.courseId?._id || assignment.courseId || "");

const compareEntries = (first, second) =>
  DAYS.indexOf(first.dayOfWeek) - DAYS.indexOf(second.dayOfWeek) ||
  first.startTime.localeCompare(second.startTime);

export default function ManageTimetable() {
  const [programs, setPrograms] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [periodFilter, setPeriodFilter] = useState("");

  const selectedProgram = programs.find((program) => program._id === form.courseId);
  const selectedBranch = selectedProgram?.branches.find(
    (branch) => branch.name === form.branch
  );
  const periodLabel = selectedProgram?.studyMode === "semester" ? "Semester" : "Year";
  const periodCount = selectedProgram?.periodCount || (periodLabel === "Semester" ? 8 : 4);
  const availableSubjects = selectedBranch?.subjects || [];

  const eligibleMentors = useMemo(() => {
    if (!form.courseId || !form.branch || !form.subject) return [];
    return mentors.filter(
      (mentor) =>
        mentor.active !== false &&
        (mentor.subjectAssignments || []).some((assignment) => {
          const matchesGroup =
            courseIdOf(assignment) === form.courseId &&
            String(assignment.branch || "").toLowerCase() === form.branch.toLowerCase();
          const matchesPeriod =
            assignment.period == null || Number(assignment.period) === Number(form.period);
          const teachesSubject = (assignment.subjects || []).some(
            (subject) => subject.toLowerCase() === form.subject.toLowerCase()
          );
          return matchesGroup && matchesPeriod && teachesSubject;
        })
    );
  }, [mentors, form.courseId, form.branch, form.subject, form.period]);

  const filteredEntries = useMemo(
    () =>
      entries
        .filter((entry) => !courseFilter || entry.courseId?._id === courseFilter)
        .filter((entry) => !branchFilter || entry.branch === branchFilter)
        .filter((entry) => !periodFilter || Number(entry.period) === Number(periodFilter))
        .sort(compareEntries),
    [entries, courseFilter, branchFilter, periodFilter]
  );

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [programResponse, mentorResponse, timetableResponse] = await Promise.all([
        axios.get(`${API}/academics`, authConfig()),
        axios.get(`${API}/mentors`, authConfig()),
        axios.get(`${API}/timetable`, authConfig()),
      ]);
      setPrograms(programResponse.data);
      setMentors(mentorResponse.data);
      setEntries(timetableResponse.data);
      setForm((current) => ({
        ...current,
        courseId: current.courseId || programResponse.data[0]?._id || "",
      }));
    } catch (requestError) {
      console.error("Failed to load timetable manager data:", requestError);
      setError(requestError.response?.data?.message || "Timetable data could not be loaded.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateForm = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
      ...(field === "courseId"
        ? { branch: "", period: "1", subject: "", mentorId: "" }
        : {}),
      ...(field === "branch" ? { subject: "", mentorId: "" } : {}),
      ...(field === "period" || field === "subject" ? { mentorId: "" } : {}),
    }));
    setError("");
    setSuccess("");
  };

  const resetForm = () => {
    setForm({ ...EMPTY_FORM, courseId: programs[0]?._id || "" });
    setEditingId("");
    setError("");
    setSuccess("");
  };

  const saveEntry = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const payload = {
        ...form,
        period: Number(form.period),
        title: form.slotType === "class" ? "" : form.title.trim(),
        subject: form.slotType === "class" ? form.subject : "",
        mentorId: form.slotType === "class" ? form.mentorId : "",
        room: form.room.trim(),
      };
      const response = editingId
        ? await axios.put(`${API}/timetable/${editingId}`, payload, authConfig())
        : await axios.post(`${API}/timetable`, payload, authConfig());

      setEntries((current) =>
        [...current.filter((entry) => entry._id !== response.data._id), response.data].sort(compareEntries)
      );
      setSuccess(editingId ? "Timetable entry updated." : "Timetable entry added.");
      resetForm();
    } catch (requestError) {
      console.error("Failed to save timetable entry:", requestError);
      setError(requestError.response?.data?.message || "Timetable entry could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  const editEntry = (entry) => {
    setEditingId(entry._id);
    setForm({
      courseId: entry.courseId?._id || "",
      branch: entry.branch,
      period: String(entry.period),
      dayOfWeek: entry.dayOfWeek,
      startTime: entry.startTime,
      endTime: entry.endTime,
      slotType: entry.slotType,
      title: entry.title || "",
      subject: entry.subject || "",
      mentorId: entry.mentorId?._id || "",
      room: entry.room || "",
    });
    setError("");
    setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteEntry = async (entry) => {
    if (!window.confirm("Delete this timetable entry?")) return;
    setError("");
    setSuccess("");
    try {
      await axios.delete(`${API}/timetable/${entry._id}`, authConfig());
      setEntries((current) => current.filter((item) => item._id !== entry._id));
      if (editingId === entry._id) resetForm();
      setSuccess("Timetable entry deleted.");
    } catch (requestError) {
      console.error("Failed to delete timetable entry:", requestError);
      setError(requestError.response?.data?.message || "Timetable entry could not be deleted.");
    }
  };

  const filterProgram = programs.find((program) => program._id === courseFilter);
  const filterPeriods = filterProgram
    ? Array.from({ length: filterProgram.periodCount || 4 }, (_, index) => index + 1)
    : [];
  const filterBranches = filterProgram?.branches || [];

  return (
    <Box sx={{ maxWidth: 1500, mx: "auto" }}>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
        <EventNoteRoundedIcon color="primary" />
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Manage Timetable</Typography>
      </Stack>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Create weekly class slots and add break or lunch times for each course, branch, and year/semester.
        Overlapping class, mentor, or room bookings are blocked.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Card elevation={0} sx={{ border: "1px solid #e2e8f0", mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            {editingId ? "Edit timetable entry" : "Add timetable entry"}
          </Typography>
          <Box component="form" onSubmit={saveEntry}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  select fullWidth required label="Course"
                  value={form.courseId}
                  onChange={(event) => updateForm("courseId", event.target.value)}
                >
                  {programs.map((program) => (
                    <MenuItem key={program._id} value={program._id}>{program.name}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  select fullWidth required label="Branch"
                  value={form.branch}
                  disabled={!selectedProgram}
                  onChange={(event) => updateForm("branch", event.target.value)}
                >
                  {selectedProgram?.branches.map((branch) => (
                    <MenuItem key={branch.name} value={branch.name}>{branch.name}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  select fullWidth required label={periodLabel}
                  value={form.period}
                  disabled={!selectedProgram}
                  onChange={(event) => updateForm("period", event.target.value)}
                >
                  {Array.from({ length: periodCount }, (_, index) => (
                    <MenuItem key={index + 1} value={String(index + 1)}>
                      {periodLabel} {index + 1}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  select fullWidth required label="Day"
                  value={form.dayOfWeek}
                  onChange={(event) => updateForm("dayOfWeek", event.target.value)}
                >
                  {DAYS.map((day) => <MenuItem key={day} value={day}>{day}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  select fullWidth required label="Schedule type"
                  value={form.slotType}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      slotType: event.target.value,
                      subject: "",
                      mentorId: "",
                      title: event.target.value === "lunch" ? "Lunch" : "",
                    }))
                  }
                >
                  <MenuItem value="class">Class</MenuItem>
                  <MenuItem value="break">Break</MenuItem>
                  <MenuItem value="lunch">Lunch</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth required label="Start time" type="time"
                  value={form.startTime}
                  onChange={(event) => updateForm("startTime", event.target.value)}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ step: 300 }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth required label="End time" type="time"
                  value={form.endTime}
                  onChange={(event) => updateForm("endTime", event.target.value)}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ step: 300 }}
                />
              </Grid>
              {form.slotType === "class" ? (
                <>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      select fullWidth required label="Subject"
                      value={form.subject}
                      disabled={!selectedBranch}
                      onChange={(event) => updateForm("subject", event.target.value)}
                    >
                      {availableSubjects.map((subject) => (
                        <MenuItem key={subject} value={subject}>{subject}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      select fullWidth required label="Assigned mentor"
                      value={form.mentorId}
                      disabled={!form.subject || eligibleMentors.length === 0}
                      onChange={(event) => updateForm("mentorId", event.target.value)}
                    >
                      {eligibleMentors.map((mentor) => (
                        <MenuItem key={mentor._id} value={mentor._id}>
                          {mentor.firstName} {mentor.lastName} ({mentor.mentorId})
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth label="Room / classroom (optional)"
                      value={form.room}
                      onChange={(event) => updateForm("room", event.target.value)}
                    />
                  </Grid>
                  {form.subject && eligibleMentors.length === 0 && (
                    <Grid item xs={12}>
                      <Alert severity="warning">
                        No active mentor is assigned to this subject for the selected branch and period.
                        Assign the subject to a mentor in Courses &amp; Subjects first.
                      </Alert>
                    </Grid>
                  )}
                </>
              ) : (
                <Grid item xs={12} sm={6} md={6}>
                  <TextField
                    fullWidth required label="Break / lunch label"
                    value={form.title}
                    onChange={(event) => updateForm("title", event.target.value)}
                    placeholder={form.slotType === "lunch" ? "Lunch" : "Tea break"}
                  />
                </Grid>
              )}
              <Grid item xs={12}>
                <Stack direction="row" spacing={1}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={editingId ? <SaveRoundedIcon /> : <AddRoundedIcon />}
                    disabled={saving || !programs.length}
                  >
                    {saving ? "Saving..." : editingId ? "Save changes" : "Add to timetable"}
                  </Button>
                  {editingId && <Button onClick={resetForm} disabled={saving}>Cancel edit</Button>}
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>

      <Card elevation={0} sx={{ border: "1px solid #e2e8f0" }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Weekly schedule</Typography>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={4}>
              <TextField
                select fullWidth size="small" label="Filter course"
                value={courseFilter}
                onChange={(event) => {
                  setCourseFilter(event.target.value);
                  setBranchFilter("");
                  setPeriodFilter("");
                }}
              >
                <MenuItem value="">All courses</MenuItem>
                {programs.map((program) => (
                  <MenuItem key={program._id} value={program._id}>{program.name}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                select fullWidth size="small" label="Filter branch"
                value={branchFilter}
                disabled={!courseFilter}
                onChange={(event) => setBranchFilter(event.target.value)}
              >
                <MenuItem value="">All branches</MenuItem>
                {filterBranches.map((branch) => (
                  <MenuItem key={branch.name} value={branch.name}>{branch.name}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                select fullWidth size="small" label="Filter year / semester"
                value={periodFilter}
                disabled={!courseFilter}
                onChange={(event) => setPeriodFilter(event.target.value)}
              >
                <MenuItem value="">All periods</MenuItem>
                {filterPeriods.map((period) => (
                  <MenuItem key={period} value={String(period)}>
                    {(filterProgram?.studyMode === "semester" ? "Semester" : "Year")} {period}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
          {loading ? (
            <Typography color="text.secondary">Loading timetable...</Typography>
          ) : filteredEntries.length === 0 ? (
            <Alert severity="info">No timetable entries match these filters.</Alert>
          ) : (
            <TableContainer sx={{ overflowX: "auto" }}>
              <Table size="small" sx={{ minWidth: 850 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f8fafc" }}>
                    <TableCell sx={{ fontWeight: 700 }}>Day &amp; time</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Course / class</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Schedule</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Subject / mentor</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredEntries.map((entry) => {
                    const isClass = entry.slotType === "class";
                    const periodName =
                      entry.courseId?.studyMode === "semester" ? "Semester" : "Year";
                    const mentorName = entry.mentorId
                      ? `${entry.mentorId.firstName} ${entry.mentorId.lastName}`
                      : "—";
                    return (
                      <TableRow key={entry._id} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>{entry.dayOfWeek}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {entry.startTime} – {entry.endTime}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {entry.courseId?.name} · {entry.branch}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {periodName} {entry.period}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            color={isClass ? "primary" : "warning"}
                            label={isClass ? "Class" : entry.title || entry.slotType}
                          />
                        </TableCell>
                        <TableCell>
                          {isClass ? (
                            <>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>{entry.subject}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {mentorName}{entry.room ? ` · ${entry.room}` : ""}
                              </Typography>
                            </>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              {entry.room || "—"}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => editEntry(entry)}>
                              <EditRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" color="error" onClick={() => deleteEntry(entry)}>
                              <DeleteRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
