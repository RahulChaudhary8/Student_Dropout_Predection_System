import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  InputBase,
  Avatar,
  Tooltip,
  Badge,
  IconButton,
  Fade,
  Chip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

const Dashnavbar = () => {
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [avatarHovered, setAvatarHovered] = useState(false);

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        backgroundColor: "#f8fafc",
        borderBottom: "1px solid #e2e8f0",
        color: "#1e293b",
      }}
    >
      <Toolbar
        className="flex items-center justify-between px-6"
        sx={{ minHeight: "64px !important" }}
      >
        {/* Search Bar */}
        <div
          className={`
            flex items-center gap-2 px-4 py-2 rounded-xl
            transition-all duration-300 ease-in-out
            ${searchFocused
              ? "bg-white shadow-md ring-2 ring-blue-500 ring-opacity-50 w-80"
              : "bg-slate-100 hover:bg-slate-200 w-64"
            }
          `}
        >
          <SearchIcon
            className={`transition-all duration-300 ${searchFocused ? "text-blue-500 scale-110" : "text-slate-400"
              }`}
            fontSize="small"
          />
          <InputBase
            placeholder="Search student..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            sx={{
              fontSize: "0.875rem",
              color: "#1e293b",
              "& input::placeholder": { color: "#94a3b8" },
              width: "100%",
            }}
          />
          {/* Animated clear chip */}
          <div
            className={`transition-all duration-200 overflow-hidden ${searchValue ? "max-w-xs opacity-100" : "max-w-0 opacity-0"
              }`}
          >
            <Chip
              label="Clear"
              size="small"
              onClick={() => setSearchValue("")}
              sx={{
                fontSize: "0.7rem",
                height: "20px",
                backgroundColor: "#dbeafe",
                color: "#2563eb",
                cursor: "pointer",
                "&:hover": { backgroundColor: "#bfdbfe" },
              }}
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <Tooltip title="Notifications" arrow TransitionComponent={Fade}>
            <IconButton
              className="hover:scale-110 transition-transform duration-200"
              sx={{
                backgroundColor: "#f1f5f9",
                "&:hover": {
                  backgroundColor: "#e0f2fe",
                  transform: "scale(1.1)",
                },
                transition: "all 0.2s ease",
              }}
            >
              <Badge badgeContent={3} color="error">
                <NotificationsNoneIcon
                  sx={{ color: "#475569", fontSize: "1.3rem" }}
                />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Divider */}
          <div className="h-8 w-px bg-slate-200" />

          {/* User Profile */}
          <Tooltip title="View Profile" arrow TransitionComponent={Fade}>
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl cursor-pointer select-none"
              onMouseEnter={() => setAvatarHovered(true)}
              onMouseLeave={() => setAvatarHovered(false)}
              style={{
                backgroundColor: avatarHovered ? "#f0f9ff" : "transparent",
                border: avatarHovered
                  ? "1px solid #bae6fd"
                  : "1px solid transparent",
                transition: "all 0.25s ease",
              }}
            >
              <Avatar
                sx={{
                  width: 34,
                  height: 34,
                  backgroundColor: "#2563eb",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  boxShadow: avatarHovered
                    ? "0 0 0 3px #bfdbfe"
                    : "0 0 0 0px transparent",
                  transition: "box-shadow 0.25s ease",
                }}
              >
                AD
              </Avatar>

              <div className="flex flex-col leading-tight">
                <span
                  className="text-sm font-semibold text-slate-700"
                  style={{ lineHeight: 1.2 }}
                >
                  Admin
                </span>
                <span
                  className="text-xs text-slate-400"
                  style={{ lineHeight: 1.2 }}
                >
                  Login
                </span>
              </div>

              <KeyboardArrowDownIcon
                sx={{
                  color: "#94a3b8",
                  fontSize: "1.1rem",
                  transform: avatarHovered ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.25s ease",
                }}
              />
            </div>
          </Tooltip>
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default Dashnavbar;