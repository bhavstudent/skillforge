import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Code2, Sparkles, Languages, Copy, Check } from "lucide-react";
import "../styles/practice.css";

export default function Practice() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [problem, setProblem] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [practiceLanguage, setPracticeLanguage] = useState("Python");
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);

  const languages = ["Python", "Java", "JavaScript", "C++", "SQL"];

  const getCodeTemplate = (subject, lang) => {
    const templates = {
      Python: `# ${problem?.title || "Problem"}\n\ndef solve():\n    pass`,
      Java: `// ${problem?.title || "Problem"}\n\npublic class Solution {\n    public static void main(String[] args) {}\n}`,
      // ... etc
    };
    return templates[lang] || templates.Python;
  };
  
  useEffect(() => {
    // Fetch problem and explanation
    const fetchData = async () => {
      try {
        // Fetch problem details
        const problemRes = await fetch(`http://localhost:8000/questions`);
        const problems = await problemRes.json();
        const found = problems.find(p => p.id === Number(id));
        setProblem(found);
        
        // Fetch AI explanation
        const explainRes = await fetch("http://localhost:8000/ai/explain-question", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question_id: id, marks: 4 })
        });
        const explainData = await explainRes.json();
        setExplanation(explainData.explanation);
        
        // Set initial code template
        setCode(getCodeTemplate(found?.subject || "General", "Python"));
        
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);


  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="practice-page">
          <Sidebar />
          <main className="practice-main">
            <div className="loading-practice">
              <div className="loading-spinner"></div>
              <p>Loading problem and explanation...</p>
            </div>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="practice-page">
        <Sidebar />
        
        <main className="practice-main">
          <div className="practice-container">
            
            {/* LEFT: Explanation (50%) */}
            <div className="explanation-panel">
              <div className="panel-header">
                <Sparkles size={20} className="icon-sparkle" />
                <h2>AI Explanation</h2>
              </div>
              
              <div className="explanation-content">
                {explanation?.concept_overview && (
                  <section>
                    <h3>📖 Concept</h3>
                    <p>{explanation.concept_overview}</p>
                  </section>
                )}
                
                {explanation?.visual_diagram && (
                  <section>
                    <h3>📊 Visualization</h3>
                    <pre className="diagram-box">{explanation.visual_diagram}</pre>
                  </section>
                )}
                
                {explanation?.step_by_step && (
                  <section>
                    <h3>📝 Steps</h3>
                    <ol>
                      {explanation.step_by_step.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ol>
                  </section>
                )}
                
                {explanation?.key_points && (
                  <section>
                    <h3>🔑 Key Points</h3>
                    <ul>
                      {explanation.key_points.map((point, i) => (
                        <li key={i}>{point}</li>
                      ))}
                    </ul>
                  </section>
                )}
                
                {explanation?.summary && (
                  <section className="summary-box">
                    <h3>✨ Summary</h3>
                    <p>{explanation.summary}</p>
                  </section>
                )}
              </div>
            </div>

            {/* RIGHT: Practice (50%) */}
            <div className="practice-panel">
              <div className="panel-header">
                <Code2 size={20} className="icon-code" />
                <h2>Practice</h2>
                
                <div className="language-selector">
                  <Languages size={16} />
                  <select 
                    value={practiceLanguage}
                    onChange={(e) => {
                      setPracticeLanguage(e.target.value);
                      setCode(getCodeTemplate(problem?.subject, e.target.value));
                    }}
                  >
                    {languages.map(lang => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="problem-statement">
                <h3>{problem?.question_text || problem?.title}</h3>
                <div className="problem-meta">
                  <span className="difficulty">{problem?.difficulty}</span>
                  <span className="marks">{problem?.marks} marks</span>
                </div>
              </div>
              
              <div className="code-editor">
                <div className="editor-header">
                  <span>{practiceLanguage} Editor</span>
                  <button className="btn-copy" onClick={handleCopyCode}>
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="code-textarea"
                  spellCheck="false"
                />
              </div>
              
              <div className="practice-actions">
                <button className="btn-run">
                  ▶ Run Code
                </button>
                <button className="btn-submit">
                  ✓ Submit
                </button>
                <button className="btn-hint" onClick={() => navigate(`/tasks`)}>
                  ← Back to Tasks
                </button>
              </div>
            </div>

          </div>
        </main>
      </div>
    </>
  );
}