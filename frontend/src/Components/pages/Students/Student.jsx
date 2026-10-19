import React, { useState } from "react";
import StudentDetail from "../StudentDetails/StudentDetail";
import {
  Box,
  Typography,
  Card,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  TextField,
  InputAdornment,
  Button,
  Chip,
  Fade,
  Grow,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import InboxRoundedIcon from "@mui/icons-material/InboxRounded";

const Student = ({ studentData, goBack, onMarkForCounselling }) => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const students = Array.isArray(studentData) ? studentData : [studentData];

  if (selectedStudent) {
    return (
      <StudentDetail
        student={selectedStudent}
        onBack={() => setSelectedStudent(null)}
        onMarkForCounselling={() => {
          onMarkForCounselling(selectedStudent);
        }}
      />
    );
  }

  if (!students || students.length === 0) {
    return (
      <Fade in timeout={400}>
        <Box className="flex flex-col items-center justify-center py-16">
          <InboxRoundedIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1.5 }} />
          <Typography color="text.secondary">
            No students found. Please upload Excel file.
          </Typography>
        </Box>
      </Fade>
    );
  }

  function riskTone(risk) {
    if (risk === "High") return "error";
    if (risk === "Moderate") return "warning";
    if (risk === "Low") return "success";
    return "default";
  }

  const handleSearch = () => {
    const search = searchTerm.toLowerCase();
    const foundStudent = students.find(
      (student) =>
        (student.name || "").toLowerCase().includes(search) ||
        (student["Student ID"] || "").toString().toLowerCase().includes(search)
    );

    if (foundStudent) {
      setSelectedStudent(foundStudent);
    } else {
      alert("No matching student found!");
    }
  };

  const sortedStudents = [...students].sort((a, b) => {
    const idA = (a["Student ID"] || "").toString().toLowerCase();
    const idB = (b["Student ID"] || "").toString().toLowerCase();
    return idA.localeCompare(idB);
  });

  return (
    <Fade in timeout={450}>
      <Box>
        <Button
          startIcon={<ArrowBackRoundedIcon />}
          onClick={goBack}
          sx={{ mb: 2.5, fontWeight: 600 }}
        >
          Back to Dashboard
        </Button>

        {/* Search bar */}
        <Box className="flex justify-end gap-2 mb-4">
          <TextField
            placeholder="Search by Student Name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            size="small"
            sx={{ width: { xs: "100%", sm: 280 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            className="transition-all duration-300"
            sx={{ "&:hover": { transform: "translateY(-2px)", boxShadow: 3 } }}
          >
            Search
          </Button>
        </Box>

        <Grow in timeout={500}>
          <Card elevation={0} sx={{ border: "1px solid #e2e8f0" }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "primary.main" }}>
                    <TableCell sx={{ color: "#fff", fontWeight: 700 }}>Student ID</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: 700 }}>Student Name</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: 700 }}>Course</TableCell>
                    <TableCell sx={{ color: "#fff", fontWeight: 700 }}>Risk</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedStudents.map((student, index) => (
                    <TableRow
                      key={index}
                      hover
                      onClick={() => setSelectedStudent(student)}
                      sx={{
                        cursor: "pointer",
                        "&:hover": { bgcolor: "rgba(37, 99, 235, 0.04)" },
                      }}
                    >
                      <TableCell>{student.studentId || "N/A"}</TableCell>
                      <TableCell>{student.fullName || "N/A"}</TableCell>
                      <TableCell>{student.courseApplied || "N/A"}</TableCell>
                      <TableCell>
                        {student.risk ? (
                          <Chip
                            label={student.risk}
                            color={riskTone(student.risk)}
                            size="small"
                            sx={{ fontWeight: 700 }}
                          />
                        ) : (
                          <Chip label="N/A" size="small" variant="outlined" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grow>
      </Box>
    </Fade>
  );
};

export default Student;