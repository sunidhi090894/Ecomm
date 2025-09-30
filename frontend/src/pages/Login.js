import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/login", { email, password });
      const { role } = res.data;

      if (role === "Donor") navigate("/donor");
      else if (role === "Recipient") navigate("/recipient");
      else if (role === "Volunteer") navigate("/volunteer");
      else if (role === "Admin") navigate("/admin");
    } catch (err) {
      alert(err.response?.data?.detail || "Login failed");
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="form-panel">
        <h2>Sign In to Platform</h2>
        
        <div className="social-login">
          <button title="Facebook">f</button>
          <button title="Google">G+</button>
          <button title="LinkedIn">in</button>
        </div>
        <p style={{ color: '#999', fontSize: '14px' }}>or use your email account:</p>

        <form onSubmit={handleLogin} className="auth-form">
          <div className="input-group">
            <span className="icon">📧</span>
            <input 
              type="email" 
              placeholder="Email" 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>
          <div className="input-group">
            <span className="icon">🔒</span>
            <input 
              type="password" 
              placeholder="Password" 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>
          <p style={{ fontSize: '13px', textAlign: 'right', margin: '0' }}>
            <a href="#" style={{ color: '#999', textDecoration: 'none' }}>Forgot your password?</a>
          </p>
          <button type="submit">SIGN IN</button>
        </form>
      </div>

      <div className="info-panel" style={{ background: 'linear-gradient(135deg, #2ecc71 0%, #1abc9c 100%)' }}>
        <h2>Hello, Friend!</h2>
        <p>Enter your personal details and start your journey with us.</p>
        <button className="switch-button" onClick={() => navigate("/signup")}>
          SIGN UP
        </button>
      </div>
    </div>
  );
}