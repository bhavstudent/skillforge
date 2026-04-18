import { Routes, Route } from "react-router-dom"
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute"
import { Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard"
import Tasks from "./pages/Tasks";
import AskAI from "./pages/AskAI";
import Profile from "./pages/Profile";
import Practice from "./pages/Practice";
import Progress from "./pages/Progress";
import Interview from "./pages/Interview";


function App() {
    const { user, loading } = useAuth();

    if(loading) {
      return (
        <div className="loading -app">
          <div className="loading-spinner"></div>
          <p>Loading SkillForge...</p>
        </div>
      );
    }

  return (

    <Routes>

      <Route path="/login" element = {user ? <Navigate to = "/dashboard" /> : <Login />} />
      <Route path="/register" element = {user ? <Navigate to = "/dashboard" /> : <Register />} />


      <Route path="/dashboard" element = {
        <ProtectedRoute> <Dashboard /> </ProtectedRoute> } />

      <Route path="/tasks" element = {
        <ProtectedRoute> <Tasks /> </ProtectedRoute> } />

      <Route path="/ask" element = { 
        <ProtectedRoute> <AskAI /></ProtectedRoute> } />

      <Route path="/profile" element = { 
        <ProtectedRoute> <Profile /> </ProtectedRoute> } />
      
      <Route path="/progress" element={ 
        <ProtectedRoute> <Progress /> </ProtectedRoute> } />

      <Route path="/interview" element={ 
        <ProtectedRoute> <Interview /> </ProtectedRoute> } />

      <Route path="/practice/:id" element={ 
        <ProtectedRoute> <Practice /> </ProtectedRoute> } />
      
      <Route path="/" element = {<Navigate to={user ? "/dashboard" : "/login"} /> } />
      <Route path="*" element={<Navigate to= "/dashboard" /> } />

    </Routes>
  );
}

export default App;
