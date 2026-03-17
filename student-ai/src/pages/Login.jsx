import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, CheckCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "../styles/login.css";

export default function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  //Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeterms, setAgreeterms] = useState(false);

  //Auth State
  const { login, register, loading, error } = useAuth();
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const handleMouseMove = (e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    
    setMousePos({ x, y });

    if(containerRef.current) {

      containerRef.current.style.setProperty('--mouse-x', `${e.clientX}px`);
      containerRef.current.style.setProperty('--mouse-y', `${e.clientY}px`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSignup) {
      if(password !== confirmPassword) {
        alert("Passwords do not match");
        return;
      }

      if (password.length < 6) {
        alert("Password must be at least 6 characters");
        return;
      }
      if(!agreeterms) {
        alert("Please agree to terms & Privacy Policy");
        return;
      }

      //Register
      const result = await register(name, email, password);
      if(result.success) {
        navigate("/dashboard");
      }
    } else {
      if(!email || !password) {
        alert("Please enter email and password");
        return
      }

      const result = await login(email, password);
      if(result.success) {
        navigate("/dashboard");
      }
    }
  };

  useEffect(() => {
    //Error handle by authcontext
  }, [isSignup]);

  return (
    <div 
      className="login-page" 
      ref={containerRef}
      onMouseMove={handleMouseMove}
    >
      {/* Large Faded Background Text */}
      <div className="bg-text">SKILLFORGE</div>

      {/* Animated Background Orbs */}
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>

      {/* 3D Code Animation (Behind Form) */}
      <div className="code-animation-layer">
        <div 
          className="code-cube-wrapper"
          style={{
            transform: `
              perspective(1000px) 
              rotateY(${mousePos.x * 25}deg) 
              rotateX(${-mousePos.y * 25}deg)
            `
          }}
        >
          <div className="code-cube">
            <div className="cube-face front">&lt;/&gt;</div>
            <div className="cube-face back">{}</div>
            <div className="cube-face right">[]</div>
            <div className="cube-face left">()</div>
            <div className="cube-face top">#</div>
            <div className="cube-face bottom">;</div>
          </div>
        </div>
        
        {/* Floating Code Particles */}
        <div className="code-particle p1" style={{ transform: `translate(${mousePos.x * -30}px, ${mousePos.y * -30}px)` }}>div</div>
        <div className="code-particle p2" style={{ transform: `translate(${mousePos.x * -50}px, ${mousePos.y * -50}px)` }}>const</div>
        <div className="code-particle p3" style={{ transform: `translate(${mousePos.x * -25}px, ${mousePos.y * -25}px)` }}>return</div>
        <div className="code-particle p4" style={{ transform: `translate(${mousePos.x * -40}px, ${mousePos.y * -40}px)` }}>import</div>
        <div className="code-particle p5" style={{ transform: `translate(${mousePos.x * -60}px, ${mousePos.y * -60}px)` }}>export</div>
      </div>

      {/* Centered Form Container */}
      <div className="form-wrapper">
        <div className="form-container glass">
          {/* Header */}
          <div className="form-header">
            <div className="logo-badge">SF</div>
            <h1>{isSignup ? "Create Account" : "Welcome Back"}</h1>
            <p>{isSignup ? "Join SkillForge today" : "Login to continue your journey"}</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-banner">
              ⚠️ {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            {isSignup && (
              <div className="input-group">
                <User size={18} />
                <input 
                      type="text" 
                      placeholder="Full Name" 
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled = {loading} 
                />
              </div>
            )}

            <div className="input-group">
              <Mail size={18} />
              <input 
                  type="email" 
                  placeholder="Email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled = {loading} 
              />
            </div>

            <div className="input-group">
              <Lock size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled = {loading}
              />
              <button 
                type="button" 
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {isSignup && (
              <>
              <div className="input-group">
                <Lock size={18} />

                <input 
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled = {loading} 
                />

              </div>
                <div className="checkbox-group">
                  <label>
                    <input 
                        type="checkbox" 
                        required
                        checked = {agreeterms}
                        onChange={(e) => setAgreeterms(e.target.checked)}
                        disabled = {loading} 
                    />
                    <span>I agree to Terms & Privacy Policy</span>
                  </label>
                </div>

                <div className="password-requirements">
                  <p className="requirements-title">Password must contain: </p>
                  <ul className="requirements-list">
                    <li className={password.length >= 6 ? "met" : ""}>
                      <CheckCircle size={14} /> Atleast 6character
                    </li>
                  </ul>
                </div>
              </>
            )}
          

            <button 
                type="submit" 
                className="submit-btn"
                disabled = {loading}
            >
              {loading ? (
                <>
                <div className="btn-spinner"></div>
                {isSignup ? "Creating Account..." : "Signing In... " }
                </>
              ) : (
                <>
                  {isSignup ? "Sign Up Free" : "Login"}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="form-footer">
            <p>
              {isSignup ? "Already have an account?" : "Don't have an account?"}
              <button 
                  type="button"
                  onClick={() => {
                    setIsSignup(!isSignup);
                    setName("");
                    setEmail("");
                    setPassword("");
                    setConfirmPassword("");
                    setAgreeterms(false);
                    }}
                    disabled = {loading}
                >
                  {isSignup ? "Login" : "Sign Up"}
              </button>
            </p>
          </div>

          {/* Divider */}
          <div className="divider"><span>OR CONTINUE WITH</span></div>

          {/* Social Login */}
          <div className="social-login">
            <button 
                className="social-btn"
                type="button"
                onClick={() => alert("Google login coming soon!")}
                disabled = {loading}
            >
              <img src="https://www.google.com/favicon.ico" alt="G" />
              Google
            </button>

            <button 
                className="social-btn"
                type="button"
                onClick={() => alert("GitHub login coming soon!")}
                disabled = {loading}
            >
              <img src="https://github.com/favicon.ico" alt="G" />
              GitHub
            </button>
          </div>
        </div>

        <div className="form-links">
            <button 
                type="button" 
                className="link-btn"
                onClick={() => alert("Forgot Password flow")}
            >
                Forgot Password?
            </button>
            <button 
                type="button" 
                className="link-btn"
                onClick={() => alert("Help Center")}
            >
                Need Help?
            </button>
        </div>
      </div>
    </div>
  );
}