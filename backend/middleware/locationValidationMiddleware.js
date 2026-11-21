import Quiz from "../models/Quiz.js";
import { calculateDistance } from "../utils/calculateDistance.js";

export async function validateQuizLocation(req, res, next) {
  const { quizId, latitude, longitude } = req.body;
  const studentLatitude = Number(latitude);
  const studentLongitude = Number(longitude);

  if (!quizId || !Number.isFinite(studentLatitude) || !Number.isFinite(studentLongitude)) {
    return res.status(400).json({ error: "Quiz ID and valid location are required" });
  }

  const quiz = await Quiz.findById(quizId);
  if (!quiz) return res.status(404).json({ error: "Quiz not found" });

  const distance = calculateDistance(studentLatitude, studentLongitude, quiz.latitude, quiz.longitude);
  if (distance > quiz.allowedRadius) {
    return res.status(403).json({ error: "You are outside the permitted quiz area." });
  }

  req.quizLocationDistance = distance;
  req.activeQuiz = quiz;
  next();
}
