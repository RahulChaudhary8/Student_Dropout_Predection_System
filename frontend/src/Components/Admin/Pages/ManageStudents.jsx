

import React, { useState, useEffect } from "react";
import "./ManageStudents.css"; // styling alag rakho
import AddStudentForm from "./AddStudentForm"; // Path according to your project
import axios from "axios";

export default function ManageStudents({ isActiveTab }) {
  const [activeSection, setActiveSection] = useState("table");
  const [showAddForm, setShowAddForm] = useState(false);
  const [studentsList, setStudentsList] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // 👈 search term state
  // useEffect(() => {
  //   axios.get("http://localhost:5000/admin/getStudents")
  //     .then(res => setStudentsList(res.data))
  //     .catch(err => console.error(err));
  // }, []);
  useEffect(() => {
    if (!isActiveTab) {
      setActiveSection("table"); // tab inactive → reset section
    }
  }, [isActiveTab]);
  // Dummy data
  const [students, setStudents] = useState([
    { id: 1, name: "Aman Sharma", course: "B.Tech (CSE)", year: "2nd", email: "aman.sharma@example.com" },
    { id: 2, name: "Priya Verma", course: "MBA", year: "1st", email: "priya.verma@example.com" },
    { id: 3, name: "Rohit Kumar", course: "B.Sc (Physics)", year: "3rd", email: "rohit.kumar@example.com" },
    { id: 4, name: "Simran Kaur", course: "B.Com", year: "2nd", email: "simran.kaur@example.com" },
    { id: 5, name: "Aditya Mehta", course: "M.Tech (AI)", year: "1st", email: "aditya.mehta@example.com" },
  ]);

  // Add Student dummy handler
  const handleAddStudent = () => {
    
    // setShowAddForm(!showAddForm);
    setActiveSection("addStudent"); 
  };
  const handleDeleteStudent = (id) => {
  const updatedStudents = students.filter((student) => student.id !== id);
  setStudents(updatedStudents);
};
const handleStudentAdded = (newStudent) => {
  setStudents(prevStudents => [...prevStudents, newStudent]); // table me add
  setActiveSection("table"); // form submit ke baad table active
};
const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.course.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="manage-students">
      <h2>Student Management</h2>

      {/* Cards Section */}
      <div className="stcards">
        <div className="stcard" onClick={handleAddStudent}>
          <h3>Add Student</h3>
          <p>Add a new student to the system.</p>
        </div>
        <div className="stcard">
          <h3>Manage Students</h3>
          <p>View, edit, or delete student details.</p>
        </div>
      </div>
      {/* {activeSection === "addStudent" && <AddStudentForm />} */}
      {activeSection === "addStudent" && 
        <AddStudentForm onStudentAdded={handleStudentAdded} />
      }
      
      {/* Student Table */}
      {activeSection === "table" && (
      <div className="students-list">
        <div className="students-header">
        <h3>All Students</h3>
        <input
          type="text"
          placeholder="Search by name or course..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="student-search"
        />
      </div>
        <table className="students-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Course</th>
              <th>Year</th>
              <th>email</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id}>
                <td>{student.id}</td>
                <td>{student.name}</td>
                <td>{student.course}</td>
                <td>{student.year}</td>
                <td>{student.email}</td>
                <td>
                  <button>Edit</button>
                  <button
                    style={{ marginLeft: "8px" }}
                    onClick={() => handleDeleteStudent(student.id)}
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
