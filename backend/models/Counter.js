import mongoose from "mongoose";

// A tiny generic counter collection used for atomic auto-increment IDs
// (e.g. Student IDs). Using $inc via findOneAndUpdate is atomic in
// MongoDB, so this is safe even when many rows are being created
// concurrently during a bulk Excel import — unlike an in-memory
// JS variable, which resets on server restart and isn't safe across
// concurrent requests.
const counterSchema = new mongoose.Schema({
    _id: { type: String, required: true }, // e.g. "studentId"
    seq: { type: Number, default: 0 },
});

const Counter = mongoose.model("Counter", counterSchema);
export default Counter;