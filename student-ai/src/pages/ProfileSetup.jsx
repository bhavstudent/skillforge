import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function ProfileSetup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", role: "", track: "" });

  function handleSubmit(e) {
    e.preventDefault();
    navigate("/dashboard");
  }

  return (
    <>
      <Navbar />
      <div className="setup-container">
        <form onSubmit={handleSubmit} className="setup-form">
          <div className="setup-header">
            <h1>Setup Your Profile</h1>
            <p>Tell us about yourself to personalize your learning experience</p>
          </div>

          <div className="form-group">
            <label>Your Name</label>
            <input type="text" placeholder="Enter your name" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>

          <div className="form-group">
            <label>Your Role</label>
            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} required>
              <option value="">Select your role</option>
              <option value="student">Student</option>
              <option value="job-ready">Job Ready</option>
              <option value="professional">Professional</option>
            </select>
          </div>

          <div className="form-group">
            <label>Learning Track</label>
            <select value={form.track} onChange={e => setForm({ ...form, track: e.target.value })} required>
              <option value="">Select your track</option>
              <option value="java-dsa">Java + DSA</option>
              <option value="python">Python</option>
              <option value="fullstack">Full Stack</option>
              <option value="cpp">C++</option>
            </select>
          </div>

          <button type="submit" className="save-btn">Save Profile</button>
        </form>
      </div>
    </>
  );
}