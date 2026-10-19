import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    FormGroup,
    FormControlLabel,
    Checkbox,
    Typography,
    Box,
} from "@mui/material";

export default function AssignClassesDialog({ open, onClose, mentor, onSaved }) {
    const [allClasses, setAllClasses] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!open) return;

        const fetchClasses = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/classes");
                const data = await res.json();
                setAllClasses(data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchClasses();

        // Pre-check classes already assigned to this mentor
        const currentIds = (mentor?.assignedClasses || []).map((c) =>
            typeof c === "string" ? c : c._id
        );
        setSelectedIds(currentIds);
    }, [open, mentor]);

    const handleToggle = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(
                `http://localhost:5000/api/mentors/${mentor._id}/assign-classes`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ classIds: selectedIds }),
                }
            );
            const data = await res.json();
            if (res.ok) {
                onSaved(data); // updated mentor with populated assignedClasses
                onClose();
            } else {
                alert(data.message || "Error assigning classes");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle sx={{ fontWeight: 700 }}>
                Assign Classes {mentor ? `- ${mentor.name}` : ""}
            </DialogTitle>
            <DialogContent dividers>
                {allClasses.length === 0 ? (
                    <Typography color="text.secondary">
                        Koi class available nahi hai. Pehle "Manage Classes" me class add karein.
                    </Typography>
                ) : (
                    <FormGroup>
                        {allClasses.map((cls) => (
                            <FormControlLabel
                                key={cls._id}
                                control={
                                    <Checkbox
                                        checked={selectedIds.includes(cls._id)}
                                        onChange={() => handleToggle(cls._id)}
                                    />
                                }
                                label={
                                    <Box>
                                        {cls.branch} - {cls.year}
                                        {cls.section ? ` (Section ${cls.section})` : ""}
                                    </Box>
                                }
                            />
                        ))}
                    </FormGroup>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="contained" onClick={handleSave} disabled={saving}>
                    {saving ? "Saving..." : "Save"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}