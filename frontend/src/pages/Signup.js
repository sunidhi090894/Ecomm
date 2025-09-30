import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "Donor" });
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await API.post("/signup", form);
      alert("Signup successful. Please log in.");
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.detail || "Signup failed");
    }
  };

  return (
    <div className="auth-wrapper">
      
      <div className="info-panel" style={{ background: 'linear-gradient(135deg, #1abc9c 0%, #2ecc71 100%)' }}>
        <h2>Welcome Back!</h2>
        <p>To keep connected with us, please login with your personal info.</p>
        <button className="switch-button" onClick={() => navigate("/")}>
          SIGN IN
        </button>
      </div>

      <div className="form-panel">
        <h2>Create Account</h2>
        <div className="social-login">
          <button title="Facebook">f</button>
          <button title="Google">G+</button>
          <button title="LinkedIn">in</button>
        </div>
        <p style={{ color: '#999', fontSize: '14px' }}>or use your email for registration:</p>
        
        <form onSubmit={handleSignup} className="auth-form">
          <div className="input-group">
            <span className="icon">👤</span>
            <input name="name" placeholder="Name" onChange={handleChange} />
          </div>
          <div className="input-group">
            <span className="icon">📧</span>
            <input name="email" type="email" placeholder="Email" onChange={handleChange} />
          </div>
          <div className="input-group">
            <span className="icon">🔒</span>
            <input name="password" type="password" placeholder="Password" onChange={handleChange} />
          </div>
          
          <div className="input-group">
            <span className="icon">👥</span>
            <select name="role" onChange={handleChange}>
              <option value="Donor">Donor</option>
              <option value="Recipient">Recipient</option>
              <option value="Volunteer">Volunteer</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <button type="submit">SIGN UP</button>
        </form>
      </div>
    </div>
  );
}