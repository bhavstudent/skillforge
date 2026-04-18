import { useState, useEffect, useCallback } from "react";
import { 
  Trophy, Code2, CheckCircle, Target,
  Brain, Star, Flame, Crown, Download, TrendingUp,
  Activity, Clock, BarChart3, PieChart, Award
} from "lucide-react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";  // ✅ Already imported
import "../styles/progress.css";

// Static mock data (fallback)
const MOCK_PROGRESS_DATA = [
  { language: "JavaScript", percentage: 85, totalTasks: 40, completedTasks: 34, level: 12 },
  { language: "Python", percentage: 75, totalTasks: 50, completedTasks: 38, level: 10 },
  { language: "Java", percentage: 60, totalTasks: 45, completedTasks: 27, level: 7 },
  { language: "C++", percentage: 80, totalTasks: 35, completedTasks: 28, level: 11 },
  { language: "SQL", percentage: 55, totalTasks: 30, completedTasks: 17, level: 6 },
  { language: "DSA", percentage: 70, totalTasks: 60, completedTasks: 42, level: 9 },
];

const ACHIEVEMENTS = [
  { id: 1, icon: Star, title: "First Blood", desc: "Solved first problem", xp: 100, unlocked: true },
  { id: 2, icon: Flame, title: "On Fire", desc: "7 day streak", xp: 500, unlocked: true },
  { id: 3, icon: Crown, title: "Language Master", desc: "Reached 80% in any language", xp: 1000, unlocked: true },
  { id: 4, icon: Trophy, title: "Consistent Coder", desc: "30 day streak", xp: 2000, unlocked: false },
  { id: 5, icon: Activity, title: "Problem Solver", desc: "Solved 100 problems", xp: 3000, unlocked: false },
];

export default function Progress() {
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState([]); // ✅ Start with empty array

  const { userId, isAuthenticated, authFetch } = useAuth();
  const [userLevel, setUserLevel] = useState(1);
  const [userXP, setUserXP] = useState(0);
  const [currentStreak] = useState(7);
  const [totalSolved] = useState(186);
  const [selectedLang, setSelectedLang] = useState(null);
  const [dateRange, setDateRange] = useState("30");
  const [careerInsight, setCareerInsight] = useState(null);
  const [insightLoading, setInsightLoading] = useState(false);

  // Weekly activity data (static)
  const weeklyData = [
    { day: "Mon", solved: 12, xp: 600, accuracy: 85 },
    { day: "Tue", solved: 8, xp: 400, accuracy: 75 },
    { day: "Wed", solved: 15, xp: 750, accuracy: 90 },
    { day: "Thu", solved: 10, xp: 500, accuracy: 80 },
    { day: "Fri", solved: 18, xp: 900, accuracy: 88 },
    { day: "Sat", solved: 14, xp: 700, accuracy: 82 },
    { day: "Sun", solved: 20, xp: 1000, accuracy: 92 },
  ];

  // Recent activity (static)
  const recentActivity = [
    { id: 1, task: "Two Sum Problem", language: "Python", difficulty: "Easy", status: "Completed", time: "2 hours ago", xp: 50 },
    { id: 2, task: "Binary Search", language: "DSA", difficulty: "Medium", status: "Completed", time: "5 hours ago", xp: 100 },
    { id: 3, task: "React Hooks", language: "JavaScript", difficulty: "Medium", status: "In Progress", time: "1 day ago", xp: 0 },
    { id: 4, task: "SQL Joins", language: "SQL", difficulty: "Easy", status: "Completed", time: "2 days ago", xp: 50 },
    { id: 5, task: "OOP Concepts", language: "Java", difficulty: "Hard", status: "Completed", time: "3 days ago", xp: 150 },
  ];

  // ✅ FIXED: Fetch career insight with proper dependencies
  const fetchCareerInsight = useCallback(async () => {
    if (!isAuthenticated || !userId) return;
    
    setInsightLoading(true);
    try {
      const response = await authFetch("http://localhost:8000/ai/career-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          languages: Array.isArray(progressData) ? progressData.map(lang => ({
            name: lang.language,
            percentage: lang.percentage,
            tasks_completed: lang.completedTasks || 0
          })) : [],
          total_solved: totalSolved,
          streak: currentStreak,
          topics: ["Arrays", "Strings", "Data Structures", "Algorithms", "OOP"]
        })
      }, []);
      
      if (!response.ok) throw new Error("Failed to fetch career insight");
      
      const data = await response.json();
      setCareerInsight(data);
    } catch (error) {
      console.error("Failed to fetch career insight:", error);
    } finally {
      setInsightLoading(false);
    }
  }, [progressData, totalSolved, currentStreak, isAuthenticated, userId, authFetch]);

  // ✅ FIXED: useEffect with proper dependencies
  useEffect(() => {
    if (isAuthenticated && userId && Array.isArray(progressData) && progressData.length > 0) {
      fetchCareerInsight();
    }
  }, [progressData, fetchCareerInsight, isAuthenticated, userId]);

  // ✅ FIXED: Fetch progress with safe array handling
  const fetchProgress = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    try {
      const response = await authFetch(`http://localhost:8000/progress/${userId}`);
      
      if (!response.ok) {
        // Fallback to mock data
        setProgressData(MOCK_PROGRESS_DATA);
        const xp = 186 * 50;
        setUserXP(xp);
        setUserLevel(Math.floor(xp / 1000) + 1);
        return;
      }
      
      const data = await response.json();
      
      // ✅ Ensure data is an array before setting state
      let progressArray = [];
      if (Array.isArray(data)) {
        progressArray = data;
      } else if (data.progress && Array.isArray(data.progress)) {
        progressArray = data.progress;
      } else if (data.languages && Array.isArray(data.languages)) {
        progressArray = data.languages;
      } else {
        // Fallback to mock data if format is unexpected
        progressArray = MOCK_PROGRESS_DATA;
      }
      
      setProgressData(progressArray);
      
      // Calculate XP and level from progress
      const totalCompleted = progressArray.reduce((sum, l) => sum + (l.completedTasks || 0), 0);
      const xp = totalCompleted * 50;
      setUserXP(xp);
      setUserLevel(Math.floor(xp / 1000) + 1);
      
    } catch (error) {
      console.error("Error fetching progress:", error);
      // Fallback to mock data on error
      setProgressData(MOCK_PROGRESS_DATA);
      const xp = 186 * 50;
      setUserXP(xp);
      setUserLevel(Math.floor(xp / 1000) + 1);
    } finally {
      setLoading(false);
    }
  }, [userId, authFetch]);

  // ✅ FIXED: Fetch progress on mount
  useEffect(() => {
    if (isAuthenticated && userId) {
      fetchProgress();
    }
  }, [fetchProgress, isAuthenticated, userId]);

  // Calculate XP progress percentage
  const xpProgress = ((userXP % 1000) / 1000) * 100;

  // Calculate stats (safe with Array.isArray checks)
  const totalXPThisWeek = weeklyData.reduce((sum, day) => sum + day.xp, 0);
  const avgAccuracy = Math.round(weeklyData.reduce((sum, day) => sum + day.accuracy, 0) / weeklyData.length);
  const maxSolvedDay = weeklyData.reduce((max, day) => day.solved > max.solved ? day : max, weeklyData[0]);

  // Export report function
  const handleExportReport = () => {
    const reportData = {
      userId,
      level: userLevel,
      totalXP: userXP,
      streak: currentStreak,
      languages: progressData,
      weeklyActivity: weeklyData,
      careerInsight: careerInsight,
      generatedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `skillforge-report-${userId || 'user'}-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Loading state
  if (loading) {
    return (
      <div className="loading-page">
        <div className="loading-spinner"></div>
        <p>Analyzing your progress...</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="progress-page">
        <Sidebar />
        <main className="progress-main">
          
          {/* Header */}
          <div className="reports-header">
            <div>
              <h1>Performance Dashboard</h1>
              <p>Track your learning analytics and progress</p>
            </div>
            <div className="header-actions">
              <button className="btn-secondary" onClick={handleExportReport}>
                <Download size={18} />
                Export Data
              </button>
              <select 
                className="btn-primary" 
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
              >
                <option value="7">Last 7 Days</option>
                <option value="30">Last 30 Days</option>
                <option value="90">Last 3 Months</option>
              </select>
            </div>
          </div>
        
          {/* XP Progress Card */}
          <div className="user-card glass">
            <div className="user-header">
              <div className="level-badge">
                <Crown size={24} />
                <span>LVL {userLevel}</span>
              </div>
              <div className="user-info">
                <h2>Coder #{userId || 'Guest'}</h2>
                <p className="user-role">Aspiring {careerInsight?.primary_career || 'Developer'}</p>
              </div>
            </div>
            
            <div className="xp-section">
              <div className="xp-bar">
                <div className="xp-fill" style={{ width: `${xpProgress}%` }}></div>
              </div>
              <span className="xp-label">{userXP % 1000} / 1000 XP to Level {userLevel + 1}</span>
            </div>

            <div className="quick-stats">
              <div className="stat-item">
                <Flame className="stat-icon fire" size={20} />
                <div>
                  <span className="stat-value">{currentStreak}</span>
                  <span className="stat-label">Day Streak</span>
                </div>
              </div>
              <div className="stat-item">
                <Trophy className="stat-icon trophy" size={20} />
                <div>
                  <span className="stat-value">{ACHIEVEMENTS.filter(a => a.unlocked).length}</span>
                  <span className="stat-label">Badges</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card glass">
              <div className="stat-icon">
                <Code2 size={24} />
              </div>
              <div className="stat-content">
                <h3>Total Solved</h3>
                <div className="stat-value-group">
                  <span className="stat-value">{totalSolved}</span>
                  <span className="stat-trend positive">
                    <TrendingUp size={16} /> +12%
                  </span>
                </div>
                <p className="stat-label">Problems completed</p>
              </div>
            </div>

            <div className="stat-card glass">
              <div className="stat-icon">
                <Flame size={24} />
              </div>
              <div className="stat-content">
                <h3>Current Streak</h3>
                <div className="stat-value-group">
                  <span className="stat-value">{currentStreak}</span>
                  <span className="stat-trend positive">
                    <TrendingUp size={16} /> +2 days
                  </span>
                </div>
                <p className="stat-label">Days in a row</p>
              </div>
            </div>

            <div className="stat-card glass">
              <div className="stat-icon">
                <Activity size={24} />
              </div>
              <div className="stat-content">
                <h3>Avg Accuracy</h3>
                <div className="stat-value-group">
                  <span className="stat-value">{avgAccuracy}%</span>
                  <span className="stat-trend positive">
                    <TrendingUp size={16} /> +5%
                  </span>
                </div>
                <p className="stat-label">This week</p>
              </div>
            </div>

            <div className="stat-card glass">
              <div className="stat-icon">
                <Crown size={24} />
              </div>
              <div className="stat-content">
                <h3>Total XP</h3>
                <div className="stat-value-group">
                  <span className="stat-value">{userXP.toLocaleString()}</span>
                  <span className="stat-trend positive">
                    <TrendingUp size={16} /> +{totalXPThisWeek}
                  </span>
                </div>
                <p className="stat-label">Level {userLevel}</p>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="charts-grid">
            {/* Weekly Activity Chart */}
            <div className="chart-card glass">
              <div className="chart-header">
                <BarChart3 size={20} />
                <h3>Weekly Activity</h3>
              </div>
              <div className="chart-content">
                <div className="bar-chart">
                  {weeklyData.map((day, idx) => (
                    <div key={idx} className="bar-item">
                      <div 
                        className="bar-fill"
                        style={{ 
                          height: `${(day.solved / 25) * 100}%`,
                          background: day.solved === maxSolvedDay.solved ? 
                            'linear-gradient(180deg, #ff7b00, #ff9500)' : 
                            'rgba(255, 123, 0, 0.4)'
                        }}
                      >
                        <span className="bar-value">{day.solved}</span>
                      </div>
                      <span className="bar-label">{day.day}</span>
                    </div>
                  ))}
                </div>
                <div className="chart-stats">
                  <div className="chart-stat">
                    <span className="stat-num">{totalXPThisWeek}</span>
                    <span className="stat-text">XP This Week</span>
                  </div>
                  <div className="chart-stat">
                    <span className="stat-num">{maxSolvedDay.day}</span>
                    <span className="stat-text">Best Day</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Language Distribution - ✅ SAFE: Check Array.isArray */}
            <div className="chart-card glass">
              <div className="chart-header">
                <PieChart size={20} />
                <h3>Language Distribution</h3>
              </div>
              <div className="chart-content">
                <div className="language-bars">
                  {Array.isArray(progressData) && progressData.length > 0 ? (
                    progressData.map((lang, idx) => (
                      <div 
                        key={idx}
                        className={`skill-bar ${selectedLang === idx ? 'active' : ''}`}
                        onClick={() => setSelectedLang(selectedLang === idx ? null : idx)}
                        style={{
                          width: `${lang.percentage}%`,
                          background: lang.percentage >= 75 ? '#4ade80' : 
                                     lang.percentage >= 50 ? '#facc15' : '#f87171'
                        }}
                      >
                        <span className="skill-name">{lang.language}</span>
                        <span className="skill-percent">{lang.percentage}%</span>
                      </div>
                    ))
                  ) : (
                    <p className="no-data">No language data available</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* AI Career Insight Section */}
          {insightLoading ? (
            <div className="career-card glass">
              <div className="loading-insight">
                <Brain size={40} className="animate-pulse" />
                <p>AI is analyzing your learning pattern...</p>
              </div>
            </div>
          ) : careerInsight ? (
            <>
              {/* Primary Career Match */}
              <div className="career-card glass" style={{ borderLeftColor: careerInsight.color || '#ff7b00' }}>
                <div className="career-icon" style={{ background: `${careerInsight.color || '#ff7b00'}20` }}>
                  <Brain size={32} style={{ color: careerInsight.color || '#ff7b00' }} />
                </div>
                <div className="career-content">
                  <h3>AI Career Match</h3>
                  <h2 style={{ color: careerInsight.color || '#ff7b00' }}>{careerInsight.primary_career}</h2>
                  <p className="career-why">{careerInsight.why_this_match}</p>
                  
                  <div className="confidence-section">
                    <div className="confidence-bar">
                      <div className="confidence-fill" 
                           style={{ width: `${careerInsight.match_percentage}%`, background: careerInsight.color || '#ff7b00' }}>
                      </div>
                    </div>
                    <span className="confidence-text">{careerInsight.match_percentage}% Match</span>
                  </div>

                  {/* Alternative Careers */}
                  {careerInsight.alternative_careers && (
                    <div className="alternative-careers">
                      <h4>Also Consider:</h4>
                      <div className="career-tags">
                        {careerInsight.alternative_careers.map((career, idx) => (
                          <span key={idx} className="career-tag">{career}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Motivation Message */}
              {careerInsight.motivation_message && (
                <div className="motivation-card glass">
                  <Star size={20} className="motivation-icon" />
                  <p className="motivation-text">{careerInsight.motivation_message}</p>
                </div>
              )}

              {/* Strengths */}
              {careerInsight.strengths && careerInsight.strengths.length > 0 && (
                <div className="strengths-section glass">
                  <h3><CheckCircle size={20} /> Your Strengths</h3>
                  <div className="strengths-tags">
                    {careerInsight.strengths.map((strength, idx) => (
                      <span key={idx} className="strength-tag">
                        <CheckCircle size={14} />
                        {strength}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Skill Gaps */}
              {careerInsight.skill_gaps && careerInsight.skill_gaps.length > 0 && (
                <div className="skill-gaps-section glass">
                  <h3><Target size={20} /> Skills to Improve</h3>
                  <div className="gap-list">
                    {careerInsight.skill_gaps.map((gap, idx) => (
                      <div key={idx} className="gap-item">
                        <div className="gap-header">
                          <span className="gap-skill">{gap.skill}</span>
                          <div className="gap-progress">
                            <span className="current-value">{gap.current_level}%</span>
                            <span>→</span>
                            <span className="target-value">{gap.required_level}%</span>
                          </div>
                        </div>
                        <div className="gap-bar">
                          <div className="gap-fill" style={{ width: `${(gap.current_level / gap.required_level) * 100}%` }}></div>
                        </div>
                        <p className="gap-action">{gap.action}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {careerInsight.recommendations && careerInsight.recommendations.length > 0 && (
                <div className="suggestions-section glass">
                  <h3><TrendingUp size={20} /> Recommended Next Steps</h3>
                  <div className="suggestions-grid">
                    {careerInsight.recommendations.map((rec, idx) => (
                      <div key={idx} className={`suggestion-card ${rec.priority}`}>
                        <div className="suggestion-header">
                          <h4 className="suggestion-title">{rec.title}</h4>
                          <span className={`priority-badge ${rec.priority}`}>{rec.priority}</span>
                        </div>
                        <p className="suggestion-desc">{rec.description}</p>
                        <div className="suggestion-meta">
                          <Clock size={14} />
                          {rec.estimated_time}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Roadmap */}
              {careerInsight.roadmap && careerInsight.roadmap.length > 0 && (
                <div className="roadmap-section glass">
                  <h3><Activity size={20} /> Your Career Roadmap</h3>
                  <div className="roadmap-timeline">
                    {careerInsight.roadmap.map((step, idx) => (
                      <div key={idx} className={`roadmap-step ${step.completed ? 'completed' : idx === 0 ? 'current' : ''}`}>
                        <div className="step-number">
                          {step.completed ? <CheckCircle size={18} /> : step.step}
                        </div>
                        <div className="step-info">
                          <h4 className="step-title">{step.title}</h4>
                          <span className="step-status">
                            {step.completed ? 'Completed ✓' : idx === 0 ? 'In Progress' : 'Up Next'}
                          </span>
                          {step.description && <p className="step-desc">{step.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Industry Benchmarks */}
              {careerInsight.industry_benchmarks && Object.keys(careerInsight.industry_benchmarks).length > 0 && (
                <div className="targets-section glass">
                  <h3><Award size={20} /> Industry Benchmarks</h3>
                  <div className="targets-grid">
                    {Object.entries(careerInsight.industry_benchmarks).map(([skill, target], idx) => (
                      <div key={idx} className="target-card">
                        <div className="target-icon"><Target size={24} /></div>
                        <div className="target-label">{skill.toUpperCase()}</div>
                        <div className="target-value">{target}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : null}

          {/* Recent Activity Table */}
          <div className="activity-section glass">
            <div className="section-header">
              <h3><Clock size={20} /> Recent Activity</h3>
              <button className="btn-small">View All</button>
            </div>
            <div className="activity-table">
              <div className="table-header">
                <span>Task</span>
                <span>Language</span>
                <span>Difficulty</span>
                <span>Status</span>
                <span>Time</span>
                <span>XP</span>
              </div>
              {recentActivity.map((activity) => (
                <div key={activity.id} className="table-row">
                  <div className="task-name">
                    <Code2 size={16} />
                    {activity.task}
                  </div>
                  <span className="lang-tag">{activity.language}</span>
                  <span className={`difficulty ${activity.difficulty.toLowerCase()}`}>
                    {activity.difficulty}
                  </span>
                  <span className={`status ${activity.status.toLowerCase().replace(' ', '-')}`}>
                    {activity.status === "Completed" ? <CheckCircle size={14} /> : <Clock size={14} />}
                    {activity.status}
                  </span>
                  <span className="time">{activity.time}</span>
                  <span className="xp-gained">+{activity.xp}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Language Mastery Cards - ✅ SAFE: Check Array.isArray */}
          <h2 className="section-title">
            <Code2 size={24} />
            <span>Language Mastery</span>
          </h2>
          
          <div className="lang-grid">
            {Array.isArray(progressData) && progressData.length > 0 ? (
              progressData.map((lang, index) => {
                const langColor = lang.percentage >= 75 ? '#4ade80' : 
                                 lang.percentage >= 50 ? '#facc15' : '#f87171';
                const radius = 35;
                const circumference = 2 * Math.PI * radius;
                const offset = circumference - (lang.percentage / 100) * circumference;
                
                return (
                  <div key={index} className={`lang-card glass ${lang.percentage >= 75 ? 'mastered' : ''}`}>
                    <div className="lang-top">
                      <div className="lang-icon">
                        <Code2 size={24} />
                      </div>
                      <span className="lang-level">LVL {lang.level || Math.floor(lang.percentage / 10)}</span>
                    </div>
                    
                    <h3>{lang.language}</h3>
                    
                    <div className="lang-ring">
                      <svg width="80" height="80">
                        <circle cx="40" cy="40" r={radius} stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="none" />
                        <circle 
                          cx="40" cy="40" r={radius} 
                          stroke={langColor} strokeWidth="8" fill="none"
                          strokeDasharray={circumference}
                          strokeDashoffset={offset}
                          strokeLinecap="round"
                          className="animate-ring"
                        />
                      </svg>
                      <span className="ring-percent">{lang.percentage}%</span>
                    </div>

                    <div className="lang-stats">
                      <div className="lang-stat">
                        <span className="stat-num">{lang.completedTasks || 0}</span>
                        <span className="stat-text">Done</span>
                      </div>
                      <div className="lang-stat">
                        <span className="stat-num">{lang.totalTasks || 0}</span>
                        <span className="stat-text">Total</span>
                      </div>
                    </div>

                    <div className="lang-status" style={{ color: langColor }}>
                      {lang.percentage >= 75 ? '🎯 Mastered' : 
                       lang.percentage >= 50 ? '📚 Learning' : '🌱 Beginner'}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="no-languages">
                <p>Start solving tasks to see your language progress!</p>
                <button onClick={() => window.location.href = '/tasks'}>Go to Tasks →</button>
              </div>
            )}
          </div>

          {/* Achievements */}
          <h2 className="section-title">
            <Trophy size={24} />
            <span>Achievements</span>
          </h2>

          <div className="achievement-grid">
            {ACHIEVEMENTS.map((achievement) => {
              const Icon = achievement.icon;
              return (
                <div key={achievement.id} 
                     className={`achievement-card glass ${achievement.unlocked ? 'unlocked' : 'locked'}`}>
                  <div className="achievement-glow"></div>
                  <div className="achievement-icon">
                    <Icon size={32} />
                  </div>
                  <div className="achievement-info">
                    <h4>{achievement.title}</h4>
                    <p>{achievement.desc}</p>
                    <span className="achievement-xp">+{achievement.xp} XP</span>
                  </div>
                  {achievement.unlocked && (
                    <div className="achievement-check">
                      <CheckCircle size={20} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </main>
      </div>
    </>
  );
}