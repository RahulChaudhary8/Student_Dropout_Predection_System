import React, { useState, useEffect, useMemo } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import Notepad from "../Notepads/Notepad";
import Counselling from "../Counsellings/Counselling";
import Student from "../Students/Student";
import Attendances from "../../../Components/Attendances/Attendances";
import CounsellingDashboard from "../Counsellings/CounsellingDashboard";
import Counsellor from "../Counsellings/Counsellor";
import Notification from "../Notification/Notification";
import SelectScore from "../Grades/SelectScore";
import SemesterScore from "../Grades/SemesterScore";
import ClassScore from "../Grades/ClassScore";

import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
  Grid,
  Avatar,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  TextField,
  InputAdornment,
  Chip,
  Button,
  Divider,
  Fade,
  Grow,
  Menu,
  MenuItem,
  CircularProgress,
} from "@mui/material";

import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import SpaceDashboardRoundedIcon from "@mui/icons-material/SpaceDashboardRounded";
import ForumRoundedIcon from "@mui/icons-material/ForumRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import EventNoteRoundedIcon from "@mui/icons-material/EventNoteRounded";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import PersonOffRoundedIcon from "@mui/icons-material/PersonOffRounded";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";
import FiberManualRecordRoundedIcon from "@mui/icons-material/FiberManualRecordRounded";
import InboxRoundedIcon from "@mui/icons-material/InboxRounded";
import PsychologyRoundedIcon from "@mui/icons-material/PsychologyRounded";

const DRAWER_WIDTH = 230;

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: <SpaceDashboardRoundedIcon /> },
  { key: "counselling-dashboard", label: "Counselling", icon: <ForumRoundedIcon /> },
  { key: "students", label: "Students", icon: <SchoolRoundedIcon /> },
  { key: "notepad", label: "Notepad", icon: <EditNoteRoundedIcon /> },
  { key: "attendances", label: "Attendances", icon: <EventNoteRoundedIcon /> },
  { key: "test-scores", label: "Test Scores", icon: <AssessmentRoundedIcon /> },
  { key: "notification", label: "Notification", icon: <NotificationsRoundedIcon /> },
];

const MODEL_FEATURES = [
  "Student ID",
  "Marital Status",
  "Application mode",
  "Application order",
  "Course",
  "Daytime/evening attendance",
  "Previous qualification",
  "Previous qualification (grade)",
  "Nacionality",
  "Mother's qualification",
  "Father's qualification",
  "Mother's occupation",
  "Father's occupation",
  "Admission grade",
  "Displaced",
  "Educational special needs",
  "Debtor",
  "Tuition fees up to date",
  "Gender",
  "Scholarship holder",
  "Age at enrollment",
  "International",
  "Curricular units 1st sem (credited)",
  "Curricular units 1st sem (enrolled)",
  "Curricular units 1st sem (evaluations)",
  "Curricular units 1st sem (approved)",
  "Curricular units 1st sem (grade)",
  "Curricular units 1st sem (without evaluations)",
  "Curricular units 2nd sem (credited)",
  "Curricular units 2nd sem (enrolled)",
  "Curricular units 2nd sem (evaluations)",
  "Curricular units 2nd sem (approved)",
  "Curricular units 2nd sem (grade)",
  "Curricular units 2nd sem (without evaluations)",
  "Unemployment rate",
  "Inflation rate",
  "GDP",
];

const sendAllHighRiskAlerts = async (students) => {
  if (!students || students.length === 0) {
    alert("⚠️ No high-risk students found!");
    return;
  }

  try {
    const payload = students.map((student) => ({
      studentName: student.fullName || student.name || "Unknown",
      studentId: student.studentId || student.student_id,
      course: student.courseApplied || student.course || "N/A",
      email: student.email,
      risk: student.risk,
    }));

    console.log("🚀 Sending bulk payload:", payload);

    await axios.post(
      "http://127.0.0.1:5000/api/mentor-notify/send-alert",
      { students: payload },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    alert(`✅ Mentor notified with ${students.length} high-risk students!`);
  } catch (err) {
    console.error("❌ Mentor bulk notification error:", err);
    alert("❌ Failed to send bulk notification.");
  }
};

const sampleStudents = [];

function parseExcel(file, callback) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const jsonData = XLSX.utils.sheet_to_json(sheet, {
      defval: "",
      raw: false,
    });

    const parsed = jsonData.map((row) => {
      const normalizedRow = {};

      MODEL_FEATURES.forEach((col) => {
        normalizedRow[col] = row[col] ?? "";
      });

      normalizedRow["Student ID"] =
        row["Student ID"] ?? row["student id"] ?? row["id"] ?? null;
      normalizedRow["student_id"] = normalizedRow["Student ID"];
      normalizedRow["name"] =
        row["Name"] ?? row["name"] ?? row["Full Name"] ?? "Unknown";
      normalizedRow["course"] = row["Course"] ?? row["course"] ?? "";
      normalizedRow["contributing_factor"] =
        row["contributing_factor"] ?? row["factor"] ?? "Other";
      normalizedRow["email"] = row["Email"] ?? row["email"] ?? "";

      return normalizedRow;
    });

    callback(parsed);
  };

  reader.readAsArrayBuffer(file);
}

function riskTone(level) {
  if (level === "High") return "error";
  if (level === "Moderate") return "warning";
  return "success";
}

const Dashboard = () => {
  const [students, setStudents] = useState(sampleStudents);
  const [filter, setFilter] = useState("");
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("activeTab") || "dashboard";
  });

  // Track which student's "Predict Risk" request is currently in-flight,
  // so we can show a per-row loading state instead of blocking the whole UI.
  const [predictingId, setPredictingId] = useState(null);
  // Track whether the bulk "Predict Risk" toolbar button is running.
  const [bulkPredicting, setBulkPredicting] = useState(false);

  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();

    localStorage.removeItem("token");
    localStorage.removeItem("mentor"); // ya jo bhi user data hai

    navigate("/loginoptions"); // ya window.location.href
  };

  const navigate = useNavigate();
  const [counsellingList, setCounsellingList] = useState([]);
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    const savedStudents = localStorage.getItem("students");

    if (savedStudents) {
      setStudents(JSON.parse(savedStudents));
    } else {
      axios
        .get("http://localhost:5000/api/students")
        .then((res) => {
          setStudents(res.data);
        })
        .catch(console.error);
    }
  }, []);

  useEffect(() => {
    const savedStudents = localStorage.getItem("students");
    const savedTab = localStorage.getItem("activeTab");
    const savedCounselling = localStorage.getItem("counsellingList");

    if (savedTab) setActiveTab(savedTab);
    if (savedStudents) {
      const parsed = JSON.parse(savedStudents);
      setStudents(parsed);
    }
    if (savedCounselling) {
      setCounsellingList(JSON.parse(savedCounselling));
    }
  }, []);

  useEffect(() => {
    if (activeTab) {
      localStorage.setItem("activeTab", activeTab);
    }
  }, [activeTab]);

  useEffect(() => {
    if (counsellingList.length > 0) {
      localStorage.setItem("counsellingList", JSON.stringify(counsellingList));
    }
  }, [counsellingList]);

  const totals = useMemo(() => {
    const total = students.length;
    const aiRisk = students.filter(
      (s) => s.risk === "High" || s.risk === "Moderate"
    ).length;
    const dropped = students.filter((s) => /drop/i.test(s.status)).length;
    const counselling = students.filter(
      (s) => /counsel/i.test(s.status) || /ongoing/i.test(s.status)
    ).length;
    return { total, aiRisk, dropped, counselling };
  }, [students]);

  const highRiskStudents = useMemo(
    () => students.filter((s) => s.risk === "High"),
    [students]
  );

  const sortedStudents = useMemo(() => {
    return [...students].sort(
      (a, b) => (b.dropout_probability ?? 0) - (a.dropout_probability ?? 0)
    );
  }, [students]);

  const filteredAndSorted = sortedStudents.filter((s) => {
    if (!filter) return true;
    const q = filter.toLowerCase();
    const name = (s.name || s.fullName || "").toLowerCase();
    const dept = (s.dept || "").toLowerCase();
    const semester = (s.semester || "").toLowerCase();
    const course = (s.course || s.courseApplied || "").toLowerCase();
    return (
      name.includes(q) ||
      dept.includes(q) ||
      semester.includes(q) ||
      course.includes(q)
    );
  });

  // Persist Excel-derived academic features into the DB WITHOUT running
  // any ML prediction. This is called right after an Excel upload — the
  // mentor's action at that point is just "get this data into the DB".
  // Actual prediction only happens later when the mentor clicks
  // "Predict Risk" (bulk button) or the per-row Predict Risk action.
  //
  // Returns { saved, failed, failedIds, error } so the caller can show an
  // ACCURATE message instead of always assuming success.
  const persistBulkFeaturesToDB = async (rows, featuresByIndex) => {
    // NOTE: we no longer filter out rows with a blank student_id — that's
    // the expected NORMAL case now (system auto-assigns a fresh Student ID
    // + password for each such row). A row is only skipped client-side if
    // it has literally nothing useful in it (handled by the empty-array
    // check on the parsed Excel earlier in handleFile).
    const payload = rows.map((row, idx) => ({
      student_id: row.student_id || row.studentId || null,
      password: row.password || null,
      fullName: row.name || row.fullName,
      email: row.email,
      mlFeatures: featuresByIndex[idx],
    }));

    if (payload.length === 0) {
      return { saved: 0, updated: 0, created: 0, failed: 0, failedIds: [], error: false };
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/students/bulk-import",
        { students: payload },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log("💾 Bulk import response:", res.data);
      return {
        saved: res.data?.saved ?? 0,
        updated: res.data?.updated ?? 0,
        created: res.data?.created ?? 0,
        failed: res.data?.failed ?? 0,
        failedIds: res.data?.failedIds ?? [],
        error: false,
      };
    } catch (err) {
      console.error("❌ Error in bulk import:", err);
      return {
        saved: 0,
        updated: 0,
        created: 0,
        failed: payload.length,
        failedIds: payload.map((p) => p.student_id || "(auto-generated row failed)"),
        error: true,
      };
    }
  };

  // Excel Upload → parse the file → save the raw academic data (mlFeatures)
  // to the DB. No prediction is run here — that only happens when the
  // mentor clicks "Predict Risk".
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);

    const fileExt = file.name.split(".").pop();
    if (!["xlsx", "xls"].includes(fileExt)) {
      alert("Please upload a valid Excel file (.xlsx or .xls)");
      return;
    }

    parseExcel(file, async (parsed) => {
      if (parsed.length === 0) {
        alert("Excel file is empty or missing required headers.");
        return;
      }

      const filteredData = parsed.map((row) => {
        const filteredRow = {};
        MODEL_FEATURES.forEach((col) => {
          filteredRow[col] = row[col] ?? row[col.toLowerCase()] ?? "";
        });

        // Normal case: leave these two columns BLANK in the Excel — the
        // system always assigns a fresh Student ID + password. Only fill
        // these in for a genuine migration of pre-existing legacy IDs.
        const rawId = row["Student ID"] ?? row["student id"] ?? row["id"] ?? "";
        filteredRow["student_id"] = rawId && rawId.toString().trim() ? rawId.toString().trim() : null;

        const rawPassword = row["Password"] ?? row["password"] ?? "";
        filteredRow["password"] = rawPassword && rawPassword.toString().trim() ? rawPassword.toString().trim() : null;

        filteredRow["email"] = row["Email"] ?? row["email"] ?? "";

        return filteredRow;
      });

      // No prediction yet — just attach the raw features so the table and
      // the Predict Risk button have something to work with, with
      // "not yet predicted" defaults.
      const withFeatures = parsed.map((student, idx) => ({
        ...student,
        mlFeatures: filteredData[idx],
        prediction: "N/A",
        dropout_probability: 0,
        risk: "Low",
        explanations: [],
      }));

      setStudents(withFeatures);
      localStorage.setItem("students", JSON.stringify(withFeatures));

      const updatedCounselling = withFeatures.filter(
        (s) => s.marked === true || s.status === "Pending"
      );
      setCounsellingList(updatedCounselling);
      localStorage.setItem("counsellingList", JSON.stringify(updatedCounselling));

      // Save the raw academic data to the DB (no prediction call here) —
      // new students get auto-created (with a fresh, backend-assigned
      // Student ID + password), existing ones just get mlFeatures updated.
      const saveResult = await persistBulkFeaturesToDB(parsed, filteredData);

      // Since new students' real Student IDs are assigned by the backend
      // (not known to us until after the save), re-fetch from the DB so
      // the table shows the actual generated IDs instead of the blank
      // ones from the Excel.
      if (!saveResult.error && saveResult.saved > 0) {
        try {
          const refreshed = await axios.get("http://localhost:5000/api/students", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });
          setStudents(refreshed.data);
          localStorage.setItem("students", JSON.stringify(refreshed.data));
        } catch (err) {
          console.warn("⚠️ Could not refresh student list from DB after import:", err);
        }
      }

      if (saveResult.error) {
        alert(
          "⚠️ Excel data table me dikh raha hai, lekin database me save NAHI ho paaya — backend se connect nahi ho saka.\n\nCheck karein: backend server chal raha hai (http://localhost:5000) aur CORS allow hai?"
        );
      } else {
        const parts = [];
        if (saveResult.created > 0) parts.push(`🆕 ${saveResult.created} naye student(s) create hue`);
        if (saveResult.updated > 0) parts.push(`✅ ${saveResult.updated} existing student(s) update hue`);
        if (saveResult.failed > 0) parts.push(`⚠️ ${saveResult.failed} fail hue: ${saveResult.failedIds.join(", ")}`);

        const summary = parts.length > 0 ? parts.join("\n") : "⚠️ Kuch bhi save nahi hua.";
        const nextStep =
          saveResult.saved > 0
            ? '\n\nAb "Predict Risk" button dabakar prediction chalayein.'
            : "";
        const placeholderNote =
          saveResult.created > 0
            ? '\n\nNote: naye create hue students ki profile placeholder data (DOB, Aadhar, address, etc.) ke saath bani hai — baad me unhe poora update karna hoga.'
            : "";

        alert(`${summary}${nextStep}${placeholderNote}`);
      }
    });
  };

  const handleMarkForCounselling = (student) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.student_id === student.student_id ? { ...s, marked: true } : s
      )
    );

    setCounsellingList((prev) => {
      if (prev.find((s) => s.student_id === student.student_id)) return prev;

      const updated = [
        ...prev,
        { ...student, marked: true, status: "Pending", session: null },
      ];
      localStorage.setItem("counsellingList", JSON.stringify(updated));
      return updated;
    });
  };

  // ---------------------------------------------------------------------
  // Predict Risk (single student) — works for BOTH data shapes:
  //   (a) a student fetched straight from MongoDB (`studentId`, `fullName`,
  //       `courseApplied`, and — if previously filled in — `mlFeatures`)
  //   (b) a row that came from an Excel upload (`student_id`, `name`,
  //       `course`, and the 36 MODEL_FEATURES sitting directly on the row)
  //
  // Flow: Button click -> resolve this student's 36 ML features from
  // whichever shape we have -> POST to ML model -> get prediction -> POST
  // result (+ features, so they're saved for next time) to backend to
  // persist in DB -> update local state so the UI reflects the new risk.
  // ---------------------------------------------------------------------
  const extractMlFeatures = (student) => {
    // Case (a): DB student that already has academic features saved
    if (student.mlFeatures && Object.keys(student.mlFeatures).length > 0) {
      return student.mlFeatures;
    }

    // Case (b): Excel-shaped row — the 36 MODEL_FEATURES keys sit directly
    // on the object itself. Only treat it as "found" if at least one of
    // them actually has a non-empty value, so we don't silently send an
    // all-blank payload to the model.
    const fromRow = {};
    let hasAnyValue = false;
    MODEL_FEATURES.forEach((col) => {
      const val = student[col];
      fromRow[col] = val ?? "";
      if (val !== undefined && val !== null && val !== "") hasAnyValue = true;
    });

    return hasAnyValue ? fromRow : null;
  };

  const handlePredictRisk = async (student) => {
    const sid = student.studentId || student.student_id;
    const displayName = student.fullName || student.name || sid;

    if (!sid) {
      alert("⚠️ This student has no Student ID, cannot run prediction.");
      return;
    }

    const features = extractMlFeatures(student);
    if (!features) {
      alert(
        `⚠️ "${displayName}" के लिए academic data (marks, curricular units, आदि) अभी DB में मौजूद नहीं है।\n\nकृपया पहले "Upload Excel" के ज़रिए इस student का academic data upload करें, उसके बाद Predict Risk दोबारा चलाएँ।`
      );
      return;
    }

    setPredictingId(sid);

    try {
      // 1) Send resolved features to ML model for prediction
      const mlResponse = await axios.post("http://127.0.0.1:8000/predict", {
        records: [features],
      });

      const result = mlResponse.data?.results?.[0];
      const prob = result?.dropout_probability ?? 0;

      let risk = "Low";
      if (prob >= 70) risk = "High";
      else if (prob >= 40) risk = "Moderate";

      const updatedStudent = {
        ...student,
        mlFeatures: features,
        prediction: result?.prediction ?? "N/A",
        dropout_probability: prob,
        explanations: result?.explanations ?? [],
        risk,
      };

      // 2) Persist the prediction result (+ features, so they're saved for
      // next time) in the database via backend API
      await axios.post(
        "http://localhost:5000/api/students/save-prediction",
        {
          student_id: sid,
          prediction: updatedStudent.prediction,
          dropout_probability: prob,
          risk,
          explanations: updatedStudent.explanations,
          mlFeatures: features,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // 3) Update UI immediately so the mentor sees the new risk/result
      setStudents((prev) => {
        const updated = prev.map((s) =>
          (s.studentId || s.student_id) === sid ? updatedStudent : s
        );
        localStorage.setItem("students", JSON.stringify(updated));
        return updated;
      });

      alert(`✅ Prediction complete for ${displayName}: ${risk} risk (${prob}%)`);
    } catch (err) {
      console.error("❌ Predict Risk error:", err);
      alert("❌ Prediction failed. Please try again.");
    } finally {
      setPredictingId(null);
    }
  };

  // ---------------------------------------------------------------------
  // Predict Risk (bulk) — replaces the old "Update Excel" toolbar button.
  // Runs prediction for every currently-loaded student who doesn't have
  // one yet (detected via `predictedAt` being unset — this is true both
  // for freshly-uploaded Excel rows and for DB students that only ever
  // had their features saved, never predicted). Already-predicted
  // students are left untouched.
  // ---------------------------------------------------------------------
  const handleBulkPredictRisk = async () => {
    const pending = students.filter((s) => !s.predictedAt);

    if (pending.length === 0) {
      alert("✅ सभी students का prediction पहले से हो चुका है। नया data चाहिए तो Excel upload करें।");
      return;
    }

    // Resolve features per student; drop any we genuinely can't predict for.
    const withFeatures = pending
      .map((student) => ({ student, features: extractMlFeatures(student) }))
      .filter((entry) => entry.features);

    const skipped = pending.length - withFeatures.length;

    if (withFeatures.length === 0) {
      alert(
        "⚠️ किसी भी pending student के लिए academic data मौजूद नहीं है। कृपया पहले Excel upload करें, फिर Predict Risk दबाएँ।"
      );
      return;
    }

    setBulkPredicting(true);
    try {
      // 1) Send all pending students' features to the ML model in one batch
      const mlResponse = await axios.post("http://127.0.0.1:8000/predict", {
        records: withFeatures.map((entry) => entry.features),
      });

      const results = mlResponse.data?.results ?? [];

      // 2) Compute risk per student and save each result to the DB
      const predictedById = {};
      const savePromises = withFeatures.map((entry, idx) => {
        const sid = entry.student.studentId || entry.student.student_id;
        const r = results[idx];
        const prob = r?.dropout_probability ?? 0;

        let risk = "Low";
        if (prob >= 70) risk = "High";
        else if (prob >= 40) risk = "Moderate";

        predictedById[sid] = {
          prediction: r?.prediction ?? "N/A",
          dropout_probability: prob,
          explanations: r?.explanations ?? [],
          risk,
        };

        if (!sid) return Promise.resolve();
        return axios
          .post(
            "http://localhost:5000/api/students/save-prediction",
            { student_id: sid, mlFeatures: entry.features, ...predictedById[sid] },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          )
          .catch((err) => {
            console.warn(`⚠️ Could not save prediction for ${sid}:`, err?.response?.data || err.message);
          });
      });

      await Promise.allSettled(savePromises);

      // 3) Update the UI immediately for every student we just predicted
      const predictedAtNow = new Date().toISOString();
      setStudents((prev) => {
        const updated = prev.map((s) => {
          const sid = s.studentId || s.student_id;
          if (sid && predictedById[sid]) {
            return { ...s, ...predictedById[sid], predictedAt: predictedAtNow };
          }
          return s;
        });
        localStorage.setItem("students", JSON.stringify(updated));
        return updated;
      });

      alert(
        `✅ ${withFeatures.length} student(s) ka prediction complete ho gaya${skipped > 0 ? ` (${skipped} student(s) me academic data missing hone ke karan skip kiye gaye)` : ""
        }.`
      );
    } catch (err) {
      console.error("❌ Bulk Predict Risk error:", err);
      alert("❌ Prediction failed. Please try again.");
    } finally {
      setBulkPredicting(false);
    }
  };

  const summaryCards = [
    {
      label: "Total Students",
      value: totals.total,
      icon: <GroupsRoundedIcon />,
      tone: "primary",
    },
    {
      label: "AI-Risk Students",
      value: students.filter((s) => s.risk === "High").length,
      icon: <WarningAmberRoundedIcon />,
      tone: "error",
    },
    {
      label: "Dropped-Out Students",
      value: totals.dropped,
      icon: <PersonOffRoundedIcon />,
      tone: "warning",
    },
    {
      label: "Ongoing Counseling",
      value: totals.counselling,
      icon: <ForumOutlinedIcon />,
      tone: "success",
    },
  ];

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            bgcolor: "#16364b",
            color: "#e6f3ff",
            border: "none",
          },
        }}
      >
        <Toolbar sx={{ py: 3 }}>
          <Box className="flex items-center gap-2">
            <SchoolRoundedIcon sx={{ color: "#7dd3fc" }} />
            <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: "-0.01em" }}>
              Mentor Panel
            </Typography>
          </Box>
        </Toolbar>
        <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />
        <List className="px-2 pt-2" sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          {NAV_ITEMS.map((item, idx) => {
            const isActive = activeTab === item.key;
            return (
              <Grow in timeout={300 + idx * 80} key={item.key}>
                <ListItemButton
                  onClick={() => setActiveTab(item.key)}
                  sx={{
                    borderRadius: 2,
                    transition: "all 0.25s ease",
                    bgcolor: isActive ? "primary.main" : "transparent",
                    "&:hover": {
                      bgcolor: isActive ? "primary.dark" : "rgba(255,255,255,0.08)",
                      transform: "translateX(4px)",
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: "#fff", minWidth: 36 }}>{item.icon}</ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{ fontSize: 14, fontWeight: isActive ? 700 : 500 }}
                  />
                </ListItemButton>
              </Grow>
            );
          })}
          <ListItemButton sx={{ borderRadius: 2, "&:hover": { bgcolor: "rgba(255,255,255,0.08)" } }}>
            <ListItemIcon sx={{ color: "#fff", minWidth: 36 }}>
              <SettingsRoundedIcon />
            </ListItemIcon>
            <ListItemText primary="Settings" primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }} />
          </ListItemButton>
        </List>
      </Drawer>

      {/* Main content */}
      <Box component="main" className="flex-1 flex flex-col">
        <AppBar
          position="sticky"
          elevation={0}
          sx={{ bgcolor: "background.paper", color: "text.primary", borderBottom: "1px solid #e2e8f0" }}
        >

          <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>

            {/* LEFT SIDE */}
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {NAV_ITEMS.find((n) => n.key === activeTab)?.label || "Dashboard"}
            </Typography>

            {/* RIGHT SIDE */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>

              {/* SEARCH */}
              {activeTab === "dashboard" && (
                <TextField
                  placeholder="Search student..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  size="small"
                  sx={{ width: { xs: 150, sm: 260 } }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchRoundedIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              )}

              {/* PROFILE + LOGOUT */}
              <Box
                onClick={handleMenuOpen}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  cursor: "pointer",
                  bgcolor: "#f5f5f5",
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 10,
                  "&:hover": { bgcolor: "#ececec" },
                }}
              >
                <Avatar sx={{ bgcolor: "#6c5ce7", width: 34, height: 34 }}>
                  M
                </Avatar>

                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                  }}
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                >

                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                      <LogoutRoundedIcon fontSize="small" />
                    </ListItemIcon>
                    Logout
                  </MenuItem>
                </Menu>

                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Mentor
                </Typography>
                <KeyboardArrowDownRoundedIcon />
              </Box>

            </Box>
          </Toolbar>

        </AppBar>


        <Box className="p-6 md:p-10">
          {activeTab === "dashboard" && (
            <Fade in timeout={500}>
              <Box>
                {/* Summary Cards */}
                <Grid container spacing={3} className="mb-6">
                  {summaryCards.map((c, idx) => (
                    <Grid item xs={12} sm={6} md={3} key={c.label}>
                      <Grow in timeout={350 + idx * 130}>
                        <Card
                          elevation={0}
                          className="transition-all duration-300"
                          sx={{
                            border: "1px solid #e2e8f0",
                            "&:hover": {
                              transform: "translateY(-4px)",
                              boxShadow: "0 12px 24px -8px rgba(15, 23, 42, 0.15)",
                            },
                          }}
                        >
                          <CardContent className="flex items-center gap-3">
                            <Avatar sx={{ bgcolor: `${c.tone}.main`, width: 46, height: 46 }}>
                              {c.icon}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {c.label}
                              </Typography>
                              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                {c.value}
                              </Typography>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grow>
                    </Grid>
                  ))}
                </Grid>

                <Grid container spacing={3} className="mb-6">
                  {/* Dropout Risk List */}
                  <Grid item xs={12} md={8}>
                    <Grow in timeout={650}>
                      <Card
                        elevation={0}
                        sx={{
                          border: "1px solid #e2e8f0",
                          height: 500,
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <CardContent sx={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
                          <Box className="flex flex-wrap justify-between items-center gap-2 mb-3">
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                              Dropout Risk List
                            </Typography>
                            <Box className="flex gap-2 flex-wrap">
                              <Button
                                component="label"
                                variant="contained"
                                size="small"
                                startIcon={<UploadFileRoundedIcon />}
                                className="transition-all duration-300"
                                sx={{ "&:hover": { transform: "translateY(-2px)", boxShadow: 3 } }}
                              >
                                Upload Excel
                                <input type="file" accept=".xlsx, .xls" hidden onChange={handleFile} />
                              </Button>
                              <Button
                                variant="contained"
                                color="info"
                                size="small"
                                startIcon={
                                  bulkPredicting ? (
                                    <CircularProgress size={14} color="inherit" />
                                  ) : (
                                    <PsychologyRoundedIcon />
                                  )
                                }
                                disabled={bulkPredicting}
                                onClick={handleBulkPredictRisk}
                                className="transition-all duration-300"
                                sx={{ "&:hover": { transform: "translateY(-2px)", boxShadow: 3 } }}
                              >
                                {bulkPredicting ? "Predicting..." : "Predict Risk"}
                              </Button>
                              <Button
                                variant="contained"
                                color="error"
                                size="small"
                                startIcon={<NotificationsActiveRoundedIcon />}
                                onClick={() => sendAllHighRiskAlerts(highRiskStudents)}
                                className="transition-all duration-300"
                                sx={{ "&:hover": { transform: "translateY(-2px)", boxShadow: 3 } }}
                              >
                                Notify All
                              </Button>
                            </Box>
                          </Box>

                          <TableContainer sx={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
                            <Table stickyHeader size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell sx={{ fontWeight: 700, bgcolor: "#e0e7ff" }}>Name</TableCell>
                                  <TableCell sx={{ fontWeight: 700, bgcolor: "#e0e7ff" }}>Student ID</TableCell>
                                  <TableCell sx={{ fontWeight: 700, bgcolor: "#e0e7ff" }}>Course</TableCell>
                                  <TableCell sx={{ fontWeight: 700, bgcolor: "#e0e7ff" }}>Risk Level</TableCell>
                                  <TableCell sx={{ fontWeight: 700, bgcolor: "#e0e7ff" }} align="right">
                                    Dropout %
                                  </TableCell>
                                  <TableCell sx={{ fontWeight: 700, bgcolor: "#e0e7ff" }} align="right">
                                    Action
                                  </TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {filteredAndSorted.map((s, idx) => {
                                  const rowId = s.studentId || s.student_id;
                                  return (
                                    <TableRow
                                      key={idx}
                                      hover
                                      sx={{ "&:hover": { bgcolor: "rgba(37, 99, 235, 0.04)" } }}
                                    >
                                      <TableCell>{s.fullName || s.name}</TableCell>
                                      <TableCell>{rowId || "NA"}</TableCell>
                                      <TableCell>{s.courseApplied || s.course}</TableCell>
                                      <TableCell>
                                        <Chip
                                          label={s.risk}
                                          color={riskTone(s.risk)}
                                          size="small"
                                          sx={{ fontWeight: 700 }}
                                        />
                                      </TableCell>
                                      <TableCell align="right">
                                        {s.dropout_probability?.toFixed(2) ?? "N/A"}
                                      </TableCell>
                                      <TableCell align="right">
                                        <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                                          <Button
                                            size="small"
                                            variant="outlined"
                                            color="primary"
                                            startIcon={
                                              predictingId === rowId ? (
                                                <CircularProgress size={14} />
                                              ) : (
                                                <PsychologyRoundedIcon />
                                              )
                                            }
                                            disabled={predictingId === rowId}
                                            onClick={() => handlePredictRisk(s)}
                                          >
                                            {predictingId === rowId ? "Predicting..." : "Predict Risk"}
                                          </Button>
                                          {s.risk === "High" && (
                                            <Button
                                              size="small"
                                              variant="outlined"
                                              color="error"
                                              startIcon={<NotificationsActiveRoundedIcon />}
                                            >
                                              Notify
                                            </Button>
                                          )}
                                        </Box>
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                                {filteredAndSorted.length === 0 && (
                                  <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 4, color: "text.secondary" }}>
                                      No students found.
                                    </TableCell>
                                  </TableRow>
                                )}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </CardContent>
                      </Card>
                    </Grow>
                  </Grid>

                  {/* Notifications */}
                  <Grid item xs={12} md={4}>
                    <Grow in timeout={800}>
                      <Card
                        elevation={0}
                        sx={{
                          border: "1px solid #e2e8f0",
                          height: 500,
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <CardContent sx={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
                          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                            Notifications
                          </Typography>
                          <Box sx={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
                            {highRiskStudents.length === 0 ? (
                              <Box className="flex flex-col items-center justify-center py-10">
                                <InboxRoundedIcon sx={{ fontSize: 40, color: "text.secondary", mb: 1 }} />
                                <Typography variant="body2" color="text.secondary">
                                  No high-risk notifications
                                </Typography>
                              </Box>
                            ) : (
                              <Box className="flex flex-col gap-2">
                                {highRiskStudents.slice(0, 5).map((s, idx) => (
                                  <Fade in timeout={300 + idx * 100} key={idx}>
                                    <Box className="flex items-center gap-2">
                                      <FiberManualRecordRoundedIcon sx={{ fontSize: 10, color: "error.main" }} />
                                      <Typography variant="body2">
                                        <strong>{s.name}</strong> added to high-risk list
                                      </Typography>
                                    </Box>
                                  </Fade>
                                ))}
                              </Box>
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    </Grow>
                  </Grid>
                </Grid>

                {/* Institute Summary */}
                <Grow in timeout={950}>
                  <Card elevation={0} sx={{ border: "1px solid #e2e8f0" }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                        Institute Summary
                      </Typography>
                      {[
                        { label: "Total Departments", value: 4 },
                        { label: "Semesters", value: 8 },
                        { label: "Dropout Percentage", value: "2%" },
                        { label: "Quick Filter", value: 2 },
                      ].map((row, idx) => (
                        <Box key={row.label}>
                          <Box className="flex justify-between items-center py-2.5">
                            <Typography color="text.secondary">{row.label}</Typography>
                            <Typography sx={{ fontWeight: 700 }}>{row.value}</Typography>
                          </Box>
                          {idx < 3 && <Divider />}
                        </Box>
                      ))}
                    </CardContent>
                  </Card>
                </Grow>
              </Box>
            </Fade>
          )}

          {activeTab === "counselling-dashboard" && (
            <Fade in timeout={400}>
              <Box>
                <CounsellingDashboard
                  onSelectCounselling={() => setActiveTab("counselling")}
                  onGiveCounselling={() => setActiveTab("counsellor")}
                />
              </Box>
            </Fade>
          )}

          {activeTab === "counselling" && (
            <Fade in timeout={400}>
              <Box>
                <Counselling
                  students={counsellingList || []}
                  goBack={() => setActiveTab("counselling-dashboard")}
                />
              </Box>
            </Fade>
          )}

          {activeTab === "counsellor" && (
            <Fade in timeout={400}>
              <Box>
                <Counsellor
                  students={counsellingList}
                  goBack={() => setActiveTab("counselling-dashboard")}
                />
              </Box>
            </Fade>
          )}

          {activeTab === "notepad" && (
            <Fade in timeout={400}>
              <Box>
                <Notepad />
              </Box>
            </Fade>
          )}

          {activeTab === "attendances" && (
            <Fade in timeout={400}>
              <Box>
                <Attendances studentData={students} subjects={["Math", "Physics", "Chemistry"]} />
              </Box>
            </Fade>
          )}

          {activeTab === "test-scores" && (
            <Fade in timeout={400}>
              <Box>
                <SelectScore
                  onSelectClass={() => setActiveTab("class-score")}
                  onSelectSemester={() => setActiveTab("semester-score")}
                />
              </Box>
            </Fade>
          )}

          {activeTab === "class-score" && (
            <Fade in timeout={400}>
              <Box>
                <ClassScore students={students} goBack={() => setActiveTab("test-scores")} />
              </Box>
            </Fade>
          )}

          {activeTab === "semester-score" && (
            <Fade in timeout={400}>
              <Box>
                <SemesterScore students={students} goBack={() => setActiveTab("test-scores")} />
              </Box>
            </Fade>
          )}

          {activeTab === "students" && (
            <Fade in timeout={400}>
              <Box>
                <Student
                  studentData={students}
                  onMarkForCounselling={handleMarkForCounselling}
                  goBack={() => setActiveTab("dashboard")}
                />
              </Box>
            </Fade>
          )}

          {activeTab === "notification" && (
            <Fade in timeout={400}>
              <Box>
                <Notification />
              </Box>
            </Fade>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;