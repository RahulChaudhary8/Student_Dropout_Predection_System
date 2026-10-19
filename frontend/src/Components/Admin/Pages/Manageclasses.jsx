import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    TextField,
    Button,
    Chip,
    IconButton,
    Tooltip,
    Fade,
    Grow,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import ClassRoundedIcon from "@mui/icons-material/ClassRounded";

export default function ManageClasses() {
    const [classes, setClasses] = useState([]);
    const [form, setForm] = useState({ branch: "", year: "", section: "" });
    const [error, setError] = useState("");

    const fetchClasses = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/classes");
            const data = await res.json();
            setClasses(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchClasses();
    }, []);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleAddClass = async (e) => {
        e.preventDefault();
        setError("");
        if (!form.branch.trim() || !form.year.trim()) {
            setError("Branch aur Year required hain");
            return;
        }
        try {
            const res = await fetch("http://localhost:5000/api/classes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (res.ok) {
                setClasses((prev) => [...prev, data]);
                setForm({ branch: "", year: "", section: "" });
            } else {
                setError(data.message || "Error adding class");
            }
        } catch (err) {
            console.error(err);
            setError("Server error");
        }
    };

    const handleDeleteClass = async (id) => {
        try {
            const res = await fetch(`http://localhost:5000/api/classes/${id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                setClasses((prev) => prev.filter((c) => c._id !== id));
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <Fade in timeout={400}>
            <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                    Manage Classes / Branches
                </Typography>

                {/* Add class form */}
                <Card elevation={0} sx={{ border: "1px solid #e2e8f0", mb: 3 }}>
                    <CardContent>
                        <Box
                            component="form"
                            onSubmit={handleAddClass}
                            className="flex flex-wrap items-start gap-3"
                        >
                            <TextField
                                label="Branch"
                                name="branch"
                                placeholder="e.g. CSE"
                                value={form.branch}
                                onChange={handleChange}
                                size="small"
                            />
                            <TextField
                                label="Year"
                                name="year"
                                placeholder="e.g. 3rd Year"
                                value={form.year}
                                onChange={handleChange}
                                size="small"
                            />
                            <TextField
                                label="Section (optional)"
                                name="section"
                                placeholder="e.g. A"
                                value={form.section}
                                onChange={handleChange}
                                size="small"
                            />
                            <Button
                                type="submit"
                                variant="contained"
                                startIcon={<AddRoundedIcon />}
                                sx={{ height: 40 }}
                            >
                                Add Class
                            </Button>
                        </Box>
                        {error && (
                            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                                {error}
                            </Typography>
                        )}
                    </CardContent>
                </Card>

                {/* List of classes */}
                {classes.length === 0 ? (
                    <Card
                        elevation={0}
                        sx={{ border: "1px solid #e2e8f0" }}
                        className="flex flex-col items-center justify-center py-12"
                    >
                        <ClassRoundedIcon sx={{ fontSize: 40, color: "text.secondary", mb: 1 }} />
                        <Typography color="text.secondary">Koi class add nahi ki gayi.</Typography>
                    </Card>
                ) : (
                    <Grid container spacing={2}>
                        {classes.map((cls) => (
                            <Grid item xs={12} sm={6} md={4} key={cls._id}>
                                <Grow in timeout={350}>
                                    <Card elevation={0} sx={{ border: "1px solid #e2e8f0" }}>
                                        <CardContent className="flex items-center justify-between">
                                            <Box>
                                                <Typography sx={{ fontWeight: 700 }}>
                                                    {cls.branch} - {cls.year}
                                                </Typography>
                                                {cls.section && (
                                                    <Chip
                                                        label={`Section ${cls.section}`}
                                                        size="small"
                                                        sx={{ mt: 0.5 }}
                                                    />
                                                )}
                                            </Box>
                                            <Tooltip title="Delete class">
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleDeleteClass(cls._id)}
                                                >
                                                    <DeleteRoundedIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </CardContent>
                                    </Card>
                                </Grow>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Box>
        </Fade>
    );
}