import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// import API from "../services/api"; // REMOVE THIS LINE
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth"; // ADD signInWithPopup
import { auth, googleProvider } from "../firebase"; // ADD googleProvider

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "Donor" });
  const [error, setError] = useState(null); 
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);

    if (form.password.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
    }

    try {
      // Use Firebase createUserWithEmailAndPassword
      const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
      
      // NOTE: User 'name' and 'role' are currently client-side form data. 
      console.log("Firebase User Created:", userCredential.user);
      console.log("User Name and Role to be saved separately:", form.name, form.role);

      alert("Signup successful with Firebase. You can now sign in.");
      navigate("/");
    } catch (err) {
      console.error(err);
      setError(err.message);
      alert(`Signup failed: ${err.message}`);
    }
  };

  // NEW: Google Sign-Up/Login Handler
  const handleGoogleSignup = async () => {
    setError(null);
    try {
      // signInWithPopup handles both login (existing user) and signup (new user)
      const userCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;
      
      console.log("Firebase Google User Signed In/Up:", user);
      
      alert("Google login/signup successful.");
      navigate("/donor"); 
      
    } catch (err) {
      console.error(err);
      setError(err.message);
      alert(`Google signup failed: ${err.message}`);
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
          {/* Only Google button remains */}
          <button title="Google" onClick={handleGoogleSignup}>G+</button> 
        </div>
        <p style={{ color: '#999', fontSize: '14px' }}>or use your email for registration:</p>
        
        <form onSubmit={handleSignup} className="auth-form">
          <div className="input-group">
            <span className="icon">👤</span>
            <input name="name" placeholder="Name" onChange={handleChange} required />
          </div>
          <div className="input-group">
            <span className="icon">📧</span>
            <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
          </div>
          <div className="input-group">
            <span className="icon">🔒</span>
            <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
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
          {error && <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>}
          <button type="submit">SIGN UP (Email/Password)</button>
        </form>
      </div>
    </div>
  );
}