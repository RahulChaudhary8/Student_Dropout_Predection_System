import React, { useState } from "react";
import axios from "axios";
import "./AddStudentForm.css"; // styling alag rakho

const AddStudentForm = ({ onStudentAdded }) => {
  const [studentData, setStudentData] = useState({
    studentName: "",
    studentId: "",
    email: "",          // added
    phoneNumber: "",  
    course: "",
    maritalStatus: "",
    applicationMode: "",
    applicationOrder: "",
    daytimeAttendance: "",
    previousQualification: "",
    previousQualificationGrade: "",
    nationality: "",
    motherQualification: "",
    fatherQualification: "",
    motherOccupation: "",
    fatherOccupation: "",
    admissionGrade: "",
    displaced: "",
    educationalSpecialNeeds: "",
    debtor: "",
    tuitionFeesUpToDate: "",
    gender: "",
    scholarshipHolder: "",
    ageAtEnrollment: "",
    international: "",
    curricularUnits1stSemCredited: "",
    curricularUnits1stSemEnrolled: "",
    curricularUnits1stSemEvaluations: "",
    curricularUnits1stSemApproved: "",
    curricularUnits1stSemGrade: "",
    curricularUnits1stSemWithoutEvaluations: "",
    curricularUnits2ndSemCredited: "",
    curricularUnits2ndSemEnrolled: "",
    curricularUnits2ndSemEvaluations: "",
    curricularUnits2ndSemApproved: "",
    curricularUnits2ndSemGrade: "",
    curricularUnits2ndSemWithoutEvaluations: "",
    unemploymentRate: "",
    inflationRate: "",
    GDP: ""
  });

  const handleChange = (e) => {
    setStudentData({...studentData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
    //   const res = await axios.post("http://localhost:5000/admin/addStudent", studentData);
    //   alert(res.data.message);
      
    //   if(onStudentAdded){
    //     onStudentAdded({
    //       id: res.data.newStudentId || Date.now(), // ya backend id
    //       name: studentData.studentName,
    //       course: studentData.course,
    //       year: studentData.year || "N/A",
    //       email: studentData.email || "N/A"
    //     });
    //     // if(onStudentAdded){
    //     // onStudentAdded(newStudent);
    //     // }
    //   }
    if(onStudentAdded){
        const newStudent = {
            id: Date.now(), // temporary unique id
            name: studentData.studentName,
            course: studentData.course,
            year: studentData.year || "N/A",
            email: studentData.email || "N/A"
        };
        onStudentAdded(newStudent);
    }
      // Reset form
      setStudentData({
        studentName: "",
        studentId: "",
        email: "",          // added
    phoneNumber: "",  
        course: "",
        maritalStatus: "",
        applicationMode: "",
        applicationOrder: "",
        daytimeAttendance: "",
        previousQualification: "",
        previousQualificationGrade: "",
        nationality: "",
        motherQualification: "",
        fatherQualification: "",
        motherOccupation: "",
        fatherOccupation: "",
        admissionGrade: "",
        displaced: "",
        educationalSpecialNeeds: "",
        debtor: "",
        tuitionFeesUpToDate: "",
        gender: "",
        scholarshipHolder: "",
        ageAtEnrollment: "",
        international: "",
        curricularUnits1stSemCredited: "",
        curricularUnits1stSemEnrolled: "",
        curricularUnits1stSemEvaluations: "",
        curricularUnits1stSemApproved: "",
        curricularUnits1stSemGrade: "",
        curricularUnits1stSemWithoutEvaluations: "",
        curricularUnits2ndSemCredited: "",
        curricularUnits2ndSemEnrolled: "",
        curricularUnits2ndSemEvaluations: "",
        curricularUnits2ndSemApproved: "",
        curricularUnits2ndSemGrade: "",
        curricularUnits2ndSemWithoutEvaluations: "",
        unemploymentRate: "",
        inflationRate: "",
        GDP: ""
      });
    } catch (err) {
      console.error(err);
      alert("Error adding student");
    }
  };

  return (
    <div className="form-container">
      <h2> Add Student</h2>
      <form onSubmit={handleSubmit}>
        {Object.keys(studentData).map((key) => (
          <input
            key={key}
            type="text"
            name={key}
            placeholder={key.replace(/([A-Z])/g, ' $1')}
            value={studentData[key]}
            onChange={handleChange}
            required
          />
        ))}
        <button type="submit">Add Student</button>
        
      </form>
    </div>
  );
};

export default AddStudentForm;
