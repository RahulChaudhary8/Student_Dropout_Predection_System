import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import PrintRoundedIcon from "@mui/icons-material/PrintRounded";
import PublishRoundedIcon from "@mui/icons-material/PublishRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import * as XLSX from "xlsx";

const API = "http://localhost:5000/api";
const ASSESSMENT_TYPES = [
  "Unit Test",
  "Internal Test",
  "Assignment",
  "Practical",
  "Mid Semester",
  "End Semester",
];

const request = async (path, options = {}) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
};

function StudentResults() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    request("/results/mine")
      .then(setData)
      .catch((loadError) => setError(loadError.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!data) return null;

  const { student, semesters, finalResult } = data;
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>My Academic Results</Typography>
          <Typography color="text.secondary">
            {student.fullName} · Roll No. {student.rollNumber || student.studentId} · Registration {student.registrationNumber || student._id}
          </Typography>
        </Box>
        <Button startIcon={<PrintRoundedIcon />} variant="outlined" onClick={() => window.print()} disabled={!semesters.length}>
          Print / Save PDF
        </Button>
      </Stack>
      {!semesters.length ? (
        <Alert severity="info">Your semester results will appear here after they are published.</Alert>
      ) : (
        <>
          {finalResult && (
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>Academic Summary</Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={4}>
                  <Typography>CGPA: <strong>{finalResult.cgpa.toFixed(2)} / 10</strong></Typography>
                  <Typography>Overall: <strong>{finalResult.overallPercentage.toFixed(2)}%</strong></Typography>
                  <Typography>Final Grade: <strong>{finalResult.grade}</strong></Typography>
                  <Chip label={finalResult.status} color={finalResult.status === "Pass" ? "success" : "error"} />
                </Stack>
                <Typography color="text.secondary" sx={{ mt: 2 }}>
                  Academic remarks: {finalResult.academicRemarks}
                </Typography>
              </CardContent>
            </Card>
          )}
          {semesters.map((semester) => (
            <Card variant="outlined" key={semester.period} sx={{ mb: 3, breakInside: "avoid" }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Box>
                    <Typography variant="h6" fontWeight={700}>
                      {semester.studyMode === "semester" ? "Semester" : "Year"} {semester.period} Result
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Published {new Date(semester.publishedAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Chip label={`${semester.grade} · ${semester.status}`} color={semester.status === "Pass" ? "success" : "error"} />
                </Stack>
                <Stack direction="row" spacing={4} sx={{ mb: 2 }}>
                  <Typography>Total: <strong>{semester.totalMarks} / {semester.maximumMarks}</strong></Typography>
                  <Typography>Percentage: <strong>{semester.percentage}%</strong></Typography>
                  <Typography>GPA: <strong>{semester.gpa.toFixed(2)} / 10</strong></Typography>
                  <Typography>Rank: <strong>{semester.rank}</strong></Typography>
                </Stack>
                <TableContainer>
                  <Table size="small">
                    <TableHead><TableRow>
                      <TableCell>Subject</TableCell><TableCell>Assessments</TableCell>
                      <TableCell align="right">Marks</TableCell><TableCell align="right">Percent</TableCell>
                      <TableCell>Grade</TableCell><TableCell>Status</TableCell>
                    </TableRow></TableHead>
                    <TableBody>
                      {semester.subjects.map((subject) => (
                        <TableRow key={subject.subject}>
                          <TableCell>{subject.subject}</TableCell>
                          <TableCell>
                            <Stack>
                              {subject.assessments.map((assessment) => (
                                <Typography variant="caption" key={`${assessment.title}-${assessment.type}`}>
                                  {assessment.title}: {assessment.obtained ?? "—"} / {assessment.maximum}
                                </Typography>
                              ))}
                            </Stack>
                          </TableCell>
                          <TableCell align="right">{subject.obtained} / {subject.maximum}</TableCell>
                          <TableCell align="right">{subject.percentage}%</TableCell>
                          <TableCell>{subject.grade}</TableCell>
                          <TableCell>{subject.status}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          ))}
          <style>{`@media print { body * { visibility: hidden; } #root, #root * { visibility: visible; } #root { position: absolute; inset: 0; } button { display: none !important; } }`}</style>
        </>
      )}
    </Box>
  );
}

export default function ResultManagement() {
  const role = localStorage.getItem("role");
  const [tab, setTab] = useState(0);
  const [programs, setPrograms] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [branchName, setBranchName] = useState("");
  const [period, setPeriod] = useState("");
  const [cohort, setCohort] = useState({ students: [], assessments: [], results: [], published: false });
  const [selectedAssessmentId, setSelectedAssessmentId] = useState("");
  const [marks, setMarks] = useState({});
  const [testResults, setTestResults] = useState([]);
  const [assessmentDraft, setAssessmentDraft] = useState({
    title: "",
    subject: "",
    type: "Unit Test",
    date: new Date().toISOString().slice(0, 10),
    maxMarks: "100",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [auditLogs, setAuditLogs] = useState(null);

  const selectedProgram = programs.find((program) => program._id === courseId);
  const selectedBranch = selectedProgram?.branches?.find((branch) => branch.name === branchName);
  const periodLabel = selectedProgram?.studyMode === "semester" ? "Semester" : "Academic Year";
  const periodCount = Number(selectedProgram?.periodCount || 0);
  const selectedAssessment = cohort.assessments.find((item) => item._id === selectedAssessmentId);

  useEffect(() => {
    if (role === "student") return;
    request("/results/options")
      .then((items) => {
        setPrograms(items);
        setCourseId(items[0]?._id || "");
      })
      .catch((loadError) => setError(loadError.message));
  }, [role]);

  useEffect(() => {
    if (!selectedProgram) {
      setBranchName("");
      return;
    }
    if (!selectedProgram.branches.some((branch) => branch.name === branchName)) {
      setBranchName(selectedProgram.branches[0]?.name || "");
    }
    if (!period || Number(period) > selectedProgram.periodCount) setPeriod("1");
  }, [selectedProgram, branchName, period]);

  useEffect(() => {
    const subjects = selectedBranch?.subjects || [];
    if (!subjects.includes(assessmentDraft.subject)) {
      setAssessmentDraft((current) => ({ ...current, subject: subjects[0] || "" }));
    }
  }, [selectedBranch, assessmentDraft.subject]);

  const loadCohort = useCallback(async () => {
    if (!courseId || !branchName || !period) return;
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ courseId, branch: branchName, period });
      setCohort(await request(`/results/cohort?${params}`));
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, [courseId, branchName, period]);

  useEffect(() => {
    loadCohort();
  }, [loadCohort]);

  useEffect(() => {
    if (!cohort.assessments.some((assessment) => assessment._id === selectedAssessmentId)) {
      setSelectedAssessmentId(cohort.assessments[0]?._id || "");
    }
  }, [cohort.assessments, selectedAssessmentId]);

  useEffect(() => {
    if (!selectedAssessment) {
      setMarks({});
      setTestResults([]);
      return;
    }
    setMarks(Object.fromEntries(selectedAssessment.marks.map((entry) => [entry.studentId, String(entry.marks)])));
    if (selectedAssessment.published) {
      request(`/results/assessments/${selectedAssessment._id}/results`)
        .then((response) => setTestResults(response.results))
        .catch((loadError) => setError(loadError.message));
    } else {
      setTestResults([]);
    }
  }, [selectedAssessment]);

  const resultChartData = useMemo(
    () => cohort.results.map((result) => ({
      name: result.fullName,
      Percentage: result.percentage,
    })),
    [cohort.results]
  );

  const createAssessment = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const assessment = await request("/results/assessments", {
        method: "POST",
        body: JSON.stringify({
          courseId,
          branch: branchName,
          period: Number(period),
          ...assessmentDraft,
          maxMarks: Number(assessmentDraft.maxMarks),
        }),
      });
      setAssessmentDraft((current) => ({ ...current, title: "" }));
      setNotice("Assessment created. Enter and save student marks before publishing.");
      await loadCohort();
      setSelectedAssessmentId(assessment._id);
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  const saveMarks = async () => {
    if (!selectedAssessment) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const entries = Object.entries(marks)
        .filter(([, value]) => value !== "")
        .map(([studentId, value]) => ({ studentId, marks: Number(value) }));
      await request(`/results/assessments/${selectedAssessment._id}/marks`, {
        method: "PUT",
        body: JSON.stringify({ marks: entries }),
      });
      setNotice("Marks saved. Results are recalculated automatically.");
      await loadCohort();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  const uploadMarks = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const workbook = XLSX.read(reader.result, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
        const nextMarks = {};
        const studentIdsByIdentifier = new Map(
          cohort.students.flatMap((student) => [
            [student.studentId, student.studentId],
            ...(student.rollNumber ? [[student.rollNumber, student.studentId]] : []),
          ])
        );
        for (const row of rows) {
          const normalized = Object.fromEntries(
            Object.entries(row).map(([key, value]) => [
              key.toLowerCase().replace(/[\s_-]/g, ""),
              value,
            ])
          );
          const id = String(normalized.studentid || normalized.rollnumber || normalized.id || "").trim();
          const value = normalized.marks ?? normalized.score;
          const studentId = studentIdsByIdentifier.get(id);
          if (studentId && value !== "") {
            nextMarks[studentId] = String(value);
          }
        }
        if (!Object.keys(nextMarks).length) {
          setError("No matching Student ID and Marks rows were found in this workbook.");
          return;
        }
        setMarks((current) => ({ ...current, ...nextMarks }));
        setNotice(`${Object.keys(nextMarks).length} marks loaded. Review them and click Save Marks.`);
        setError("");
      } catch (uploadError) {
        console.error("Could not read marks workbook:", uploadError);
        setError("Could not read this Excel workbook. Check that it is a valid .xlsx or .xls file.");
      }
    };
    reader.onerror = () => setError("Failed to read the selected marks workbook.");
    reader.readAsArrayBuffer(file);
  };

  const deleteAssessment = async (assessment) => {
    if (!window.confirm(`Delete assessment "${assessment.title}" and its marks?`)) return;
    setSaving(true);
    setError("");
    try {
      await request(`/results/assessments/${assessment._id}`, { method: "DELETE" });
      setNotice("Assessment and its marks were deleted.");
      if (selectedAssessmentId === assessment._id) setSelectedAssessmentId("");
      await loadCohort();
    } catch (deleteError) {
      setError(deleteError.message);
    } finally {
      setSaving(false);
    }
  };

  const publishAssessment = async () => {
    if (!selectedAssessment) return;
    setSaving(true);
    setError("");
    try {
      const response = await request(`/results/assessments/${selectedAssessment._id}/publish`, {
        method: "POST",
      });
      setTestResults(response.results);
      setNotice("Test result published. Marks are now locked.");
      await loadCohort();
    } catch (publishError) {
      setError(publishError.message);
    } finally {
      setSaving(false);
    }
  };

  const previewTestResult = async () => {
    if (!selectedAssessment) return;
    setSaving(true);
    setError("");
    try {
      const response = await request(`/results/assessments/${selectedAssessment._id}/results`);
      setTestResults(response.results);
    } catch (previewError) {
      setError(previewError.message);
    } finally {
      setSaving(false);
    }
  };

  const publishSemester = async () => {
    setSaving(true);
    setError("");
    try {
      await request("/results/semester/publish", {
        method: "POST",
        body: JSON.stringify({ courseId, branch: branchName, period: Number(period) }),
      });
      setNotice("Semester result published and all marks locked.");
      await loadCohort();
    } catch (publishError) {
      setError(publishError.message);
    } finally {
      setSaving(false);
    }
  };

  const unlockSemester = async () => {
    setSaving(true);
    setError("");
    try {
      await request("/results/semester/unlock", {
        method: "POST",
        body: JSON.stringify({ courseId, branch: branchName, period: Number(period) }),
      });
      setNotice("Semester result unlocked. Marks can be edited again.");
      await loadCohort();
    } catch (unlockError) {
      setError(unlockError.message);
    } finally {
      setSaving(false);
    }
  };

  const loadAudit = async () => {
    setError("");
    try {
      setAuditLogs(await request("/results/audit?limit=100"));
    } catch (auditError) {
      setError(auditError.message);
    }
  };

  const promoteStudent = async (studentId) => {
    setSaving(true);
    setError("");
    try {
      const response = await request(`/results/promote/${encodeURIComponent(studentId)}`, {
        method: "POST",
      });
      setNotice(response.message);
      await loadCohort();
    } catch (promoteError) {
      setError(promoteError.message);
    } finally {
      setSaving(false);
    }
  };

  if (role === "student") return <StudentResults />;

  return (
    <Box>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Academic Results</Typography>
          <Typography color="text.secondary">Assessments, marks, publication and promotion</Typography>
        </Box>
        {cohort.published && <Chip icon={<LockRoundedIcon />} color="success" label="Semester Published" />}
      </Stack>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
      {notice && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setNotice("")}>{notice}</Alert>}

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <FormControl size="small" fullWidth>
              <InputLabel id="result-course-label">Course</InputLabel>
              <Select labelId="result-course-label" value={courseId} label="Course" onChange={(event) => setCourseId(event.target.value)}>
                {programs.map((program) => <MenuItem key={program._id} value={program._id}>{program.name}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth disabled={!selectedProgram?.branches.length}>
              <InputLabel id="result-branch-label">Branch</InputLabel>
              <Select labelId="result-branch-label" value={branchName} label="Branch" onChange={(event) => setBranchName(event.target.value)}>
                {(selectedProgram?.branches || []).map((branch) => <MenuItem key={branch.name} value={branch.name}>{branch.name}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth disabled={!periodCount}>
              <InputLabel id="result-period-label">{periodLabel}</InputLabel>
              <Select labelId="result-period-label" value={period} label={periodLabel} onChange={(event) => setPeriod(event.target.value)}>
                {Array.from({ length: periodCount }, (_, index) => <MenuItem key={index + 1} value={String(index + 1)}>{periodLabel} {index + 1}</MenuItem>)}
              </Select>
            </FormControl>
          </Stack>
        </CardContent>
      </Card>

      <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ mb: 2 }}>
        <Tab label="Assessments & Marks" />
        <Tab label="Semester Result" />
      </Tabs>
      {loading && <LinearProgress />}
      {tab === 0 && (
        <Box>
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Create Assessment</Typography>
              {cohort.published && <Alert severity="warning" sx={{ mb: 2 }}>Published semester is locked. Ask an admin to unlock it before editing.</Alert>}
              <Box component="form" onSubmit={createAssessment} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <TextField size="small" label="Assessment title" value={assessmentDraft.title} onChange={(event) => setAssessmentDraft({ ...assessmentDraft, title: event.target.value })} required disabled={cohort.published} />
                <FormControl size="small" required disabled={cohort.published || !selectedBranch?.subjects.length}>
                  <InputLabel id="result-subject-label">Subject</InputLabel>
                  <Select labelId="result-subject-label" value={assessmentDraft.subject} label="Subject" onChange={(event) => setAssessmentDraft({ ...assessmentDraft, subject: event.target.value })}>
                    {(selectedBranch?.subjects || []).map((subject) => <MenuItem key={subject} value={subject}>{subject}</MenuItem>)}
                  </Select>
                </FormControl>
                <FormControl size="small" required disabled={cohort.published}>
                  <InputLabel id="assessment-type-label">Assessment type</InputLabel>
                  <Select labelId="assessment-type-label" value={assessmentDraft.type} label="Assessment type" onChange={(event) => setAssessmentDraft({ ...assessmentDraft, type: event.target.value })}>
                    {ASSESSMENT_TYPES.map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                  </Select>
                </FormControl>
                <TextField size="small" label="Date" type="date" value={assessmentDraft.date} onChange={(event) => setAssessmentDraft({ ...assessmentDraft, date: event.target.value })} InputLabelProps={{ shrink: true }} required disabled={cohort.published} />
                <TextField size="small" label="Maximum marks" type="number" value={assessmentDraft.maxMarks} onChange={(event) => setAssessmentDraft({ ...assessmentDraft, maxMarks: event.target.value })} inputProps={{ min: 1 }} required disabled={cohort.published} />
                <Button type="submit" variant="contained" startIcon={<AddRoundedIcon />} disabled={saving || cohort.published || !cohort.students.length}>Create Assessment</Button>
              </Box>
            </CardContent>
          </Card>

          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Assessments</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead><TableRow>
                    <TableCell>Assessment</TableCell><TableCell>Subject</TableCell><TableCell>Type</TableCell>
                    <TableCell>Date</TableCell><TableCell align="right">Max</TableCell><TableCell>Status</TableCell><TableCell>Actions</TableCell>
                  </TableRow></TableHead>
                  <TableBody>
                    {cohort.assessments.map((assessment) => (
                      <TableRow key={assessment._id} selected={assessment._id === selectedAssessmentId}>
                        <TableCell>{assessment.title}</TableCell>
                        <TableCell>{assessment.subject}</TableCell>
                        <TableCell>{assessment.type}</TableCell>
                        <TableCell>{new Date(assessment.date).toLocaleDateString()}</TableCell>
                        <TableCell align="right">{assessment.maxMarks}</TableCell>
                        <TableCell><Chip size="small" label={assessment.published ? "Published" : "Draft"} color={assessment.published ? "success" : "default"} /></TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <Button size="small" onClick={() => setSelectedAssessmentId(assessment._id)}>Enter Marks</Button>
                            {!assessment.published && !cohort.published && (
                              <Button size="small" color="error" onClick={() => deleteAssessment(assessment)} aria-label={`Delete ${assessment.title}`}>
                                <DeleteOutlineRoundedIcon fontSize="small" />
                              </Button>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                    {!cohort.assessments.length && <TableRow><TableCell colSpan={7} align="center">No assessments created for this class period.</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {selectedAssessment && (
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} sx={{ mb: 2 }}>
                  <Box><Typography variant="h6" fontWeight={700}>{selectedAssessment.title} · {selectedAssessment.subject}</Typography><Typography variant="body2" color="text.secondary">Marks out of {selectedAssessment.maxMarks}</Typography></Box>
                  <Stack direction="row" spacing={1}>
                    <Button component="label" variant="outlined" disabled={saving || selectedAssessment.published || cohort.published}>
                      Upload Excel
                      <input hidden type="file" accept=".xlsx,.xls" onChange={uploadMarks} />
                    </Button>
                    <Button startIcon={<SaveRoundedIcon />} onClick={saveMarks} variant="outlined" disabled={saving || selectedAssessment.published || cohort.published}>Save Marks</Button>
                    <Button startIcon={<AssessmentRoundedIcon />} onClick={previewTestResult} variant="outlined" disabled={saving}>Preview Result</Button>
                    <Button startIcon={<PublishRoundedIcon />} onClick={publishAssessment} variant="contained" disabled={saving || selectedAssessment.published || cohort.published}>Publish Test Result</Button>
                  </Stack>
                </Stack>
                <TableContainer>
                  <Table size="small">
                    <TableHead><TableRow><TableCell>Roll No.</TableCell><TableCell>Student</TableCell><TableCell>Marks / {selectedAssessment.maxMarks}</TableCell></TableRow></TableHead>
                    <TableBody>{cohort.students.map((student) => (
                      <TableRow key={student.studentId}>
                        <TableCell>{student.rollNumber || student.studentId}</TableCell>
                        <TableCell>{student.fullName}</TableCell>
                        <TableCell>
                          <TextField size="small" type="number" value={marks[student.studentId] ?? ""} onChange={(event) => setMarks((current) => ({ ...current, [student.studentId]: event.target.value }))} inputProps={{ min: 0, max: selectedAssessment.maxMarks, step: 0.5 }} disabled={selectedAssessment.published || cohort.published} />
                        </TableCell>
                      </TableRow>
                    ))}</TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}

          {testResults.length > 0 && (
            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Stack direction="row" alignItems="center" spacing={1}><AssessmentRoundedIcon color="primary" /><Typography variant="h6" fontWeight={700}>{selectedAssessment?.published ? "Published Test Result" : "Test Result Preview"}</Typography></Stack>
                  <Button startIcon={<PrintRoundedIcon />} onClick={() => window.print()}>Print / Save PDF</Button>
                </Stack>
                <TableContainer><Table size="small"><TableHead><TableRow><TableCell>Rank</TableCell><TableCell>Student</TableCell><TableCell>Marks</TableCell><TableCell>Percentage</TableCell><TableCell>Grade</TableCell><TableCell>Status</TableCell></TableRow></TableHead>
                  <TableBody>{testResults.map((result) => <TableRow key={result.studentId}><TableCell>{result.rank}</TableCell><TableCell>{result.fullName}</TableCell><TableCell>{result.totalMarks} / {result.maxMarks}</TableCell><TableCell>{result.percentage}%</TableCell><TableCell>{result.grade}</TableCell><TableCell>{result.status}</TableCell></TableRow>)}</TableBody>
                </Table></TableContainer>
              </CardContent>
            </Card>
          )}
        </Box>
      )}

      {tab === 1 && (
        <Box>
          {role === "admin" && (
            <Button sx={{ mb: 2 }} variant="outlined" onClick={loadAudit}>
              {auditLogs ? "Refresh Audit Log" : "View Audit Log"}
            </Button>
          )}
          {cohort.published && <Alert severity="success" sx={{ mb: 2 }}>Published on {new Date(cohort.publishedAt).toLocaleString()}. Marks are locked.</Alert>}
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <Button variant="contained" startIcon={<PublishRoundedIcon />} onClick={publishSemester} disabled={saving || cohort.published || !cohort.assessments.length}>Generate & Publish Semester Result</Button>
            {role === "admin" && cohort.published && <Button color="warning" variant="outlined" startIcon={<LockRoundedIcon />} onClick={unlockSemester} disabled={saving}>Unlock Result</Button>}
          </Stack>
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Class Performance</Typography>
              <Box sx={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={resultChartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis domain={[0, 100]} /><Tooltip /><Bar dataKey="Percentage" fill="#2563eb" radius={[4, 4, 0, 0]} /></BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
          <Card variant="outlined">
            <CardContent>
              <TableContainer><Table size="small">
                <TableHead><TableRow><TableCell>Rank</TableCell><TableCell>Roll No.</TableCell><TableCell>Student</TableCell><TableCell align="right">Total</TableCell><TableCell align="right">Percent</TableCell><TableCell align="right">GPA</TableCell><TableCell>Grade</TableCell><TableCell>Status</TableCell><TableCell>Promotion</TableCell></TableRow></TableHead>
                <TableBody>{cohort.results.map((result) => {
                  const currentStudent = cohort.students.find(
                    (student) => student.studentId === result.studentId
                  );
                  const canPromote =
                    selectedProgram?.studyMode === "semester" &&
                    cohort.published &&
                    result.status === "Pass" &&
                    Number(currentStudent?.semester) === Number(period) &&
                    Number(period) < periodCount;
                  return (
                    <TableRow key={result.studentId}>
                      <TableCell>{result.rank}</TableCell><TableCell>{result.rollNumber}</TableCell><TableCell>{result.fullName}</TableCell>
                      <TableCell align="right">{result.totalMarks} / {result.maximumMarks}</TableCell><TableCell align="right">{result.percentage}%</TableCell><TableCell align="right">{result.gpa.toFixed(2)}</TableCell><TableCell>{result.grade}</TableCell>
                      <TableCell><Chip size="small" label={result.status} color={result.status === "Pass" ? "success" : "error"} /></TableCell>
                      <TableCell>{canPromote ? <Button size="small" onClick={() => promoteStudent(result.studentId)} disabled={saving}>Promote to Semester {Number(period) + 1}</Button> : "—"}</TableCell>
                    </TableRow>
                  );
                })}</TableBody>
              </Table></TableContainer>
              {!cohort.results.length && <Typography color="text.secondary" sx={{ py: 3, textAlign: "center" }}>No class result data available yet.</Typography>}
            </CardContent>
          </Card>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2 }}>
            Grading: O ≥90, A+ ≥80, A ≥70, B+ ≥60, B ≥50, C ≥40, F &lt;40. GPA is the average subject grade point (10-point scale).
          </Typography>
          {auditLogs && (
            <Card variant="outlined" sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Recent Result Audit Events</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead><TableRow><TableCell>Time</TableCell><TableCell>Actor</TableCell><TableCell>Action</TableCell><TableCell>Entity</TableCell></TableRow></TableHead>
                    <TableBody>{auditLogs.map((entry) => (
                      <TableRow key={entry._id}>
                        <TableCell>{new Date(entry.createdAt).toLocaleString()}</TableCell>
                        <TableCell>{entry.actorRole} · {entry.actorId}</TableCell>
                        <TableCell>{entry.action}</TableCell>
                        <TableCell>{entry.entityType} · {entry.entityId}</TableCell>
                      </TableRow>
                    ))}
                    {!auditLogs.length && <TableRow><TableCell colSpan={4} align="center">No audit events recorded yet.</TableCell></TableRow>}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}
        </Box>
      )}
    </Box>
  );
}
