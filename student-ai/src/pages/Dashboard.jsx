import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import RightPanel from "../components/RightPanel";
import "../styles/dashboard.css";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { isAuthenticated } = useAuth();

  const progress = null;
  const loading = false;

  const isGuest = !isAuthenticated;
  const isPremium = false;

  return (
    <>
      <Navbar />

      <div className="dashboard">

        <Sidebar />

        <div className="main">

          {loading && <div className="loading-box">Loading...</div>}

          {/* GUEST MESSAGE */}
          {!loading && isGuest && (

            <div className="hero glass">

              <h2>Explore SkillForge</h2>
              <p>Preview interview problems, topics, and AI features.
                Login when you're ready to start practicing.
              </p>
              <button>Login / Sign Up</button>

            </div>
          )}

          {!loading && (
            <>
            {!isPremium && (
              <div className="info-banner glass">
                Free Plan - Limited Access
              </div>
            )}

            {isPremium && (
              <div className="info-banner premium">
                Premium Member
              </div>
            )}

          {/* INFO CARDS */}
          <h2 className="section-title">Getting Started</h2>

            <div className="cards">

              {!progress && (
                <>
                  <div className="card glass">
                    <h4>🚀 Start Learning</h4>
                    <p>Solve your first problem to see progress here.</p>
                  </div>

                  <div className="card">
                    <h4>🧠 Ask AI</h4>
                    <p>Get simple explanations for any topic.</p>
                  </div>

                  <div className="card">
                    <h4>📊 Track Progress</h4>
                    <p>Your stats will appear once you practice.</p>
                  </div>
                </>
              )}

            </div>

          {/* QUICK ACTIONS */}
          <div className="actions">
            {isGuest ? (
              <button disabled className="disabled-btn">
                Login to Start Practice
                </button>
                ) : (
                  <Link to="/tasks"><button>Daily Practice</button></Link>
                )}

                {isGuest ? (
                  <button disabled className="disabled-btn">
                  Login to Ask AI
                  </button>
                  ) : (
                    <Link to="/ask"><button>Ask AI</button></Link>
                )}

            <Link to="/progress"><button>Progress</button></Link>
            
          </div>

          {/* TOPICS */}
          <h3>Popular Topics</h3>
          <div className="topics">
            <div className="topic"><button>Arrays</button></div>
            <div className="topic"><button>Strings</button></div>
            <div className="topic"><button>Trees</button></div>
          </div>

          {/* PRACTICE TABLE */}
          <h3>Recommended Problems</h3>

          <div className="table glass">

            <div className="row">
              <span>Two Sum</span>
              <span className="easy">Easy</span>
              
            {isGuest ? (
              <button disabled className="disabled-btn">
                Login to Solve
              </button>
            ) : (
              <button className="solve-btn">
                Solve
              </button>
            )}

            </div>
          </div>
          
          </>
          )}
        
        </div>


        <RightPanel />
        
      </div>
    </>
  );
}