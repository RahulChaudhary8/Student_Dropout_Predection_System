import crypto from "crypto";
import Counter from "../models/Counter.js";
import Student from "../models/Student.js";

// ===========================================================================
// Centralized Student ID + password generation.
// Used by BOTH the single "Add Student" form route AND the bulk Excel
// import route, so IDs/passwords are always generated the same way no
// matter which path a student came in through.
// ===========================================================================

const STUDENT_ID_PREFIX = "ST";
const STUDENT_ID_PAD = 3; // ST001, ST002, ... ST999, ST1000...

// Generates the next sequential Student ID atomically (safe for concurrent
// calls, e.g. many rows of a bulk import being processed at once).
export const generateStudentId = async () => {
    const counter = await Counter.findOneAndUpdate(
        { _id: "studentId" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );
    return STUDENT_ID_PREFIX + String(counter.seq).padStart(STUDENT_ID_PAD, "0");
};

// If a legacy/migrated Student ID like "ST087" is supplied directly
// (instead of being generated), make sure our counter is bumped past it —
// otherwise a future auto-generated ID could collide with it.
export const bumpCounterPastId = async (studentId) => {
    const match = /^ST(\d+)$/.exec((studentId || "").trim());
    if (!match) return; // non-standard legacy ID format — nothing to bump
    const num = parseInt(match[1], 10);
    if (isNaN(num)) return;

    await Counter.findOneAndUpdate(
        { _id: "studentId" },
        [{ $set: { seq: { $max: ["$seq", num] } } }],
        { upsert: true }
    );
};

// One-time bootstrap: if the counter collection is empty (e.g. first run
// after adding this system to an app that already has students), seed it
// from the highest existing numeric Student ID already in the DB so newly
// generated IDs never collide with pre-existing ones.
export const ensureCounterSeeded = async () => {
    const existing = await Counter.findById("studentId");
    if (existing) return; // already seeded, nothing to do

    const students = await Student.find({ studentId: { $regex: /^ST\d+$/ } }, "studentId");
    let maxNum = 0;
    students.forEach((s) => {
        const match = /^ST(\d+)$/.exec(s.studentId);
        if (match) maxNum = Math.max(maxNum, parseInt(match[1], 10));
    });

    await Counter.create({ _id: "studentId", seq: maxNum });
};

// Generates a random plain-text password (used before hashing).
export const generatePassword = (length = 8) =>
    crypto.randomBytes(Math.ceil(length / 2)).toString("hex").slice(0, length);

// ===========================================================================
// resolveStudentIdentity — the single decision point both registration
// flows call to figure out a student's Student ID + password.
//
// Normal case (form registration, or a bulk-import row with the Student ID
// / password columns left BLANK): always auto-generate both, fresh.
//
// Migration case (a bulk-import row that already has a Student ID and/or
// password filled in, e.g. importing students from an old system): use
// what's given, but validate it — check for a pre-existing student with
// that ID so we never silently create a duplicate, and bump the counter
// past any legacy numeric ID so future auto-generated IDs stay unique.
// ===========================================================================
export const resolveStudentIdentity = async ({ studentId, password } = {}) => {
    const providedId = (studentId || "").toString().trim();
    const providedPassword = (password || "").toString().trim();

    if (!providedId) {
        // Fresh registration — system assigns everything.
        const newId = await generateStudentId();
        const plainPassword = generatePassword(8);
        return {
            studentId: newId,
            plainPassword,
            isMigrated: false,
            existingStudent: null,
        };
    }

    // Migration case — Student ID was supplied explicitly.
    const existingStudent = await Student.findOne({ studentId: providedId });
    await bumpCounterPastId(providedId);

    return {
        studentId: providedId,
        // If a password was also supplied, keep it; otherwise generate one
        // even in the migration case (e.g. legacy ID present, but no password
        // column filled in for this particular row).
        plainPassword: providedPassword || generatePassword(8),
        isMigrated: true,
        existingStudent, // non-null if this ID already exists in the DB
    };
};