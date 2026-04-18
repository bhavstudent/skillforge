import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import RightPanel from "../components/RightPanel";
import "../styles/dashboard.css";

const quotes = [
    "Every expert was once a beginner. Keep going! 🔥",
    "Code a little every day. Consistency beats intensity. 💪",
    "The best time to start was yesterday. The next best time is now. 🚀",
    "You don't have to be great to start, but you have to start to be great. ⚡",
    "One problem at a time. You've got this! 🎯",
  ];

export default function Dashboard() {
  const { user, authFetch, userId } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    problemsSolved: 0,
    currentStreak: 0,
    totalXP: 0,
    languagesLearned: 0
  });
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("");
  const [quote, setQuote] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");

    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }

    const fetchStats = async () => {
      try {
        const res = await authFetch(`http://localhost:8000/profile/${userId}`);
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats || {});
          setLanguages(data.languages || []);
        }
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userId, authFetch]);

  const topLanguages = languages
    .filter(l => l.percentage > 0)
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 3);

  const langColors = {
    Python: "#3776ab",
    JavaScript: "#f7df1e",
    Java: "#f89820",
    "C++": "#00599c",
    SQL: "#336791",
    DSA: "#ff7b00",
  };

  return (
    <>
      <Navbar />
      <div className="dashboard">
        <Sidebar />

        <div className="main">

          {/* HERO GREETING */}
          <div className="dash-hero glass-liquid">
            <div className="dash-hero-orb orb-1"></div>
            <div className="dash-hero-orb orb-2"></div>
            <div className="dash-hero-content">
              <div className="dash-greeting">{greeting} 👋</div>
              <h1 className="dash-name">
                {user?.name?.split(" ")[0] || "Coder"}
                <span className="dash-name-accent"> !</span>
              </h1>
              <p className="dash-quote">"{quote}"</p>
              <div className="dash-hero-actions">
                <Link to="/tasks">
                  <button className="dash-btn-primary">
                    <span>⚡</span> Start practicing
                  </button>
                </Link>
                <Link to="/ask">
                  <button className="dash-btn-secondary">
                    <span>🤖</span> Ask Forge AI
                  </button>
                </Link>
              </div>
            </div>
            <div className="dash-hero-badge">
              <div className="badge-ring">
                <svg viewBox="0 0 80 80" width="80" height="80">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,123,0,0.15)" strokeWidth="8"/>
                  <circle cx="40" cy="40" r="34" fill="none" stroke="#ff7b00" strokeWidth="8"
                    strokeDasharray="213" strokeDashoffset={213 - (213 * Math.min(stats.problemsSolved, 100)) / 100}
                    strokeLinecap="round" transform="rotate(-90 40 40)"/>
                </svg>
                <div className="badge-ring-text">
                  <span className="badge-num">{stats.problemsSolved}</span>
                  <span className="badge-label">solved</span>
                </div>
              </div>
            </div>
          </div>

          {/* STATS ROW */}
          <div className="dash-stats">
            <div className="dash-stat-card glass" onClick={() => navigate("/progress")}>
              <div className="stat-icon-wrap" style={{ background: "rgba(255,123,0,0.15)" }}>
                <span style={{ fontSize: 20 }}>🔥</span>
              </div>
              <div className="stat-info">
                <div className="stat-val">{stats.currentStreak}</div>
                <div className="stat-lbl">Day streak</div>
              </div>
              <div className="stat-arrow">→</div>
            </div>

            <div className="dash-stat-card glass" onClick={() => navigate("/progress")}>
              <div className="stat-icon-wrap" style={{ background: "rgba(124,58,237,0.15)" }}>
                <span style={{ fontSize: 20 }}>⚡</span>
              </div>
              <div className="stat-info">
                <div className="stat-val">{stats.totalXP?.toLocaleString() || 0}</div>
                <div className="stat-lbl">Total XP</div>
              </div>
              <div className="stat-arrow">→</div>
            </div>

            <div className="dash-stat-card glass" onClick={() => navigate("/progress")}>
              <div className="stat-icon-wrap" style={{ background: "rgba(52,211,153,0.15)" }}>
                <span style={{ fontSize: 20 }}>💻</span>
              </div>
              <div className="stat-info">
                <div className="stat-val">{stats.languagesLearned || 0}</div>
                <div className="stat-lbl">Languages</div>
              </div>
              <div className="stat-arrow">→</div>
            </div>

            <div className="dash-stat-card glass" onClick={() => navigate("/progress")}>
              <div className="stat-icon-wrap" style={{ background: "rgba(6,182,212,0.15)" }}>
                <span style={{ fontSize: 20 }}>🎯</span>
              </div>
              <div className="stat-info">
                <div className="stat-val">{stats.problemsSolved}</div>
                <div className="stat-lbl">Problems solved</div>
              </div>
              <div className="stat-arrow">→</div>
            </div>
          </div>

          {/* TWO COLUMN SECTION */}
          <div className="dash-two-col">

            {/* SKILL PROGRESS */}
            <div className="glass dash-panel">
              <div className="dash-panel-title">
                <span>📊</span> Your skill progress
              </div>
              {loading ? (
                <div className="dash-loading">Loading...</div>
              ) : topLanguages.length > 0 ? (
                <div className="dash-skills">
                  {topLanguages.map((lang) => (
                    <div key={lang.name} className="dash-skill-item">
                      <div className="dash-skill-top">
                        <div className="dash-skill-dot" style={{ background: langColors[lang.name] || "#ff7b00" }}></div>
                        <span className="dash-skill-name">{lang.name}</span>
                        <span className="dash-skill-pct">{lang.percentage}%</span>
                      </div>
                      <div className="dash-skill-bar">
                        <div
                          className="dash-skill-fill"
                          style={{
                            width: `${lang.percentage}%`,
                            background: langColors[lang.name] || "#ff7b00"
                          }}
                        ></div>
                      </div>
                      <div className="dash-skill-sub">{lang.completed}/{lang.total} tasks</div>
                    </div>
                  ))}
                  <Link to="/progress">
                    <button className="dash-view-all">View all progress →</button>
                  </Link>
                </div>
              ) : (
                <div className="dash-empty">
                  <p>No progress yet! Start solving tasks 🚀</p>
                  <Link to="/tasks">
                    <button className="dash-btn-primary" style={{ marginTop: 12 }}>Go to tasks</button>
                  </Link>
                </div>
              )}
            </div>

            {/* FORGE AI CARD */}
            <div className="glass-liquid dash-panel dash-ai-card">
              <div className="dash-ai-orb"></div>
              <div className="dash-ai-avatar">
                <div className="ai-pulse"></div>
                🤖
              </div>
              <div className="dash-ai-title">Forge AI is ready!</div>
              <div className="dash-ai-sub">
                Your personal coding buddy — ask anything, get friendly explanations and career advice
              </div>
              <div className="dash-ai-suggestions">
                {[
                  "What should I study today?",
                  "Explain recursion simply",
                  "I'm stressed about exams"
                ].map((s) => (
                  <button
                    key={s}
                    className="dash-suggestion"
                    onClick={() => navigate("/ask")}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <Link to="/ask" style={{ width: "100%" }}>
                <button className="dash-btn-primary" style={{ width: "100%", marginTop: 12 }}>
                  Chat with Forge 🔥
                </button>
              </Link>
            </div>

          </div>

          {/* QUICK ACTIONS */}
          <div className="dash-section-title">Quick actions</div>
          <div className="dash-actions">
            {[
              { icon: "📚", label: "Daily tasks", sub: "Practice today's problems", to: "/tasks", color: "#ff7b00" },
              { icon: "📈", label: "My progress", sub: "Track your growth", to: "/progress", color: "#7C3AED" },
              { icon: "👤", label: "My profile", sub: "Edit your info", to: "/profile", color: "#06B6D4" },
              { icon: "🏆", label: "Achievements", sub: "See your badges", to: "/profile", color: "#34D399" },
            ].map((action) => (
              <Link to={action.to} key={action.label}>
                <div className="dash-action-card glass">
                  <div className="dash-action-icon" style={{ background: `${action.color}20`, color: action.color }}>
                    {action.icon}
                  </div>
                  <div className="dash-action-label">{action.label}</div>
                  <div className="dash-action-sub">{action.sub}</div>
                </div>
              </Link>
            ))}
          </div>

          {/* RECOMMENDED PROBLEMS */}
          <div className="dash-section-title">Recommended problems</div>
          <div className="dash-problems glass">
            {[
              { title: "Two Sum", difficulty: "Easy", topic: "Arrays", color: "#4ade80" },
              { title: "Binary Search", difficulty: "Easy", topic: "DSA", color: "#4ade80" },
              { title: "Reverse String", difficulty: "Easy", topic: "Strings", color: "#4ade80" },
              { title: "Valid Parentheses", difficulty: "Medium", topic: "Stack", color: "#facc15" },
            ].map((p) => (
              <div key={p.title} className="dash-problem-row" onClick={() => navigate("/tasks")}>
                <div className="dash-problem-dot" style={{ background: p.color }}></div>
                <div className="dash-problem-name">{p.title}</div>
                <div className="dash-problem-topic">{p.topic}</div>
                <div className="dash-problem-diff" style={{ color: p.color }}>{p.difficulty}</div>
                <button className="dash-solve-btn">Solve →</button>
              </div>
            ))}
          </div>

        </div>

        <RightPanel />
      </div>
    </>
  );
}
