import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, CheckCircle } from "lucide-react";
import "../styles/auth.css"

export default function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const { register } =useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if(password.length < 6) {
            setError("Password must be atleast 6 characters");
            return;
        }

        setLoading(true);

        const result = await register(name, email, password);

        if(result.success) {
            navigate("/dashboard");
        } else {
            setError(result.error);
        }

        setLoading(false);
    };

    return(
        <div className="auth-page">
            <div className="auth-background">
                <div className="auth-orb orb-1"></div>
                <div className="auth-orb orb-2"></div>
                <div className="auth-orb orb-3"></div>
            </div>

            <div className="auth-container">
                <div className="auth-card glass">
                    <div className="auth-header">
                        <div className="auth-logo">
                            <div className="logo-icon">🚀</div>
                            <h1>Create Account</h1>
                        </div>
                        <p>Start your learning journey with SkillForge</p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label className="form-label">
                                <User size={18} /> 
                                Full Name
                            </label>
                            <input 
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="John Doe"
                                required
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <Mail size={18} />
                                Email Address
                            </label>
                            <input 
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                className="form-input" 
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <Lock size={18} />
                                Password
                            </label>
                            <div className="password-input-wrapper">
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="At least 6 characters"
                                    required
                                    className="form-input"
                                />
                                <button 
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} /> }
                                    </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <Lock size={18} />
                                Confirm Password
                            </label>
                            <div className="password-input-wrapper">
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Re-enter password"
                                    required
                                    className="form-input"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="error-message">
                                 ⚠️ {error}
                            </div>
                        )}

                        <div className="password-requirements">
                            <p className="requirements-title">Password must contain: </p>
                            <ul className="requirements-list">
                                <li className={password.length >= 6 ? "met": ""}>
                                    <CheckCircle size={14} /> At lease 6 characters
                                </li>
                            </ul>
                        </div>

                        <button
                            type="submit"
                            className="auth-btn primary"
                            disabled = {loading}
                            >
                                {loading ? (
                                    <>
                                        <div className="btn-spinner"></div>
                                        Creating Account...
                                    </>
                                ) : (
                                    <>
                                    Create Account
                                    <ArrowRight size={18} /> 
                                    </>
                                )}
                            </button>
                    </form>

                    <div className="auth-footer">
                        <p>
                            Already have an account?{" "}
                            <Link to="/login" className="auth-link">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}