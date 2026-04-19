import { createContext, useContext, useState, useEffect, useCallback } from "react";
import API_BASE from "../config";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("skillforge_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("skillforge_user");
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Login failed");
      }

      const data = await response.json();
      const userData = {
        user_id: data.user.user_id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        is_active: data.user.is_active,
        created_at: data.user.created_at
      };

      localStorage.setItem("skillforge_token", data.access_token);
      localStorage.setItem("skillforge_user", JSON.stringify(userData));
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Registration failed");
      }

      return await login(email, password);
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [login]);

  const authFetch = useCallback((url, options = {}) => {
    const token = localStorage.getItem("skillforge_token");
    return fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        ...options.headers
      }
    });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("skillforge_user");
    localStorage.removeItem("skillforge_token");
    window.location.href = "/login";
  }, []);

  const updateUser = useCallback((updatedData) => {
    setUser(prev => {
      const updated = { ...prev, ...updatedData };
      localStorage.setItem("skillforge_user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{
      user, loading, error,
      register, login, logout, updateUser,
      isAuthenticated: !!user,
      userId: user?.user_id,
      authFetch
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}