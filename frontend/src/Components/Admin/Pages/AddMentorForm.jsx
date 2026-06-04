import React, { useState } from "react";
import "./AddMentorForm.css";

const AddMentorForm = ({ onMentorAdded }) => {
  const [mentorData, setMentorData] = useState({
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
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMentorData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Mentor Data Submitted:", mentorData);

    // Table update ke liye parent ko data pass karo
    if (onMentorAdded) {
      onMentorAdded(mentorData);
    }

    // Reset after submit
    setMentorData({
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
    });
  };

  const handleReset = () => {
    setMentorData({
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
    });
  };

  return (
    <div className="mentor-form-container">
      <h2>Mentor Registration</h2>
      <form className="mentor-form" onSubmit={handleSubmit}>
        {/* Row 1: Name */}
        <div className="form-row">
          <div className="form-group">
            <label>First Name</label>
            <input
              type="text"
              name="firstName"
              value={mentorData.firstName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input
              type="text"
              name="lastName"
              value={mentorData.lastName}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Row 2: Mentor ID */}
        <div className="form-row">
          <div className="form-group full-width">
            <label>Mentor ID</label>
            <input
              type="text"
              name="mentorId"
              value={mentorData.mentorId}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Row 3: Email & Phone */}
        <div className="form-row">
          <div className="form-group">
            <label>Email ID</label>
            <input
              type="email"
              name="email"
              value={mentorData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={mentorData.phone}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Row 4: Specialization & Qualification */}
        <div className="form-row">
          <div className="form-group">
            <label>Specialization / Subject</label>
            <input
              type="text"
              name="specialization"
              value={mentorData.specialization}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Qualification</label>
            <input
              type="text"
              name="qualification"
              value={mentorData.qualification}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Row 5: Counselling Type & Experience */}
        <div className="form-row">
          <div className="form-group">
            <label>Counselling Type</label>
            <select
              name="counsellingType"
              value={mentorData.counsellingType}
              onChange={handleChange}
              required
            >
              <option value="">Select</option>
              <option value="Academic">Academic</option>
              <option value="Career">Career</option>
              <option value="Personal">Personal</option>
              <option value="Psychological">Psychological</option>
            </select>
          </div>
          <div className="form-group">
            <label>Years of Experience</label>
            <input
              type="number"
              name="experience"
              value={mentorData.experience}
              onChange={handleChange}
              min="0"
            />
          </div>
        </div>

        {/* Row 6: Availability */}
        <div className="form-row">
          <div className="form-group full-width">
            <label>Availability</label>
            <input
              type="text"
              name="availability"
              value={mentorData.availability}
              onChange={handleChange}
              placeholder="e.g., Mon-Fri 10am-5pm"
            />
          </div>
        </div>

        {/* Row 7: Notes */}
        <div className="form-row">
          <div className="form-group full-width">
            <label>Additional Notes</label>
            <textarea
              name="notes"
              value={mentorData.notes}
              onChange={handleChange}
              rows="3"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="form-actions">
          <button type="submit" className="btn-save">
            Save
          </button>
          <button type="button" className="btn-reset" onClick={handleReset}>
            Reset
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddMentorForm;
