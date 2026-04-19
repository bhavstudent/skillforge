import { useState, useEffect } from "react";
import { Code2, Sparkles, Languages, Copy, Check } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import API_BASE from "../config";
import "../styles/practice.css";

const getCodeTemplate = (lang, title) => {
  const templates = {
    Python: `# ${title || "Problem"}\n\ndef solve():\n    pass`,
    Java: `// ${title || "Problem"}\n\npublic class Solution {\n    public static void main(String[] args) {}\n}`,
    JavaScript: `// ${title || "Problem"}\n\nfunction solve() {\n    \n}`,
    "C++": `// ${title || "Problem"}\n\n#include <iostream>\nusing namespace std;\n\nint main() {\n    return 0;\n}`,
    SQL: `-- ${title || "Problem"}\n\nSELECT * FROM table_name\nWHERE condition;`,
  };
  return templates[lang] || templates.Python;
};

export default function Practice() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authFetch } = useAuth();

  const [problem, setProblem] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [practiceLanguage, setPracticeLanguage] = useState("Python");
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [voiceOn, setVoiceOn] = useState(false);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState("");

  const languages = ["Python", "Java", "JavaScript", "C++", "SQL"];

  useEffect(() => {
    return () => window.speechSynthesis.cancel();
  }, []);

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
      const good = voices.find(v =>
        v.lang.includes("en-US") &&
        (v.name.includes("Google") || v.name.includes("Microsoft"))
      );
      if (good) setSelectedVoice(good.name);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const problemRes = await authFetch(`${API_BASE}/questions`);
        const problems = await problemRes.json();
        const found = problems.find(p => p.id === Number(id));
        setProblem(found);
        setCode(getCodeTemplate("Python", found?.question_text));

        const explainRes = await authFetch(`${API_BASE}/ai/explain-question`, {
          method: "POST",
          body: JSON.stringify({ question_id: Number(id), marks: 4 })
        });
        const explainData = await explainRes.json();
        setExplanation(explainData.explanation);

      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, authFetch]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cleanTextForSpeech = (text) => {
    if (!text) return "";
    let clean = text.replace(/[\u{1F600}-\u{1F6FF}]/gu, "");
    const slangMap = {
      "tbh": "to be honest", "ngl": "not gonna lie", "fr": "for real",
      "gonna": "going to", "wanna": "want to", "gotta": "got to"
    };
    Object.keys(slangMap).forEach(slang => {
      clean = clean.replace(new RegExp(`\\b${slang}\\b`, "gi"), slangMap[slang]);
    });
    return clean.replace(/\s+/g, " ").trim();
  };

  const speakText = (text) => {
    if (!voiceOn || !text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(cleanTextForSpeech(text));
    const voice = availableVoices.find(v => v.name === selectedVoice);
    if (voice) utterance.voice = voice;
    window.speechSynthesis.speak(utterance);
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
              <p>Loading problem and AI explanation...</p>
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

            {/* LEFT: AI Explanation */}
            <div className="explanation-panel">
              <div className="panel-header">
                <Sparkles size={20} className="icon-sparkle" />
                <h2>AI Explanation</h2>
                <button
                  onClick={() => speakText(explanation?.concept_overview)}
                  style={{ marginLeft: 10, fontSize: 12 }}
                >
                  🔊 Read
                </button>
                <button
                  onClick={() => setVoiceOn(!voiceOn)}
                  style={{ marginLeft: 6, fontSize: 12 }}
                >
                  {voiceOn ? "🔇 ON" : "🔈 OFF"}
                </button>
                <div className="ai-badge">
                  <div className="ai-badge-dot"></div>
                  Forge AI
                </div>
              </div>

              <div className="explanation-content">
                {!explanation && (
                  <div className="exp-empty">
                    <div className="exp-empty-icon">🤖</div>
                    <p>AI explanation will appear here</p>
                    <span>Make sure backend is running</span>
                  </div>
                )}

                {explanation?.concept_overview && (
                  <div className="exp-card exp-overview">
                    <div className="exp-card-label"><span className="exp-label-icon">💡</span>Concept Overview</div>
                    <p>{explanation.concept_overview}</p>
                  </div>
                )}

                {explanation?.visual_diagram && (
                  <div className="exp-card exp-diagram">
                    <div className="exp-card-label"><span className="exp-label-icon">📊</span>Visual Diagram</div>
                    <pre className="diagram-box">{explanation.visual_diagram}</pre>
                  </div>
                )}

                {explanation?.step_by_step?.length > 0 && (
                  <div className="exp-card exp-steps">
                    <div className="exp-card-label"><span className="exp-label-icon">📝</span>Step by Step</div>
                    <ol className="exp-steps-list">
                      {explanation.step_by_step.map((step, i) => (
                        <li key={i}>
                          <div className="exp-step-num">{i + 1}</div>
                          <div className="exp-step-text">{step}</div>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {explanation?.code_example && (
                  <div className="exp-card exp-code">
                    <div className="exp-card-label"><span className="exp-label-icon">💻</span>Code Example</div>
                    <pre className="exp-code-block">
                      {explanation.code_example.replace(/```\w*/g, "").replace(/```/g, "").trim()}
                    </pre>
                  </div>
                )}

                {explanation?.key_points?.length > 0 && (
                  <div className="exp-card exp-keypoints">
                    <div className="exp-card-label"><span className="exp-label-icon">🔑</span>Key Points</div>
                    <ul className="exp-keypoints-list">
                      {explanation.key_points.map((point, i) => (
                        <li key={i}><div className="exp-kp-dot"></div>{point}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {explanation?.common_mistakes?.length > 0 && (
                  <div className="exp-card exp-mistakes">
                    <div className="exp-card-label"><span className="exp-label-icon">⚠️</span>Common Mistakes</div>
                    <ul className="exp-mistakes-list">
                      {explanation.common_mistakes.map((m, i) => (
                        <li key={i}><div className="exp-mistake-dot"></div>{m}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {explanation?.practice_tip && (
                  <div className="exp-card exp-tip">
                    <div className="exp-card-label"><span className="exp-label-icon">🎯</span>Practice Tip</div>
                    <p>{explanation.practice_tip}</p>
                  </div>
                )}

                {explanation?.summary && (
                  <div className="exp-card exp-summary">
                    <div className="exp-card-label"><span className="exp-label-icon">✨</span>Summary</div>
                    <p>{explanation.summary}</p>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: Code Editor */}
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
                      setCode(getCodeTemplate(e.target.value, problem?.question_text));
                    }}
                  >
                    {languages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                  </select>
                </div>
              </div>

              <div className="problem-statement">
                <h3>{problem?.question_text || problem?.title || "Problem not found"}</h3>
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
                <button className="btn-run">▶ Run Code</button>
                <button className="btn-submit">✓ Submit</button>
                <button className="btn-hint" onClick={() => navigate("/tasks")}>← Back</button>
              </div>
            </div>

          </div>
        </main>
      </div>
    </>
  );
}