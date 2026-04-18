import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Download, Loader2 } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import "../styles/ask.css";

export default function Ask() {
  // Messages state
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "ai",
      content: "heyyy!! 👋😄 I'm Forge — your personal coding buddy!\n\nngl I'm literally here 24/7 just for you 🔥\n\nask me ANYTHING — coding doubts, exam prep, career advice, or even just 'what should I study today?' — I got you fr 💪\n\nwhat's on your mind? 😊",
      timestamp: new Date()
    }
  ]);
  
  const { authFetch } = useAuth();
  const [inputValue, setInputValue] = useState("");
  const [marks, setMarks] = useState(4);
  const [isTyping, setIsTyping] = useState(false);
  
  // Refs for auto-scroll
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  
  // Voice states
  const [voiceOn, setVoiceOn] = useState(false);        // AI speaks output
  const [voiceMode, setVoiceMode] = useState(false);    // Full-screen voice view
  const [isListening, setIsListening] = useState(false); // User speaking
  const [isAISpeaking, setIsAISpeaking] = useState(false); // AI speaking
  const [transcript, setTranscript] = useState("");     // Real-time text

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

  // Make browser speak text (with optional callback when done)
  const speakText = (text, onEnd) => {
    if (!voiceOn || !text) return;
    
    window.speechSynthesis.cancel();
    setIsAISpeaking(true);
    
    const clean = cleanTextForSpeech(text);
    const utterance = new SpeechSynthesisUtterance(clean);
    
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    
    utterance.onend = () => {
      setIsAISpeaking(false);
      if (onEnd) onEnd();
    };
    
    utterance.onerror = () => {
      setIsAISpeaking(false);
      if (onEnd) onEnd();
    };
    
    window.speechSynthesis.speak(utterance);
  };

  // Stop voice when leaving page
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // Start ChatGPT-style voice mode
  const startVoiceMode = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Voice mode works best in Chrome or Edge. Please type instead! 🎤");
      return;
    }
    
    setVoiceMode(true);
    setTranscript("");
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = true;
    
    recognition.onstart = () => {
      setIsListening(true);
    };
    
    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPart = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptPart;
        } else {
          interimTranscript += transcriptPart;
        }
      }
      
      // Update transcript ONCE after loop (FIXED)
      setTranscript(prev => prev + finalTranscript + interimTranscript);
    };
    
    recognition.onend = () => {
      setIsListening(false);
      // Auto-send if user stopped speaking and has text
      if (transcript.trim()) {
        handleVoiceSend(transcript.trim());
      }
    };
    
    recognition.onerror = (event) => {
      console.error("Speech error:", event.error);
      setIsListening(false);
      setVoiceMode(false);
    };
    
    recognition.start();
  };

  // Send message from voice mode
  const handleVoiceSend = async (text) => {
    if (!text.trim()) return;
    
    // Add user message to chat (FIXED: messages.length, type, authFetch)
    const userMessage = {
      id: messages.length + 1,
      type: "user",
      content: text,
      timestamp: new Date(),
      fromVoice: true
    };
    setMessages(prev => [...prev, userMessage]);
    setTranscript("");
    
    try {
      const response = await authFetch("http://localhost:8000/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          question: text, 
          marks: marks,
          history: messages.map(m => ({
            role: m.type === "user" ? "user" : "assistant",
            content: m.content
          }))
        })
      });
      const data = await response.json();
      
      const aiMessage = {
        id: messages.length + 2,
        type: "ai",
        content: data.answer,
        question: text,
        timestamp: new Date(),
        pdfReady: true,
        fromVoice: true
      };
      setMessages(prev => [...prev, aiMessage]);
      
      // AI speaks if voice output is on
      if (voiceOn) {
        speakText(data.answer, () => setIsAISpeaking(false));
      }
      
    } catch (error) {
      setMessages(prev => [...prev, {
        id: messages.length + 2,
        type: "ai",
        content: "⚠️ Backend not connected. Ensure FastAPI is running on port 8000.",
        timestamp: new Date(),
        error: true
      }]);
    }
  };

  // Regular text send
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    // Stop voice recording if active
    if (isListening) {
      setIsListening(false);
    }

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
      const response = await authFetch("http://localhost:8000/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          question: userMessage.content, 
          marks: marks,
          history: messages.map(m => ({
            role: m.type === "user" ? "user" : "assistant",
            content: m.content
          }))
        })
      });

      const data = await response.json();

      const aiMessage = {
        id: messages.length + 2,
        type: "ai",
        content: data.answer,
        question: userMessage.content,
        timestamp: new Date(),
        pdfReady: true
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Make AI speak the response
      speakText(data.answer);
      
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
      const response = await authFetch("http://localhost:8000/ai/ask/pdf", {
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
          {/* Header */}
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

          {/* Chat Container */}
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
                          code({ node, inline, className, children, ...props }) {
                            return inline ? (
                              <code style={{
                                background: 'rgb(0, 0, 0)',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontFamily: 'monospace',
                                fontSize: '13px'
                              }} {...props}>
                                {children}
                              </code>
                            ) : (
                              <pre style={{
                                background: 'rgba(0,0,0,0.4)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '10px',
                                padding: '16px',
                                overflowX: 'auto',
                                margin: '12px 0'
                              }}>
                                <code style={{
                                  fontFamily: 'monospace',
                                  fontSize: '13px',
                                  color: '#4ade80'
                                }} {...props}>
                                  {children}
                                </code>
                              </pre>
                            )
                          },
                          p({ children }) {
                            return <p style={{ margin: '8px 0', lineHeight: '1.7' }}>{children}</p>
                          },
                          ul({ children }) {
                            return <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>{children}</ul>
                          },
                          ol({ children }) {
                            return <ol style={{ paddingLeft: '20px', margin: '8px 0' }}>{children}</ol>
                          },
                          li({ children }) {
                            return <li style={{ margin: '4px 0' }}>{children}</li>
                          },
                          strong({ children }) {
                            return <strong style={{ color: '#ffffff', fontWeight: '600' }}>{children}</strong>
                          }
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                    
                    {message.pdfReady && (
                      <button
                        className="pdf-btn"
                        onClick={() => handleDownloadPDF(message.question || inputValue, marks)}
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

          {/* Input Area */}
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

              {/* Voice Mode Button (ChatGPT style) */}
              <button 
                className="voice-mode-btn" 
                onClick={startVoiceMode}
                title="Open Full-Screen Voice Mode"
              >
                🎙️
              </button>

              {/* Voice Toggle Button (AI speaks) */}
              <button 
                className={`voice-toggle-btn ${voiceOn ? "active" : ""}`} 
                onClick={() => setVoiceOn(!voiceOn)}
                title={voiceOn ? "Disable Voice" : "Enable Voice"}
              >
                {voiceOn ? "🔊" : "🔇"}
              </button>

              {/* Send Button */}
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

      {/* ============ VOICE MODE FULL SCREEN VIEW ============ */}
      {voiceMode && (
        <div className="voice-mode-overlay">
          <div className="voice-mode-content">
            
            {/* Close Button */}
            <button className="voice-close-btn" onClick={() => {
              setVoiceMode(false);
              setIsListening(false);
              window.speechSynthesis.cancel();
            }}>✕</button>
            
            {/* 3D Pulse Animation */}
            <div className={`voice-pulse-container ${isListening ? 'listening' : ''} ${isAISpeaking ? 'speaking' : ''}`}>
              <div className="voice-pulse pulse-1"></div>
              <div className="voice-pulse pulse-2"></div>
              <div className="voice-pulse pulse-3"></div>
              <div className="voice-icon">
                {isListening ? '🎤' : isAISpeaking ? '🔊' : '🎧'}
              </div>
            </div>
            
            {/* Status Text */}
            <div className="voice-status">
              {isListening && <span>Listening... speak now</span>}
              {isAISpeaking && <span>Forge is speaking...</span>}
              {!isListening && !isAISpeaking && <span>Tap mic to start</span>}
            </div>
            
            {/* Real-time Transcript */}
            {transcript && (
              <div className="voice-transcript">
                <p>{transcript}<span className="typing-cursor">|</span></p>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="voice-actions">
              <button 
                className={`voice-action-btn ${isListening ? 'active' : ''}`}
                onClick={() => {
                  if (isListening) {
                    if (transcript.trim()) handleVoiceSend(transcript.trim());
                  } else {
                    startVoiceMode();
                  }
                }}
              >
                {isListening ? '✓ Send' : '🎤 Start'}
              </button>
              <button 
                className="voice-action-btn secondary"
                onClick={() => {
                  setTranscript("");
                  setIsListening(false);
                }}
              >
                🗑️ Clear
              </button>
            </div>
            
          </div>
        </div>
      )}
    </>
  );
}