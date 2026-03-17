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

      const data = await response.json();
      
      const userData = {
        user_id: data.user_id,
        name: data.name,
        email: data.email
      };
      
      setUser(userData);
      localStorage.setItem("skillforge_user", JSON.stringify(userData));
      
      return { success: true, user: userData };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

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
      
      const userData = {
        user_id: data.user_id,
        name: data.name,
        email: data.email
      };
      
      setUser(userData);
      localStorage.setItem("skillforge_user", JSON.stringify(userData));
      
      return { success: true, user: userData };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  // Logout User
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("skillforge_user");
    window.location.href = "/login";
  }, []);

  // Update User
  const updateUser = useCallback((updatedData) => {
    setUser(prev => ({ ...prev, ...updatedData }));
    localStorage.setItem("skillforge_user", JSON.stringify({ ...user, ...updatedData }));
  }, [user]);

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user,
    userId: user?.user_id
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}