import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  MenuItem,
  Button,
  Fade,
} from "@mui/material";
import SupervisorAccountRoundedIcon from "@mui/icons-material/SupervisorAccountRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";

const initialState = {
  firstName: "",
  lastName: "",
  mentorId: "",
  email: "",
  phone: "",
  specialization: "",
  qualification: "",
  counsellingType: "",
  experience: "",
  availability: "",
  notes: "",
};

const AddMentorForm = ({ onMentorAdded }) => {
  const [mentorData, setMentorData] = useState(initialState);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMentorData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/mentors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mentorData),
      });
      const result = await response.json();

      if (response.ok) {
        onMentorAdded(result.mentor);
        setMentorData(initialState);
      } else {
        alert(result.message || "Error adding mentor");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleReset = () => {
    setMentorData(initialState);
  };

  return (
    <Fade in timeout={450}>
      <Box sx={{ maxWidth: 900, mx: "auto" }}>
        <Box className="flex items-center gap-2 mb-4 justify-center">
          <SupervisorAccountRoundedIcon color="primary" />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Mentor Registration
          </Typography>
        </Box>

        <Card elevation={0} sx={{ border: "1px solid #e2e8f0" }}>
          <CardContent>
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ maxHeight: "62vh", overflowY: "auto", pr: 1 }}
            >
              <Grid container spacing={2.5}>
                {/* Name */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="firstName"
                    value={mentorData.firstName}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="lastName"
                    value={mentorData.lastName}
                    onChange={handleChange}
                    required
                  />
                </Grid>

                {/* Contact */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email ID"
                    type="email"
                    name="email"
                    value={mentorData.email}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    type="tel"
                    name="phone"
                    value={mentorData.phone}
                    onChange={handleChange}
                    required
                  />
                </Grid>

                {/* Specialization & Qualification */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Specialization / Subject"
                    name="specialization"
                    value={mentorData.specialization}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Qualification"
                    name="qualification"
                    value={mentorData.qualification}
                    onChange={handleChange}
                    required
                  />
                </Grid>

                {/* Counselling Type & Experience */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Counselling Type"
                    name="counsellingType"
                    value={mentorData.counsellingType}
                    onChange={handleChange}
                    required
                  >
                    <MenuItem value="">Select</MenuItem>
                    <MenuItem value="Academic">Academic</MenuItem>
                    <MenuItem value="Career-guidance">Career Guidance</MenuItem>
                    <MenuItem value="Financial">Financial</MenuItem>
                    <MenuItem value="Mental-health">Mental Health</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Years of Experience"
                    type="number"
                    name="experience"
                    value={mentorData.experience}
                    onChange={handleChange}
                    inputProps={{ min: 0 }}
                  />
                </Grid>

                {/* Availability */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Availability"
                    name="availability"
                    value={mentorData.availability}
                    onChange={handleChange}
                    placeholder="e.g., Mon-Fri 10am-5pm"
                  />
                </Grid>

                {/* Notes */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Additional Notes"
                    name="notes"
                    value={mentorData.notes}
                    onChange={handleChange}
                    multiline
                    rows={1}
                  />
                </Grid>
              </Grid>

              {/* Buttons */}
              <Box className="flex justify-center gap-3 mt-6">
                <Button
                  type="submit"
                  variant="contained"
                  color="success"
                  startIcon={<SaveRoundedIcon />}
                  className="transition-all duration-300"
                  sx={{
                    px: 4,
                    "&:hover": { transform: "translateY(-2px)", boxShadow: 4 },
                  }}
                >
                  Save
                </Button>
                <Button
                  type="button"
                  variant="contained"
                  color="error"
                  startIcon={<RestartAltRoundedIcon />}
                  onClick={handleReset}
                  className="transition-all duration-300"
                  sx={{
                    px: 4,
                    "&:hover": { transform: "translateY(-2px)", boxShadow: 4 },
                  }}
                >
                  Reset
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Fade>
  );
};

export default AddMentorForm;