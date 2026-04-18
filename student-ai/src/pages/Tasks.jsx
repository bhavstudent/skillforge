import { useState, useEffect, useCallback } from "react";
import{ useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { Code2, Filter, ChevronRight, Sparkles } from "lucide-react";
import "../styles/Tasks.css";

export default function Tasks() {
  const navigate = useNavigate();
  const {authFetch} = useAuth();

  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("All");
  const [showExplanation, setShowExplanation] = useState(null);
  const [explanationLoading, setExplanationLoading] = useState(null);

  // Programming languages for cards
  const languageCards = [
    { name: "Python", icon: "🐍", color: "#3776ab", problems: 0 },
    { name: "Java", icon: "☕", color: "#f89820", problems: 0 },
    { name: "JavaScript", icon: "📜", color: "#f7df1e", problems: 0 },
    { name: "C++", icon: "⚡", color: "#00599c", problems: 0 },
    { name: "SQL", icon: "🗄️", color: "#003b57", problems: 0 },
    { name: "DSA", icon: "🔗", color: "#ff7b00", problems: 0 },
  ];

  // Fetch tasks
  const fetchTasks = useCallback(async (lang = "All") => {
    setLoading(true);
    setError(null);
    
    try {
      const url = lang === "All" 
        ? "http://localhost:8000/tasks/today"
        : `http://localhost:8000/tasks/today?language=${lang}`;
      
      const response = await authFetch(url);
      
      if (!response.ok) {
        const fallback = await authFetch("http://localhost:8000/questions");
        if (!fallback.ok) throw new Error("Failed to fetch tasks");
        
        const data = await fallback.json();
        const tasksArray = Array.isArray(data) ? data : (data.questions || []);
        
        setProblems(tasksArray.map(task => ({
          id: task.id || task.question_id,
          title: task.title || task.question_text,
          difficulty: task.difficulty,
          language: task.language || task.subject || "General",
          percentage: task.percentage || Math.floor(Math.random() * 40) + 60,
          description: task.description || task.topic || "",
          marks: task.marks || 4
        })));
        return;
      }
      
      const data = await response.json();
      const tasksArray = Array.isArray(data) ? data : (data.tasks || []);
      
      setProblems(tasksArray.map(task => ({
        id: task.id,
        title: task.title,
        difficulty: task.difficulty,
        language: task.language,
        percentage: task.percentage || 70,
        description: task.description || "",
        marks: task.marks || 4
      })));
      
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError("Could not load tasks. Please try again later.");
      setProblems([]);
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Handle language card click
  const handleLanguageSelect = (lang) => {
    setSelectedLanguage(lang);
    fetchTasks(lang);
  };

  // Handle AI explanation
  const handleShowExplanation = async (problem) => {
    try {
      setExplanationLoading(problem.id);
      
      const response = await authFetch("http://localhost:8000/ai/explain-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question_id: problem.id,
          marks: problem.marks || 4,
          language: "English"
        })
      });
      
      if (!response.ok) throw new Error("Failed to generate explanation");
      
      const data = await response.json();
      setShowExplanation({
        problem,
        explanation: data.explanation,
      });
      
    } catch (err) {
      console.error("Explanation error:", err);
      toast.error("⚠️ Could not generate explanation. Try again later.");
    } finally {
      setExplanationLoading(null);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty?.toLowerCase()) {
      case "easy": return "#4ade80";
      case "medium": return "#facc15";
      case "hard": return "#f87171";
      default: return "#a0a0b0";
    }
  };

  // Loading state
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="tasks-page">
          <Sidebar />
          <main className="tasks-main">
            <div className="loading-tasks">
              <div className="loading-spinner"></div>
              <p>Loading your tasks...</p>
            </div>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="tasks-page">
        <Sidebar />
        
        <main className="tasks-main">
          {/* Header */}
          <div className="tasks-header">
            <div>
              <h1>📚 Daily Tasks</h1>
              <p>Build your knowledge from scratch with curated tasks</p>
            </div>
            {error && (
              <div className="error-banner">
                ⚠️ {error}
                <button onClick={() => fetchTasks(selectedLanguage)}>Retry</button>
              </div>
            )}
          </div>

          {/* Language Cards - LARGE FORMAT */}
          <div className="language-cards-grid">
            <div 
              className={`language-card ${selectedLanguage === "All" ? "active" : ""}`}
              onClick={() => handleLanguageSelect("All")}
            >
              <div className="card-icon">🎯</div>
              <h3>All Languages</h3>
              <p>{problems.length} tasks</p>
              <ChevronRight size={20} className="card-arrow" />
            </div>
            
            {languageCards.map((lang) => (
              <div 
                key={lang.name}
                className={`language-card ${selectedLanguage === lang.name ? "active" : ""}`}
                onClick={() => handleLanguageSelect(lang.name)}
                style={{
                  borderColor: selectedLanguage === lang.name ? lang.color : "transparent"
                }}
              >
                <div className="card-icon">{lang.icon}</div>
                <h3>{lang.name}</h3>
                <p>Practice tasks</p>
                <ChevronRight size={20} className="card-arrow" />
              </div>
            ))}
          </div>

          {/* Selected Language Filter */}
          {selectedLanguage !== "All" && (
            <div className="active-filter">
              <Filter size={16} />
              <span>Showing tasks for: <strong>{selectedLanguage}</strong></span>
              <button onClick={() => handleLanguageSelect("All")}>Clear Filter</button>
            </div>
          )}

          {/* Tasks List */}
          <div className="tasks-section">
            <h2>Today's Tasks</h2>
            
            {problems.length > 0 ? (
              <div className="tasks-list">
                {problems.map((problem) => (
                  <div key={problem.id} className="task-card">
                    <div className="task-content">
                      <h3 className="task-title">{problem.title}</h3>
                      <p className="task-description">{problem.description}</p>
                      
                      <div className="task-meta">
                        <span 
                          className="difficulty-badge"
                          style={{ color: getDifficultyColor(problem.difficulty) }}
                        >
                          {problem.difficulty}
                        </span>
                        <span className="language-tag">{problem.language}</span>
                        <span className="marks-tag">{problem.marks} marks</span>
                      </div>
                    </div>
                    
                    <div className="task-actions">
                      <button 
                        className="btn-explain"
                        onClick={() => handleShowExplanation(problem)}
                        disabled={explanationLoading === problem.id}
                      >
                        {explanationLoading === problem.id ? (
                          <span className="loading-spinner-small"></span>
                        ) : (
                          <>
                            <Sparkles size={16} />
                            Explain
                          </>
                        )}
                      </button>
                      <button 
                        className="btn-practice"
                        onClick={() => navigate(`/practice/${problem.id}`)}
                      >
                        <Code2 size={16} />
                        Practice
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-tasks">
                <p>No tasks available for {selectedLanguage} yet.</p>
                <p>Check back tomorrow for new challenges!</p>
              </div>
            )}
          </div>

        </main>
      </div>

      {/* Explanation Modal */}
      {showExplanation && (
        <ExplanationModal
          problem={showExplanation.problem}
          explanation={showExplanation.explanation}
          onClose={() => setShowExplanation(null)}
          onPractice={() => {
            setShowExplanation(null);
            navigate(`/practice/${showExplanation.problem.id}`);
          }}
        />
      )}
    </>
  );
}

// Explanation Modal Component
function ExplanationModal({ problem, explanation, onClose, onPractice }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{problem.title}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        
        <div className="explanation-body">
          {explanation.concept_overview && (
            <section>
              <h3>📖 Concept Overview</h3>
              <p>{explanation.concept_overview}</p>
            </section>
          )}
          
          {explanation.visual_diagram && (
            <section>
              <h3>📊 Visualization</h3>
              <pre className="diagram">{explanation.visual_diagram}</pre>
            </section>
          )}
          
          {explanation.step_by_step && (
            <section>
              <h3>📝 Step-by-Step</h3>
              <ol>
                {explanation.step_by_step.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </section>
          )}
          
          {explanation.code_example && (
            <section>
              <h3>💻 Code Example</h3>
              <pre className="code-block">{explanation.code_example}</pre>
            </section>
          )}
          
          {explanation.key_points && (
            <section>
              <h3>🔑 Key Points</h3>
              <ul>
                {explanation.key_points.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </section>
          )}
          
          {explanation.summary && (
            <section className="summary">
              <h3>✨ Summary</h3>
              <p>{explanation.summary}</p>
            </section>
          )}
        </div>
        
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Close</button>
          <button className="btn-primary" onClick={onPractice}>
            <Code2 size={16} />
            Practice Now
          </button>
        </div>
      </div>
    </div>
  );
}