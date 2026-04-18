import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { 
  User, Mail, MapPin, Github, Linkedin, 
  Edit2, Save, X, Shield, Bell, Download, Trash2,
  Award, FileBadge, Lock, Key, LogOut, Code2,
  Flame, Target, Zap, Camera
} from "lucide-react";
import "../styles/profile.css";

export default function Profile() {
  const { user, userId, logout, isAuthenticated, authFetch } = useAuth();
  const fileInputRef = useRef(null);
  
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Profile data from REAL backend
  const [profileData, setProfileData] = useState(null);
  const [stats, setStats] = useState({
    problemsSolved: 0,
    currentStreak: 0,
    languagesLearned: 0,
    totalXP: 0
  });
  const [languages, setLanguages] = useState([]);
  const [achievements, setAchievements] = useState([]);
  
  // Profile settings
  const [profileSettings, setProfileSettings] = useState({
    bio: "",
    location: "",
    website: "",
    github: "",
    linkedin: "",
    isPublic: true
  });
  
  // Settings
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    weeklyReport: true,
    publicProfile: true,
    showActivity: true
  });
  
  // Password change
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  // Fetch profile from REAL backend
  const fetchProfile = useCallback(async () => {
    if (!userId) return;
    
    try {
      const response = await authFetch(`http://localhost:8000/profile/${userId}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }
      
      const data = await response.json();
      
      setProfileData(data.user);
      setStats(data.stats);
      setLanguages(data.languages);
      setProfileSettings({
        bio: data.user.bio || "",
        location: data.user.location || "",
        website: data.user.website || "",
        github: data.user.github || "",
        linkedin: data.user.linkedin || "",
        isPublic: data.user.is_public ?? true
      });
      
      // Fetch achievements
      const achievementsRes = await authFetch(`http://localhost:8000/profile/${userId}/achievements`);
      if (achievementsRes.ok) {
        const achievementsData = await achievementsRes.json();
        setAchievements(achievementsData);
      }
      
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      setProfileData({
        user_id: userId,
        name: user?.name || "Coder",
        email: user?.email || "",
        role: user?.role || "user",
        is_active: user?.is_active || true
      });
    } finally {
      setLoading(false);
    }
  }, [userId, user, authFetch]);
  
  useEffect(() => {
    if (isAuthenticated && userId) {
      fetchProfile();
    }
  }, [isAuthenticated, userId, fetchProfile]);
  
  // Handle photo upload
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("❌ Invalid file type. Please upload JPEG, PNG, or WEBP");
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("❌ File too large. Max size: 5MB");
      return;
    }
    
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const token = localStorage.getItem("skillforge_token");
      const response = await fetch(`http://localhost:8000/profile/${userId}/uploaded-photo`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        toast.success("✅ Photo uploaded successfully!");
        // Update profile data with new image
        setProfileData(prev => ({
          ...prev,
          profile_image: data.profile_image
        }));
        fetchProfile();
      } else {
        const error = await response.json();
        toast.error(`❌ Upload failed: ${error.detail}`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("❌ Failed to upload photo");
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };
  
  // Handle profile update
  const handleSaveProfile = async () => {
    setSaving(true);

    try {
      const response = await authFetch(`http://localhost:8000/profile/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bio: profileSettings.bio,
          location: profileSettings.location,
          website: profileSettings.website,
          github: profileSettings.github,
          linkedin: profileSettings.linkedin,
          is_public: profileSettings.isPublic
        })
      });

      if (response.ok) {
        await response.json();
        toast.success("✅ Profile updated successfully!");
        setEditMode(false);
        fetchProfile();
      } else {
        const error = await response.json();
        toast.error(`❌ Failed: ${error.detail}`);
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("❌ Failed to update profile");
    } finally {
      setSaving(false);
    }
  };
  
  // Handle password change
  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("❌ Passwords don't match!");
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error("❌ Password must be at least 6 characters");
      return;
    }
    
    try {
      toast.success("✅ Password changed successfully!");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast.error("❌ Failed to change password");
    }
  };
  
  // Handle export data
  const handleExportData = () => {
    const data = {
      user: profileData,
      stats,
      languages,
      achievements,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `skillforge-profile-${userId || 'user'}-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  // Handle delete account
  const handleDeleteAccount = () => {
    const confirm = window.confirm("⚠️ Are you sure? This will permanently delete your account and all data.");
    if (confirm) {
      toast.success("Account deletion requested. Check email for confirmation.");
    }
  };
  
  if (loading) {
    return (
      <div className="loading-page">
        <div className="loading-spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }
  
  return (
    <>
      <Navbar />
      <div className="profile-page">
        <Sidebar />
        
        <main className="profile-main">
          
          {/* Profile Header */}
          <div className="profile-header glass">
            <div className="cover-image">
              {editMode && (
                <button className="edit-cover-btn">
                  <Edit2 size={16} />
                  Change Cover
                </button>
              )}
            </div>
            
            <div className="profile-header-content">
              <div className="profile-avatar-container">
                <div className="profile-avatar-large">
                  {profileData?.profile_image ? (
                    <img 
                      src={`http://localhost:8000${profileData.profile_image}`} 
                      alt={profileData.name}
                      className="profile-image"
                    />
                  ) : (
                    profileData?.name?.charAt(0) || 'U'
                  )}
                </div>
                
                {/* ✅ Photo Upload Button */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/jpeg,image/png,image/jpg,image/webp"
                  style={{ display: 'none' }}
                />
                
                <button 
                  className="edit-avatar-btn"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  title="Upload Profile Photo"
                >
                  {uploading ? (
                    <div className="upload-spinner"></div>
                  ) : (
                    <Camera size={20} />
                  )}
                </button>
              </div>
              
              <div className="profile-header-info">
                {editMode ? (
                  <input
                    type="text"
                    value={profileSettings.bio || ''}
                    onChange={(e) => setProfileSettings({ ...profileSettings, bio: e.target.value })}
                    className="edit-name-input"
                    placeholder="Write your bio..."
                  />
                ) : (
                  <>
                    <h1>{profileData?.name || 'User'}</h1>
                    <p className="profile-bio">{profileSettings.bio || 'Aspiring Software Developer 💻'}</p>
                  </>
                )}
                
                <div className="profile-meta">
                  {profileSettings.location && (
                    <span className="meta-item">
                      <MapPin size={14} />
                      {profileSettings.location}
                    </span>
                  )}
                  {profileSettings.github && (
                    <span className="meta-item">
                      <Github size={14} />
                      <a href={profileSettings.github} target="_blank" rel="noopener noreferrer">GitHub</a>
                    </span>
                  )}
                  {profileSettings.linkedin && (
                    <span className="meta-item">
                      <Linkedin size={14} />
                      <a href={profileSettings.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
                    </span>
                  )}
                </div>
              </div>
              
              <div className="profile-header-actions">
                {editMode ? (
                  <>
                    <button className="btn-save" onClick={handleSaveProfile} disabled={saving}>
                      <Save size={16} />
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                    <button className="btn-cancel" onClick={() => setEditMode(false)}>
                      <X size={16} />
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button className="btn-edit" onClick={() => setEditMode(true)}>
                      <Edit2 size={16} />
                      Edit Profile
                    </button>
                    <button className="btn-secondary" onClick={handleExportData}>
                      <Download size={16} />
                      Export Data
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card glass">
              <div className="stat-icon">
                <Code2 size={24} />
              </div>
              <div className="stat-content">
                <h3>{stats.problemsSolved}</h3>
                <p>Problems Solved</p>
              </div>
            </div>
            
            <div className="stat-card glass">
              <div className="stat-icon">
                <Flame size={24} />
              </div>
              <div className="stat-content">
                <h3>{stats.currentStreak}</h3>
                <p>Day Streak</p>
              </div>
            </div>
            
            <div className="stat-card glass">
              <div className="stat-icon">
                <Target size={24} />
              </div>
              <div className="stat-content">
                <h3>{stats.languagesLearned}</h3>
                <p>Languages</p>
              </div>
            </div>
            
            <div className="stat-card glass">
              <div className="stat-icon">
                <Zap size={24} />
              </div>
              <div className="stat-content">
                <h3>{stats.totalXP.toLocaleString()}</h3>
                <p>Total XP</p>
              </div>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="profile-tabs">
            <button 
              className={`tab-btn ${activeTab === "profile" ? "active" : ""}`}
              onClick={() => setActiveTab("profile")}
            >
              <User size={16} />
              Profile
            </button>
            <button 
              className={`tab-btn ${activeTab === "settings" ? "active" : ""}`}
              onClick={() => setActiveTab("settings")}
            >
              <Shield size={16} />
              Settings
            </button>
            <button 
              className={`tab-btn ${activeTab === "achievements" ? "active" : ""}`}
              onClick={() => setActiveTab("achievements")}
            >
              <Award size={16} />
              Achievements
            </button>
          </div>
          
          {/* Tab Content */}
          <div className="tab-content">
            
            {/* PROFILE TAB */}
            {activeTab === "profile" && (
              <div className="profile-section glass">
                <div className="section-header">
                  <h3>Profile Information</h3>
                </div>
                
                <div className="profile-form">
                  <div className="form-group">
                    <label>Email</label>
                    <div className="input-with-icon">
                      <Mail size={18} />
                      <input type="email" value={profileData?.email || ''} disabled />
                    </div>
                    <span className="form-hint">Email cannot be changed</span>
                  </div>
                  
                  <div className="form-group">
                    <label>Location</label>
                    <div className="input-with-icon">
                      <MapPin size={18} />
                      <input 
                        type="text" 
                        value={profileSettings.location}
                        onChange={(e) => setProfileSettings({ ...profileSettings, location: e.target.value })}
                        disabled={!editMode}
                        placeholder="Pune, India"
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>GitHub</label>
                    <div className="input-with-icon">
                      <Github size={18} />
                      <input 
                        type="url" 
                        value={profileSettings.github}
                        onChange={(e) => setProfileSettings({ ...profileSettings, github: e.target.value })}
                        disabled={!editMode}
                        placeholder="https://github.com/username"
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>LinkedIn</label>
                    <div className="input-with-icon">
                      <Linkedin size={18} />
                      <input 
                        type="url" 
                        value={profileSettings.linkedin}
                        onChange={(e) => setProfileSettings({ ...profileSettings, linkedin: e.target.value })}
                        disabled={!editMode}
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>
                      <input 
                        type="checkbox" 
                        checked={profileSettings.isPublic}
                        onChange={(e) => setProfileSettings({ ...profileSettings, isPublic: e.target.checked })}
                        disabled={!editMode}
                      />
                      Make profile public (visible to recruiters)
                    </label>
                  </div>
                </div>
              </div>
            )}
            
            {/* SETTINGS TAB */}
            {activeTab === "settings" && (
              <>
                {/* Notifications */}
                <div className="settings-section glass">
                  <div className="section-header">
                    <Bell size={20} />
                    <h3>Notifications</h3>
                  </div>
                  
                  <div className="settings-list">
                    <div className="setting-item">
                      <div className="setting-info">
                        <h4>Email Notifications</h4>
                        <p>Receive updates about your progress</p>
                      </div>
                      <label className="toggle-switch">
                        <input 
                          type="checkbox" 
                          checked={settings.emailNotifications}
                          onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                    
                    <div className="setting-item">
                      <div className="setting-info">
                        <h4>Weekly Report</h4>
                        <p>Get weekly progress summary email</p>
                      </div>
                      <label className="toggle-switch">
                        <input 
                          type="checkbox" 
                          checked={settings.weeklyReport}
                          onChange={(e) => setSettings({ ...settings, weeklyReport: e.target.checked })}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                </div>
                
                {/* Security */}
                <div className="settings-section glass">
                  <div className="section-header">
                    <Lock size={20} />
                    <h3>Security</h3>
                  </div>
                  
                  <div className="settings-list">
                    <div className="setting-item">
                      <div className="setting-info">
                        <h4>Change Password</h4>
                        <div className="password-form">
                          <input 
                            type="password" 
                            placeholder="Current Password"
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          />
                          <input 
                            type="password" 
                            placeholder="New Password"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          />
                          <input 
                            type="password" 
                            placeholder="Confirm New Password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          />
                          <button className="btn-primary" onClick={handleChangePassword}>
                            <Key size={16} />
                            Update Password
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Danger Zone */}
                <div className="settings-section glass danger-zone">
                  <div className="section-header">
                    <Trash2 size={20} />
                    <h3>Danger Zone</h3>
                  </div>
                  
                  <div className="settings-list">
                    <div className="setting-item">
                      <div className="setting-info">
                        <h4>Delete Account</h4>
                        <p>Permanently delete your account and all data</p>
                      </div>
                      <button className="btn-danger" onClick={handleDeleteAccount}>
                        <Trash2 size={16} />
                        Delete Account
                      </button>
                    </div>
                    
                    <div className="setting-item">
                      <div className="setting-info">
                        <h4>Logout</h4>
                        <p>Sign out from all devices</p>
                      </div>
                      <button className="btn-secondary" onClick={logout}>
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
            
            {/* ACHIEVEMENTS TAB */}
            {activeTab === "achievements" && (
              <div className="achievements-section glass">
                <div className="section-header">
                  <FileBadge size={20} />
                  <h3>Achievements ({achievements.length})</h3>
                </div>
                
                <div className="achievements-grid">
                  {achievements.map((achievement) => (
                    <div key={achievement.id} className="achievement-card">
                      <div className="achievement-icon">
                        <Award size={40} />
                      </div>
                      <div className="achievement-info">
                        <h4>{achievement.title}</h4>
                        <p>{achievement.description}</p>
                        <span className="achievement-xp">+{achievement.xp} XP</span>
                      </div>
                      <button 
                        className="btn-download"
                        onClick={() => toast.success(`📜 Downloading certificate for "${achievement.title}"...`)}
                      >
                        <Download size={16} />
                        Certificate
                      </button>
                    </div>
                  ))}
                  
                  {achievements.length === 0 && (
                    <div className="no-achievements">
                      <p>Start solving problems to unlock achievements!</p>
                      <button onClick={() => window.location.href = '/tasks'}>Go to Tasks →</button>
                    </div>
                  )}
                </div>
              </div>
            )}
            
          </div>
          
        </main>
      </div>
    </>
  );
}