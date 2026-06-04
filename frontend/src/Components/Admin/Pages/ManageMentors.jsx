import React, { useState,useEffect } from "react";
import "./ManageMentors.css"; // styling alag rakho
import AddMentorForm from "./AddMentorForm";

export default function ManageMentors() {
  // Dummy data for mentors
  const [activeSection, setActiveSection] = useState("table");
  const [mentors, setMentors] = useState([
    
    { id: 1, name: "Dr. Rakesh Gupta", specialization: "AI & ML", experience: "5 years" },
    { id: 2, name: "Prof. Neha Singh", specialization: "Finance", experience: "8 years" },
    { id: 3, name: "Mr. Arjun Verma", specialization: "Data Science", experience: "3 years" },
    { id: 4, name: "Dr. Meera Iyer", specialization: "Cyber Security", experience: "6 years" },
    { id: 5, name: "Prof. Karan Malhotra", specialization: "Cloud Computing", experience: "4 years" },
  ]);

  // Add Mentor dummy handler
  const handleAddMentor = () => {
    setActiveSection("addMentor"); // 👈 ab error nahi aayega
  };
  
  // const handleMentorAdded = (newMentor) => {
  //   setMentors(prev => [...prev, newMentor]); // table update
  //   setActiveSection("table"); // form submit ke baad table wapas
  // };
  const handleMentorAdded = (newMentor) => {
    const mentorWithId = {
      id: mentors.length + 1, // auto ID
      name: `${newMentor.firstName} ${newMentor.lastName}`,
      specialization: newMentor.specialization,
      experience: newMentor.experience + " years",
    };

    setMentors((prev) => [...prev, mentorWithId]);
    setActiveSection("table"); // form band, table open
  };

  // Delete mentor handler
  const handleDeleteMentor = (id) => {
    const updatedMentors = mentors.filter((mentor) => mentor.id !== id);
    setMentors(updatedMentors);
  };
  return (
    <div className="manage-mentors">
      <h2>Mentor Management</h2>

      {/* Cards Section */}
      <div className="mcards">
        <div className="mcard" onClick={handleAddMentor}>
          <h3>Add Mentor</h3>
          <p>Add a new mentor to the system.</p>
        </div>
        <div className="mcard">
          <h3>Manage Mentors</h3>
          <p>View, edit, or delete mentor details.</p>
        </div>
      </div>
    
    {activeSection === "addMentor" && (
        <AddMentorForm onMentorAdded={handleMentorAdded} />
      )}
      {/* Mentor Table */}
      {activeSection === "table" && (
      <div className="mentors-list">
        <h3>All Mentors</h3>
        <table className="mentors-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Specialization</th>
              <th>Experience</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {mentors.map((mentor) => (
              <tr key={mentor.id}>
                <td>{mentor.id}</td>
                <td>{mentor.name}</td>
                <td>{mentor.specialization}</td>
                <td>{mentor.experience}</td>
                <td>
                  <button>Edit</button>
                  <button
                    style={{ marginLeft: "8px" }}
                    onClick={() => handleDeleteMentor(mentor.id)}
                  >
                    Delete
                  </button>
                  
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
}  
