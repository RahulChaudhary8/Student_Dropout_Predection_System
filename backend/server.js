import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import notifyRoutes from "./routes/notify.js";
import mentorNotifyRoutes from "./routes/mentorNotify.js";
import studentRoutes from "./routes/studentRoutes.js";
import mentorRoutes from './routes/mentorRoutes.js';
import attendanceRoutes from "./routes/attendanceRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import notifyCounsellor from "./routes/notifyCounsellor.js";
import dashstudentRoutes from "./routes/dashstudentRoutes.js";
import roleAuthRouter from "./routes/roleAuth.js";
import studentProfileRoutes from "./routes/studentProfile.js";
import mentorProfileRoutes from "./routes/mentorProfile.js";
import quizRoutes from "./routes/QuizRoutes.js";

import notesRouter from "./routes/notes.js";
import leaveRoutes from "./routes/leaveRoutes.js";

import classRoutes from "./routes/classRoutes.js";
import academicRoutes from "./routes/academicRoutes.js";
import timetableRoutes from "./routes/timetableRoutes.js";
import interventionRoutes from "./routes/interventionRoutes.js";
import resultRoutes from "./routes/resultRoutes.js";


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/notify", notifyRoutes);
app.use("/api/mentor-notify", mentorNotifyRoutes);
app.use("/api/students", studentRoutes);
app.use('/api/mentors', mentorRoutes);
app.use("/attendance", attendanceRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/notifycounsellor", notifyCounsellor);
app.use("/students", dashstudentRoutes);
app.use("/api/role-auth", roleAuthRouter);
app.use("/api/student-profile", studentProfileRoutes);
app.use("/api/mentor-profile", mentorProfileRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/questions", quizRoutes);
app.use("/api/mentor", quizRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/notes", notesRouter);
app.use("/api/classes", classRoutes);
app.use("/api/academics", academicRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/interventions", interventionRoutes);
app.use("/api/results", resultRoutes);


// MongoDB connection with FrontendDb
const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.error("❌ MONGO_URI is not configured");
  process.exit(1);
}

const port = Number(process.env.PORT) || 5000;

mongoose
  .connect(mongoUri)
  .then(() => {
    app.listen(port, () =>
      console.log(`✅ Server running on port ${port}, DB: FrontendDb`)
    );
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });
