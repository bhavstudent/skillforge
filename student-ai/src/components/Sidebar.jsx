import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Bot,
  BookOpen,
  Briefcase,
  TrendingUp,
  User,
} from "lucide-react";
import "../styles/sidebar.css";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setCollapsed(window.innerWidth <= 900);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: Bot, label: "Ask AI", path: "/ask" },
    { icon: BookOpen, label: "Tasks", path: "/tasks" },
    { icon: Briefcase, label: "Interview", path: "/interview" },
    { icon: TrendingUp, label: "Progress", path: "/progress" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  const handleClick = (path) => {
    navigate(path);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      {menuItems.map((item) => {
        const IconComponent = item.icon;
        const active = isActive(item.path);

        return (
          <div
            className={`side-item ${active ? "active" : ""}`}
            key={item.label}
            onClick={() => handleClick(item.path)}
          >
            <span className="sidebar-icon">
              <IconComponent size={20} strokeWidth={2} />
            </span>

            {!collapsed && (
              <span className="sidebar-text">{item.label}</span>
            )}

            {collapsed && (
              <span className="tooltip">{item.label}</span>
            )}
          </div>
        );
      })}
    </aside>
  );
}