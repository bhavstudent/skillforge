import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Download, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import API_BASE from "../config";
import "../styles/ask.css";

export default function AskAI() {
  const [messages, setMessages] = useState([{
    id: 1, type: "ai",
    content: "heyyy!! 👋 I am Forge — your personal coding buddy!\n\nask me ANYTHING — coding doubts, exam prep, career advice — I got you fr 💪\n\nwhat is on your mind? 😊",
    timestamp: new Date()
  }]);
  const { authFetch } = useAuth();
  const [inputValue, setInputValue] = useState("");
  const [marks, setMarks] = useState(4);
  const [isTyping, setIsTyping] = useState(false);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages]);

  const adjustTextareaHeight = (e) => {
    const t = e.target;
    t.style.height = "auto";
    t.style.height = `${Math.min(t.scrollHeight, 120)}px`;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      const response = await authFetch(`${API_BASE}/ai/ask`, {
        method: "POST",
        body: JSON.stringify({
          question: userMessage.content,
          marks,
          history: messages.slice(-10).map(m => ({
            role: m.type === "user" ? "user" : "assistant",
            content: m.content
          }))
        })
      });

      const data = await response.json();
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: "ai",
        content: data.answer,
        question: userMessage.content,
        timestamp: new Date(),
        pdfReady: true
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: "ai",
        content: "Backend not connected. Make sure the server is running.",
        timestamp: new Date(),
        error: true
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleDownloadPDF = async (question) => {
    try {
      const response = await authFetch(`${API_BASE}/ai/ask/pdf`, {
        method: "POST",
        body: JSON.stringify({ question, marks })
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Answer_${question.slice(0, 20)}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      alert("Failed to download PDF.");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      <Navbar />
      <div className="ask-page">
        <Sidebar />
        <main className="ask-main">
          <div className="ask-header">
            <div className="header-content">
              <Bot size={32} className="header-icon" />
              <div>
                <h1>Ask AI Mentor</h1>
                <p>Exam-oriented answers • PDF Export • 24/7 Help</p>
              </div>
            </div>
            <div className="marks-selector">
              <span className="marks-label">Answer Style:</span>
              <div className="marks-options">
                {[2, 4, 10].map((m) => (
                  <button key={m} className={`marks-btn ${marks === m ? "active" : ""}`} onClick={() => setMarks(m)}>
                    {m === 10 ? "Detailed" : `${m} Marks`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="chat-container" ref={chatContainerRef}>
            <div className="messages-list">
              {messages.map((message) => (
                <div key={message.id} className={`message ${message.type}`}>
                  <div className="message-avatar">
                    {message.type === "ai" ? <Bot size={24} /> : <User size={24} />}
                  </div>
                  <div className="message-content">
                    <div className="message-bubble">
                      <ReactMarkdown
                        components={{
                          code({ inline, children, ...props }) {
                            return inline ? (
                              <code style={{ background: "rgb(0,0,0)", padding: "2px 6px", borderRadius: 4, fontFamily: "monospace", fontSize: 13 }} {...props}>{children}</code>
                            ) : (
                              <pre style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: 16, overflowX: "auto", margin: "12px 0" }}>
                                <code style={{ fontFamily: "monospace", fontSize: 13, color: "#4ade80" }} {...props}>{children}</code>
                              </pre>
                            );
                          },
                          p({ children }) { return <p style={{ margin: "8px 0", lineHeight: 1.7 }}>{children}</p>; },
                          ul({ children }) { return <ul style={{ paddingLeft: 20, margin: "8px 0" }}>{children}</ul>; },
                          li({ children }) { return <li style={{ margin: "4px 0" }}>{children}</li>; },
                          strong({ children }) { return <strong style={{ color: "#ffffff", fontWeight: 600 }}>{children}</strong>; }
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                    {message.pdfReady && (
                      <button className="pdf-btn" onClick={() => handleDownloadPDF(message.question)}>
                        <Download size={14} /> Download Answer Sheet (PDF)
                      </button>
                    )}
                    <div className="message-time">
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="message ai typing">
                  <div className="message-avatar"><Bot size={24} /></div>
                  <div className="message-content">
                    <div className="message-bubble typing-bubble">
                      <span className="typing-dot"></span>
                      <span className="typing-dot"></span>
                      <span className="typing-dot"></span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="input-container">
            <div className="input-wrapper">
              <textarea
                value={inputValue}
                onChange={(e) => { setInputValue(e.target.value); adjustTextareaHeight(e); }}
                onKeyPress={handleKeyPress}
                placeholder="Ask about DSA, academics, or coding..."
                rows="1"
                className="chat-textarea"
              />
              <button className="send-btn" onClick={handleSendMessage} disabled={!inputValue.trim() || isTyping}>
                {isTyping ? <Loader2 size={20} className="spin" /> : <Send size={20} />}
              </button>
            </div>
            <p className="input-hint">Press Enter to send • Answers tailored for {marks}-mark questions</p>
          </div>
        </main>
      </div>
    </>
  );
}