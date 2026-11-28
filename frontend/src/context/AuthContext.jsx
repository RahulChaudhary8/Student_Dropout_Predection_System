// src/context/AuthContext.jsx
import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // add this
import { AuthContext } from "./AuthContextStore";


export function AuthProvider({ children }) {
  const [token, setToken] = useState(null); // JWT or server token
  const [user, setUser] = useState(null); // optional user object
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    navigate("/home");
  }, [navigate]);

  // on mount, check localStorage for existing token
  useEffect(() => {
    const initAuth = async () => {
      console.log("🔄 Auth initializing...");
      const t = localStorage.getItem("token");
      const u = localStorage.getItem("user");
      console.log("📦 Stored token:", t);
      console.log("📦 Stored user:", u);

      if (t) {
        setToken(t);
        try {
          setUser(u ? JSON.parse(u) : null);
        } catch {
          setUser(null);
        }
        if (API_URL) {
          try {
            const res = await axios.get(`${API_URL}/auth/verify-token`, {
              headers: { Authorization: `Bearer ${t}` },
            });

            console.log("✅ Verify result:", res.data);

            if (!res?.data?.success) {
              console.log("❌ Invalid token → logout");
              logout(); // invalid token -> clear storage
            }
          } catch (err) {
            console.error("🚨 Verify error:", err);
            logout();
          }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [API_URL, logout]);

  // login helper: store token and user in state + localStorage
  const login = ({ token: newToken, user: newUser }) => {
    if (!newToken) return;
    localStorage.setItem("token", newToken);
    if (newUser) localStorage.setItem("user", JSON.stringify(newUser));
    setToken(newToken);
    if (newUser) setUser(newUser);
  };

  // logout helper: clear storage + state

  const value = {
    token,
    user,
    login,
    logout,
    isAuthenticated: !!token,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

