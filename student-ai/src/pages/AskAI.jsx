import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Download, Loader2 } from "lucide-react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import "../styles/ask.css";

export default function Ask() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "ai",
      content: "Hi! I'm your AI mentor 👋 Ask me any DSA or academic question. Select marks for exam-style answers!",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [marks, setMarks] = useState(4);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Auto-scroll to bottom when new message arrives
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea without layout jump
  const adjustTextareaHeight = (e) => {
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: "user",
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      const response = await fetch("http://localhost:8000/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMessage.content, marks: marks })
      });

      const data = await response.json();

      const aiMessage = {
        id: messages.length + 2,
        type: "ai",
        content: data.answer,
        timestamp: new Date(),
        pdfReady: true
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const aiMessage = {
        id: messages.length + 2,
        type: "ai",
        content: "⚠️ Backend not connected. Ensure FastAPI is running on port 8000.",
        timestamp: new Date(),
        error: true
      };
      setMessages(prev => [...prev, aiMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleDownloadPDF = async (question, marks) => {
    try {
      const response = await fetch("http://localhost:8000/ai/ask/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    } catch (error) {
      alert("Failed to download PDF. Ensure backend is running.");
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
          {/* Header - Fixed Height */}
          <div className="ask-header">
            <div className="header-content">
              <Bot size={32} className="header-icon" />
              <div>
                <h1>Ask AI Mentor</h1>
                <p>Exam-oriented answers • PDF Export • 24/7 Help</p>
              </div>
            </div>
            
            {/* Marks Selector */}
            <div className="marks-selector">
              <span className="marks-label">Answer Style:</span>
              <div className="marks-options">
                {[2, 4, 10].map((m) => (
                  <button
                    key={m}
                    className={`marks-btn ${marks === m ? "active" : ""}`}
                    onClick={() => setMarks(m)}
                  >
                    {m === 10 ? "Detailed" : `${m} Marks`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Chat Container - Scrollable Area */}
          <div className="chat-container" ref={chatContainerRef}>
            <div className="messages-list">
              {messages.map((message) => (
                <div key={message.id} className={`message ${message.type}`}>
                  <div className="message-avatar">
                    {message.type === "ai" ? <Bot size={24} /> : <User size={24} />}
                  </div>
                  <div className="message-content">
                    <div className="message-bubble">
                      {message.content}
                      {message.error && (
                        <div className="error-hint">
                          💡 Tip: Run `uvicorn main:app --reload` in terminal
                        </div>
                      )}
                    </div>
                    
                    {message.pdfReady && (
                      <button
                        className="pdf-btn"
                        onClick={() => handleDownloadPDF(message.content, marks)}
                      >
                        <Download size={14} />
                        Download Answer Sheet (PDF)
                      </button>
                    )}
                    
                    <div className="message-time">
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
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

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area - Fixed at Bottom */}
          <div className="input-container">
            <div className="input-wrapper">
              <textarea
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  adjustTextareaHeight(e);
                }}
                onKeyPress={handleKeyPress}
                placeholder="Ask about DSA, academics, or coding..."
                rows="1"
                className="chat-textarea"
              />
              <button 
                className="send-btn"
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
              >
                {isTyping ? <Loader2 size={20} className="spin" /> : <Send size={20} />}
              </button>
            </div>
            <p className="input-hint">
              Press Enter to send • Answers tailored for {marks}-mark questions
            </p>
          </div>
        </main>
      </div>
    </>
  );
}