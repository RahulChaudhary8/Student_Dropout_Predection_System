import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Avatar,
  Typography,
  TextField,
  InputAdornment,
  Button,
  IconButton,
  Fade,
  Grow,
} from "@mui/material";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import MailRoundedIcon from "@mui/icons-material/MailRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";

export default function AdminLogin({ handleSubmit, email, setEmail, password, setPassword }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Box
      sx={{
        minHeight: "80vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 2.5,
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      <Grow in timeout={500}>
        <Card
          elevation={0}
          className="transition-all duration-300"
          sx={{
            width: 360,
            borderRadius: 4,
            textAlign: "center",
            boxShadow: "0 15px 35px rgba(0,0,0,0.2)",
            "&:hover": {
              transform: "translateY(-5px)",
              boxShadow: "0 25px 50px rgba(0,0,0,0.3)",
            },
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Fade in timeout={600}>
              <Box className="flex flex-col items-center mb-6">
                <Avatar
                  sx={{
                    bgcolor: "transparent",
                    background: "linear-gradient(135deg, #667eea, #764ba2)",
                    width: 64,
                    height: 64,
                    mb: 1.5,
                  }}
                >
                  <ShieldRoundedIcon sx={{ fontSize: 32 }} />
                </Avatar>
                <Typography variant="h5" sx={{ fontWeight: 700, color: "#333" }}>
                  Admin Login
                </Typography>
              </Box>
            </Fade>

            <Box
              component="form"
              onSubmit={handleSubmit}
              className="flex flex-col gap-4"
            >
              <TextField
                fullWidth
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MailRoundedIcon sx={{ color: "#764ba2" }} fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockRoundedIcon sx={{ color: "#764ba2" }} fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setShowPassword((prev) => !prev)}
                        edge="end"
                      >
                        {showPassword ? (
                          <VisibilityOffRoundedIcon fontSize="small" />
                        ) : (
                          <VisibilityRoundedIcon fontSize="small" />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                startIcon={<LoginRoundedIcon />}
                className="transition-all duration-300"
                sx={{
                  py: 1.3,
                  mt: 1,
                  color: "#fff",
                  fontWeight: 700,
                  background: "linear-gradient(135deg, #667eea, #764ba2)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #764ba2, #667eea)",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                Login
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grow>
    </Box>
  );
}