import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut, User, Settings, ChevronDown } from "lucide-react";
import "../styles/navbar.css";

const SEARCH_DATA = [
  { type: "Topic", label: "OOP" },
  { type: "Topic", label: "DBMS" },
  { type: "Topic", label: "Arrays" },
  { type: "Problem", label: "Two Sum" },
  { type: "Problem", label: "Binary Search" },
  { type: "Company", label: "Google" },
  { type: "Company", label: "Amazon" },
];

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Profile dropdown state
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Search state
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false); // ✅ Fixed typo
  const searchRef = useRef(null);

  // 🔍 Search filter
  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }
    setResults(
      SEARCH_DATA.filter(item =>
        item.label.toLowerCase().includes(query.toLowerCase())
      )
    );
  }, [query]);

  // ⌨ Slash key focus for search
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "/") {
        e.preventDefault();
        document.getElementById("global-search")?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Click outside to close search OR profile dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      // Close search if clicked outside search box
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchOpen(false); // ✅ Fixed: was setIsProfileOpen
      }
      // Close profile if clicked outside profile section
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Close dropdowns when route changes
  useEffect(() => {
    setIsProfileOpen(false);
    setIsSearchOpen(false); // ✅ Fixed typo
  }, [location]);

  // Get user initials for avatar
  const getInitials = (name) => { // ✅ Fixed: added space after const
    if (!name) return "U";
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Handle logout
  const handleLogout = () => { // ✅ Fixed: consistent name (was handleLogOut)
    logout();
    setIsProfileOpen(false);
    navigate("/login");
  };

  return (
    <nav className="navbar glass">
      <div className="navbar-container">
        
        {/* LOGO */}
        <div className="nav-logo" onClick={() => navigate("/dashboard")}>
          <video 
            className="logo-video"
            src="/videos/logo.mp4"
            autoPlay
            loop
            muted
            playsInline 
          />
          <span className="logo-text">SkillForge</span>
        </div>

        {/* SEARCH */}
        <div className="navbar-search" ref={searchRef}>
          <input
            id="global-search"
            type="text"
            placeholder="Search topics, problems, companies... (Press /)"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsSearchOpen(true); // ✅ Fixed: use isSearchOpen
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && results.length > 0) {
                console.log("Selected:", results[0]);
                setQuery("");
                setIsSearchOpen(false); // ✅ Fixed: use isSearchOpen
              }
            }}
          />

          {isSearchOpen && results.length > 0 && ( // ✅ Fixed: use isSearchOpen
            <div className="search-dropdown">
              {results.map((item, index) => (
                <div
                  key={index}
                  className="search-item"
                  onClick={() => {
                    console.log("Selected:", item);
                    setQuery("");
                    setIsSearchOpen(false); // ✅ Fixed: use isSearchOpen
                  }}
                >
                  <span className={`tag ${item.type.toLowerCase()}`}>
                    {item.type}
                  </span>
                  {item.label}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT ACTIONS - Conditional based on auth state */}
        <div className="nav-actions">
          {isAuthenticated && user ? (
            // ✅ LOGGED IN: Show Profile Avatar + Dropdown
            <div className="profile-section" ref={profileRef}>
              <button 
                className="profile-trigger"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                aria-label="Open profile menu"
              >
                <div className="profile-avatar">
                  {getInitials(user.name)}
                </div>
                <span className="profile-name">{user.name?.split(" ")[0]}</span>
                <ChevronDown 
                  size={16} 
                  className={`profile-arrow ${isProfileOpen ? "open" : ""}`} 
                />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileOpen && (
                <div className="profile-dropdown">
                  <div className="dropdown-header"> {/* ✅ Fixed typo: was dropdown-heaader */}
                    <div className="dropdown-avatar">
                      {getInitials(user.name)}
                    </div>
                    <div>
                      <p className="dropdown-name">{user.name}</p>
                      <p className="dropdown-email">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="dropdown-divider"></div>
                  
                  <button 
                    className="dropdown-item" 
                    onClick={() => { setIsProfileOpen(false); navigate("/profile"); }}
                  >
                    <User size={16} />
                    My Profile
                  </button>
                  <button 
                    className="dropdown-item" 
                    onClick={() => { setIsProfileOpen(false); navigate("/profile#settings"); }}
                  >
                    <Settings size={16} />
                    Settings
                  </button>
                  
                  <div className="dropdown-divider"></div>
                  
                  <button className="dropdown-item logout" onClick={handleLogout}> {/* ✅ Fixed: handleLogout */}
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            // ✅ NOT LOGGED IN: Show Login/Signup/Upgrade
            <>
              <span 
                className="nav-link" 
                onClick={() => navigate("/login")}
              >
                Login
              </span>
              <span 
                className="nav-link" 
                onClick={() => navigate("/register")}
              >
                Signup
              </span>
              <button className="premium-btn" onClick={() => navigate("/payments")}>
                Upgrade
              </button>
            </>
          )}
        </div>

      </div>
    </nav>
  );
}