import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Avatar,
  Fade,
  Grow,
  Slide,
} from "@mui/material";
import MailRoundedIcon from "@mui/icons-material/MailRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Message Sent! ✅");
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: { xs: 6, md: 8 },
        px: 2,
        textAlign: "center",
        background: "linear-gradient(135deg, #e6f0ff 0%, #f9f9ff 100%)",
      }}
    >
      <Fade in timeout={600}>
        <Box>
          {/* Header */}
          <Slide in direction="down" timeout={500}>
            <Box sx={{ mb: 4 }}>
              <Avatar
                sx={{
                  bgcolor: "primary.main",
                  width: 60,
                  height: 60,
                  mx: "auto",
                  mb: 2,
                  boxShadow: "0 10px 24px -8px rgba(37, 99, 235, 0.5)",
                }}
              >
                <MailRoundedIcon sx={{ fontSize: 30 }} />
              </Avatar>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  color: "secondary.main",
                  letterSpacing: "-0.02em",
                  fontSize: { xs: "1.8rem", md: "2.4rem" },
                }}
              >
                Contact Us
              </Typography>
              <Typography variant="h6" sx={{ color: "text.secondary", mt: 1, fontWeight: 500 }}>
                Have questions or feedback? Get in touch with us!
              </Typography>
            </Box>
          </Slide>

          {/* Form */}
          <Grow in timeout={550}>
            <Card
              elevation={0}
              sx={{
                maxWidth: 500,
                mx: "auto",
                borderRadius: 4,
                border: "1px solid #e2e8f0",
                boxShadow: "0 10px 30px -10px rgba(15, 23, 42, 0.12)",
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box
                  component="form"
                  onSubmit={handleSubmit}
                  className="flex flex-col gap-4"
                >
                  <TextField
                    fullWidth
                    name="name"
                    label="Your Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                  <TextField
                    fullWidth
                    type="email"
                    name="email"
                    label="Your Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  <TextField
                    fullWidth
                    name="message"
                    label="Your Message"
                    multiline
                    rows={1}
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    endIcon={<SendRoundedIcon />}
                    className="transition-all duration-300"
                    sx={{
                      py: 1.3,
                      fontWeight: 700,
                      "&:hover": {
                        transform: "scale(1.03)",
                        boxShadow: "0 10px 20px -6px rgba(37, 99, 235, 0.5)",
                      },
                    }}
                  >
                    Send Message
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grow>
        </Box>
      </Fade>
    </Box>
  );
};

export default Contact;