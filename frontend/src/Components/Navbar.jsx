import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  TextField,
} from "@mui/material";

const NAV_LINKS = [
  { to: "/home", label: "Home" },
  { to: "/features", label: "Features" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

const GRADIENT = "linear-gradient(to right, #4f46e5, #9333ea, #ec4899)";

const Navbar = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const linkStyle = ({ isActive }) => ({
    color: "#fff",
    textDecoration: "none",
    fontWeight: isActive ? 700 : 500,
  });

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{ background: GRADIENT }}
    >
      <Toolbar
        sx={{
          maxWidth: 1200,
          mx: "auto",
          width: "100%",
          height: 64,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <Typography
          onClick={() => navigate(isAuthenticated ? "/home" : "/login")}
          sx={{
            fontSize: "1.5rem",
            fontWeight: 800,
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Node{" "}
          <Box component="span" sx={{ color: "#eefa15" }}>
            Link
          </Box>
        </Typography>

        {/* Center Menu */}
        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            gap: 4,
            alignItems: "center",
          }}
        >
          {NAV_LINKS.map((link) => (
            <Box
              key={link.to}
              component={NavLink}
              to={link.to}
              style={linkStyle}
              sx={{
                "&:hover": { color: "#facc15 !important" },
                transition: "0.2s",
              }}
            >
              {link.label}
            </Box>
          ))}
        </Box>



      </Toolbar>
    </AppBar>
  );
};

export default Navbar;