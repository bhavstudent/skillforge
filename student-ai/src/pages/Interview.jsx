import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import "../styles/interview.css";

const COMPANIES = [
  {
    name: "Google", logo: "G", color: "#4285f4",
    level: "Hard", rounds: "4 rounds", tags: ["DSA", "System Design"],
    questions: [
      { q: "Two Sum — find pair with target sum", diff: "Easy", topic: "Arrays" },
      { q: "LRU Cache — implement with O(1) operations", diff: "Medium", topic: "Design" },
      { q: "Word Ladder — shortest transformation sequence", diff: "Hard", topic: "BFS" },
    ]
  },
  {
    name: "Amazon", logo: "A", color: "#ff9900",
    level: "Medium", rounds: "5 rounds", tags: ["LP", "DSA"],
    questions: [
      { q: "Two Sum — find pair with target", diff: "Easy", topic: "Arrays" },
      { q: "Merge k sorted linked lists", diff: "Hard", topic: "Linked List" },
      { q: "Number of islands", diff: "Medium", topic: "Graph" },
    ]
  },
  {
    name: "Microsoft", logo: "M", color: "#00a4ef",
    level: "Medium", rounds: "4 rounds", tags: ["DSA", "OOP"],
    questions: [
      { q: "Reverse a linked list", diff: "Easy", topic: "Linked List" },
      { q: "Binary tree level order traversal", diff: "Medium", topic: "Trees" },
      { q: "Design a parking lot system", diff: "Medium", topic: "OOP" },
    ]
  },
  {
    name: "Meta", logo: "f", color: "#0082fb",
    level: "Hard", rounds: "5 rounds", tags: ["DSA", "System Design"],
    questions: [
      { q: "Validate binary search tree", diff: "Medium", topic: "Trees" },
      { q: "Minimum window substring", diff: "Hard", topic: "Sliding Window" },
      { q: "Course schedule — detect cycle", diff: "Medium", topic: "Graph" },
    ]
  },
  {
    name: "Flipkart", logo: "F", color: "#2874f0",
    level: "Medium", rounds: "3 rounds", tags: ["DSA", "SQL"],
    questions: [
      { q: "Implement a stack using queues", diff: "Easy", topic: "Stack" },
      { q: "Find kth largest element", diff: "Medium", topic: "Heap" },
      { q: "Maximum product subarray", diff: "Medium", topic: "DP" },
    ]
  },
  {
    name: "TCS", logo: "T", color: "#1a5276",
    level: "Easy", rounds: "3 rounds", tags: ["Aptitude", "Coding"],
    questions: [
      { q: "Reverse a string without extra space", diff: "Easy", topic: "Strings" },
      { q: "Find missing number in 1 to N", diff: "Easy", topic: "Arrays" },
      { q: "SQL — find second highest salary", diff: "Easy", topic: "SQL" },
    ]
  },
];

const DIFF_STYLE = {
  Easy: { color: "#4ade80", bg: "rgba(74,222,128,.12)", border: "rgba(74,222,128,.25)" },
  Medium: { color: "#facc15", bg: "rgba(250,204,21,.1)", border: "rgba(250,204,21,.2)" },
  Hard: { color: "#f87171", bg: "rgba(248,113,113,.1)", border: "rgba(248,113,113,.2)" },
};

export default function Interview() {
  const { authFetch } = useAuth();
  
  // Step states
  const [step, setStep] = useState(1);
  const [company, setCompany] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [qIndex, setQIndex] = useState(0);
  const [aiLoading, setAiLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(720);
  const [timerActive, setTimerActive] = useState(false);
  
  // Voice states
  const [voiceOn, setVoiceOn] = useState(false);
  
  const chatRef = useRef(null);
  const timerRef = useRef(null);

  // Timer effect
  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setInterval(() => setTimeLeft(t => t - 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [timerActive, timeLeft]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  // Stop voice when leaving page
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // Format time (seconds → MM:SS)
  const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  // Pick company
  const pickCompany = (c) => {
    setCompany(c);
    setStep(2);
  };

  // Start interview
  const startInterview = () => {
    const startMsg = `Hello! I am your ${company.name} interviewer today. Let us begin!\n\nQuestion 1: ${company.questions[0].q}\n\nTake your time — think out loud!`;
    
    setMessages([{
      type: "ai",
      content: startMsg,
      time: new Date()
    }]);
    
    // Make AI speak the welcome message
    speakText(startMsg);
    
    setQIndex(0);
    setTimeLeft(720);
    setTimerActive(true);
    setStep(3);
  };

  // End interview
  const endInterview = () => {
    setTimerActive(false);
    clearInterval(timerRef.current);
    window.speechSynthesis.cancel();
    setStep(2);
  };

  // Clean text before speaking (remove emojis, fix slang)
  const cleanTextForSpeech = (text) => {
    if (!text) return "";
    let clean = text;
    
    // Remove emojis
    clean = clean.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');
    
    // Fix slang so voice says it clearly
    const slangMap = {
      tbh: "to be honest",
      ngl: "not gonna lie",
      fr: "for real",
      gonna: "going to",
      wanna: "want to",
      gotta: "got to",
      kinda: "kind of",
      sorta: "sort of",
      lol: "laugh out loud",
      omg: "oh my god",
      idk: "I don't know",
      im: "I am",
    };
    
    Object.keys(slangMap).forEach(slang => {
      const regex = new RegExp(`\\b${slang}\\b`, 'gi');
      clean = clean.replace(regex, slangMap[slang]);
    });
    
    return clean.replace(/\s+/g, ' ').trim();
  };

  // Make browser speak text
  const speakText = (text) => {
    if (!voiceOn || !text) return;
    
    window.speechSynthesis.cancel(); // Stop previous speech
    
    const clean = cleanTextForSpeech(text);
    const utterance = new SpeechSynthesisUtterance(clean);
    
    utterance.lang = "en-US"; // Use English voice
    utterance.rate = 0.9;     // Slightly slower = clearer
    utterance.pitch = 1.1;    // Slightly higher = friendlier
    
    window.speechSynthesis.speak(utterance);
  };

  // Send answer to AI
  const sendAnswer = async () => {
    if (!input.trim() || aiLoading) return;
    
    const userMsg = { type: "user", content: input, time: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setAiLoading(true);

    const nextIndex = qIndex + 1;
    const hasNext = nextIndex < company.questions.length;

    try {
      const res = await authFetch("http://localhost:8000/ai/ask", {
        method: "POST",
        body: JSON.stringify({
          question: `You are a ${company.name} interviewer. Candidate answered: "${input}" for: "${company.questions[qIndex].q}". Evaluate honestly. ${hasNext ? `Then ask next: "${company.questions[nextIndex].q}"` : "Give final feedback."}`,
          marks: 10,
          history: messages.map(m => ({ role: m.type === "user" ? "user" : "assistant", content: m.content }))
        })
      });
      const data = await res.json();
      
      const aiMsg = { type: "ai", content: data.answer, time: new Date() };
      setMessages(prev => [...prev, aiMsg]);
      
      // Make AI speak the response
      speakText(data.answer);

      if (hasNext) setQIndex(nextIndex);
    } catch {
      setMessages(prev => [...prev, { type: "ai", content: "Could not connect to AI.", time: new Date() }]);
    } finally {
      setAiLoading(false);
    }
  };

  // Handle Enter key
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendAnswer();
    }
  };

  // ============ STEP 1: SELECT COMPANY ============
  if (step === 1) {
    return (
      <>
        <Navbar />
        <div className="iv-page">
          <Sidebar />
          <main className="iv-main">
            <div className="iv-step">
              <div className="iv-page-header">
                <div>
                  <h1 className="iv-page-title">Mock Interview</h1>
                  <p className="iv-page-sub">Pick a company to start</p>
                </div>
              </div>
              
              <div className="iv-company-grid">
                {COMPANIES.map(c => (
                  <div key={c.name} className="iv-ccard" onClick={() => pickCompany(c)}>
                    <div className="iv-cbody">
                      <div className="iv-ctop">
                        <div className="iv-clogo" style={{ color: c.color }}>{c.logo}</div>
                        <span className="iv-clevel" style={{ color: DIFF_STYLE[c.level].color }}>{c.level}</span>
                      </div>
                      <div className="iv-cbtm">
                        <div className="iv-cname">{c.name}</div>
                        <div className="iv-crounds">{c.rounds}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </>
    );
  }

  // ============ STEP 2: PRACTICE ============
  if (step === 2 && company) {
    return (
      <>
        <Navbar />
        <div className="iv-page">
          <Sidebar />
          <main className="iv-main">
            <div className="iv-step">
              <div className="iv-practice-header">
                <div>
                  <h1 className="iv-page-title" style={{ color: company.color }}>{company.name} Prep</h1>
                  <p className="iv-page-sub">Practice before the mock interview</p>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button className="iv-back-btn" onClick={() => setStep(1)}>Back</button>
                  <button className="iv-start-btn" onClick={startInterview}>Start Mock Interview</button>
                </div>
              </div>
              
              <div className="iv-qlist">
                {company.questions.map((q, i) => (
                  <div key={i} className="iv-qrow">
                    <div className="iv-qcontent">
                      <div className="iv-qtext">{q.q}</div>
                      <span className="iv-qtopic">{q.topic}</span>
                    </div>
                    <div className="iv-qdiff" style={{ color: DIFF_STYLE[q.diff].color, background: DIFF_STYLE[q.diff].bg, border: `1px solid ${DIFF_STYLE[q.diff].border}` }}>
                      {q.diff}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </>
    );
  }

  // ============ STEP 3: INTERVIEW ROOM ============
  if (step === 3 && company) {
    return (
      <>
        <Navbar />
        <div className="iv-page">
          <Sidebar />
          <main className="iv-main">
            <div className="iv-step">
              <div className="iv-room">
                
                {/* Top Bar */}
                <div className="iv-topbar">
                  <div className="iv-topbar-left">
                    <div className="iv-room-logo" style={{ color: company.color }}>{company.logo}</div>
                    <div>
                      <div className="iv-room-name">{company.name} Interview</div>
                      <div className="iv-room-sub">Technical Round</div>
                    </div>
                  </div>
                  <div className="iv-topbar-right">
                    <div className="iv-timer">{formatTime(timeLeft)}</div>
                    <button className="iv-back-btn" onClick={endInterview}>End</button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="iv-room-progress">
                  <span className="iv-rp-label">Q{qIndex + 1}/{company.questions.length}</span>
                  <div className="iv-rp-bar">
                    <div className="iv-rp-fill" style={{ width: `${((qIndex + 1) / company.questions.length) * 100}%` }}></div>
                  </div>
                </div>

                {/* Chat Area */}
                <div className="iv-chat" ref={chatRef}>
                  {messages.map((msg, i) => (
                    <div key={i} className={`iv-msg ${msg.type}`}>
                      <div className="iv-msg-av">{msg.type === "ai" ? "AI" : "You"}</div>
                      <div className="iv-msg-wrap">
                        <div className="iv-msg-bubble" style={{ whiteSpace: "pre-wrap" }}>{msg.content}</div>
                        <div className="iv-msg-time">{msg.time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                      </div>
                    </div>
                  ))}
                  {aiLoading && (
                    <div className="iv-msg ai">
                      <div className="iv-msg-av">AI</div>
                      <div className="iv-typing">
                        <div className="iv-td"></div>
                        <div className="iv-td"></div>
                        <div className="iv-td"></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Area */}
                <div className="iv-input-area">
                  <div className="iv-input-row">
                    <textarea 
                      className="iv-textarea" 
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type your answer... think out loud!" 
                      rows={2} 
                      disabled={aiLoading} 
                    />
                    
                    {/* Voice Toggle Button */}
                    <button 
                      className={`iv-voice-btn ${voiceOn ? "active" : ""}`} 
                      onClick={() => setVoiceOn(!voiceOn)}
                      title={voiceOn ? "Disable Voice" : "Enable Voice"}
                    >
                      {voiceOn ? "🔊" : "🔇"}
                    </button>
                    
                    {/* Send Button */}
                    <button 
                      className="iv-send-btn" 
                      onClick={sendAnswer} 
                      disabled={aiLoading || !input.trim()}
                    >
                      ➤
                    </button>
                  </div>
                  <div className="iv-input-footer">
                    Forge AI evaluates your answers like a real {company.name} interviewer
                    {voiceOn && <span style={{ marginLeft: "10px", color: "#4ade80" }}>● Voice On</span>}
                  </div>
                </div>

              </div>
            </div>
          </main>
        </div>
      </>
    );
  }

  return null;
}