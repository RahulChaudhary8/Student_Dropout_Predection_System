import express from "express";
import Payment from "../models/Payment.js";
import Student from "../models/Student.js";

const router = express.Router();

// POST - Add Payment
router.post("/", async (req, res) => {
  try {
    const { studentId, amount, date, mode, remarks } = req.body;

    const student = await Student.findOne({ studentId });
    if (!student) return res.status(404).json({ error: "Student not found" });

    student.paidFees = (student.paidFees || 0) + Number(amount);

    // Recompute status using the correct field name (totalCourseFees) and
    // accounting for Overdue (paid < total AND due date has passed).
    if (student.paidFees >= student.totalCourseFees) {
      student.tuitionFeesUpToDate = "Yes";
    } else if (student.dueDate && new Date() > new Date(student.dueDate)) {
      student.tuitionFeesUpToDate = "Overdue";
    } else {
      student.tuitionFeesUpToDate = "No";
    }

    await student.save();

    const payment = new Payment({ studentId, amount, date, mode, remarks });
    await payment.save();

    res.json({ msg: "Payment recorded successfully", payment, student });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to record payment" });
  }
});

// GET - Fetch ALL payments (Admin view)
router.get("/", async (req, res) => {
  try {
    const payments = await Payment.find().sort({ date: -1 });
    res.json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch payments" });
  }
});

// GET - Fetch one student's payment history
router.get("/student/:studentId", async (req, res) => {
  try {
    const payments = await Payment.find({ studentId: req.params.studentId }).sort({ date: -1 });
    res.json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch payment history" });
  }
});

export default router;