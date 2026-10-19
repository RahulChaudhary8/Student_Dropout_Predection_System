import { createTheme } from "@mui/material/styles";

// Design tokens
// Primary (sidebar/brand): deep slate-navy — institutional, calm authority
// Accent (interactive/active state): crisp azure — clarity, focus
// Risk tones: amber (medium), crimson (high), emerald (low/on-track)
const theme = createTheme({
    palette: {
        primary: {
            main: "#2563eb",      // azure accent
            dark: "#1d4ed8",
            light: "#60a5fa",
        },
        secondary: {
            main: "#0f172a",      // deep slate navy (sidebar base)
            light: "#1e293b",
        },
        error: {
            main: "#dc2626",      // crimson — high risk
        },
        warning: {
            main: "#d97706",      // amber — medium risk / pending
        },
        success: {
            main: "#059669",      // emerald — on track
        },
        background: {
            default: "#f1f5f9",
            paper: "#ffffff",
        },
        text: {
            primary: "#0f172a",
            secondary: "#64748b",
        },
    },
    typography: {
        fontFamily: "'Inter', 'Segoe UI', Roboto, sans-serif",
        h2: { fontWeight: 700, letterSpacing: "-0.02em" },
        h3: { fontWeight: 700, letterSpacing: "-0.01em" },
        h6: { fontWeight: 600 },
        button: { fontWeight: 600, textTransform: "none" },
    },
    shape: {
        borderRadius: 12,
    },
    components: {
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: "none",
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                },
            },
        },
    },
});

export default theme;