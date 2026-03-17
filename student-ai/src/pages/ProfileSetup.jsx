import { useContext, useState } from "react";
import { UserContext } from "../context/UserContext";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

export default function ProfileSetup() {
    const { setUser } = useContext(UserContext);
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        role: "",
        track: ""
    });

    function handleSubmit(e) {
        e.preventDefault();
        setUser({
            name: form.name,
            role: form.role,
            track: form.track,
            progress: 0,
            activeDays: [],
        });
        navigate("/");
    }

    return (
        <>
            <Navbar />
            <div className="setup-container">
                <form onSubmit={handleSubmit} className="setup-form">
                    <div className="setup-header">
                        <h1>🚀 Setup Your Profile</h1>
                        <p>Tell us about yourself to personalize your learning experience</p>
                    </div>

                    <div className="form-group">
                        <label>Your Name</label>
                        <input
                            type="text"
                            placeholder="Enter your name"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Your Role</label>
                        <select 
                            value={form.role} 
                            onChange={e => setForm({ ...form, role: e.target.value })}
                            required
                        >
                            <option value="">Select your role</option>
                            <option value="student">🎓 Student</option>
                            <option value="job-ready">💼 Job Ready</option>
                            <option value="professional">👨‍💻 Professional</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Learning Track</label>
                        <select 
                            value={form.track} 
                            onChange={e => setForm({ ...form, track: e.target.value })}
                            required
                        >
                            <option value="">Select your track</option>
                            <option value="java-dsa">☕ Java + DSA</option>
                            <option value="python">🐍 Python</option>
                            <option value="fullstack">🌐 Full Stack</option>
                            <option value="cpp">⚡ C++</option>
                        </select>
                    </div>

                    <button type="submit" className="save-btn">Save Profile</button>
                </form>
            </div>

            <style>{`
                .setup-container { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 40px 20px; }
                .setup-form { background: #1a1a1a; padding: 40px; border-radius: 16px; width: 100%; max-width: 450px; }
                .setup-header { text-align: center; margin-bottom: 32px; }
                .setup-header h1 { font-size: 28px; margin-bottom: 8px; }
                .setup-header p { color: #888; font-size: 14px; }
                .form-group { margin-bottom: 20px; }
                .form-group label { display: block; margin-bottom: 8px; color: #ccc; font-size: 14px; }
                .form-group input, .form-group select { width: 100%; padding: 14px 16px; background: #0a0a0a; border: 1px solid #333; border-radius: 8px; color: #fff; font-size: 14px; outline: none; transition: border-color 0.2s; }
                .form-group input:focus, .form-group select:focus { border-color: #ffa116; }
                .form-group select { cursor: pointer; }
                .save-btn { width: 100%; padding: 16px; background: linear-gradient(135deg, #ff8c00, #ff4500); border: none; border-radius: 8px; color: #fff; font-size: 16px; font-weight: bold; cursor: pointer; transition: transform 0.2s; }
                .save-btn:hover { transform: scale(1.02); }
            `}</style>
        </>
    );
}
