import express from "express";
import Class from "../models/Class.js";
import Mentor from "../models/Mentor.js";

const router = express.Router();

// GET all classes
router.get("/", async (req, res) => {
    try {
        const classes = await Class.find().sort({ branch: 1, year: 1, section: 1 });
        res.json(classes);
    } catch (err) {
        res.status(500).json({ message: "Error fetching classes", error: err.message });
    }
});

// POST create a new class
router.post("/", async (req, res) => {
    try {
        const { branch, year, section } = req.body;
        if (!branch || !year) {
            return res.status(400).json({ message: "Branch and year are required" });
        }
        const newClass = new Class({ branch, year, section });
        await newClass.save();
        res.status(201).json(newClass);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ message: "This class already exists" });
        }
        res.status(500).json({ message: "Error creating class", error: err.message });
    }
});

// DELETE a class
router.delete("/:id", async (req, res) => {
    try {
        const deleted = await Class.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: "Class not found" });
        }

        // Also remove this class from any mentor's assignedClasses
        await Mentor.updateMany(
            { assignedClasses: req.params.id },
            { $pull: { assignedClasses: req.params.id } }
        );

        res.json({ message: "Class deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting class", error: err.message });
    }
});

export default router;