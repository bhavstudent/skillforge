import { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const storedUser = localStorage.getItem("skillforge_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        localStorage.removeItem("skillforge_user");
      }
    }
    setLoading(false);
  }, []);

  // Register User
  const register = useCallback(async (name, email, password) => {
    setError(null);
    try {
      const response = await fetch("http://localhost:8000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Registration failed");
      }

      await response.json();

      //After register, auto-login to get token
      const loginResult = await login(email, password);
      return loginResult;

    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []); // login added below via ref pattern — see note

  // Login User
  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const response = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Login failed");
      }

      const data = await response.json();

      // Backend returns data.user — not data directly
      const userData = {
        user_id: data.user.user_id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        is_active: data.user.is_active,
        created_at: data.user.created_at,
      };

      // Save token AND full user object
      localStorage.setItem("skillforge_token", data.access_token);
      localStorage.setItem("skillforge_user", JSON.stringify(userData));
      setUser(userData);

      return { success: true, user: userData };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

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

  // Logout User
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("skillforge_user");
    localStorage.removeItem("skillforge_token");
    window.location.href = "/login";
  }, []);

  // Update User
  const updateUser = useCallback((updatedData) => {
    setUser(prev => {
      const updated = { ...prev, ...updatedData };
      localStorage.setItem("skillforge_user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user,
    userId: user?.user_id,
    authFetch
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}