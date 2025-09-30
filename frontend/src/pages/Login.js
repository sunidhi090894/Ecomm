import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// import API from "../services/api"; // REMOVE THIS LINE
import { 
  signInWithEmailAndPassword, 
  signInWithPopup // ADD THIS IMPORT
} from "firebase/auth"; 
import { auth, googleProvider } from "../firebase"; // IMPORT googleProvider

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null); // Add state for Firebase errors
  const navigate = useNavigate();

  // Temporary function to simulate role retrieval (REPLACE THIS IN PRODUCTION)
  const getRoleFromFirebaseUser = (user) => {
    const userEmail = user.email || "";
    if (userEmail.includes("admin")) return "Admin";
    if (userEmail.includes("volunteer")) return "Volunteer";
    if (userEmail.includes("recipient")) return "Recipient";
    return "Donor"; 
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      // Use Firebase signInWithEmailAndPassword
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Get role after successful Firebase login
      const role = getRoleFromFirebaseUser(user);
      
      if (role === "Donor") navigate("/donor");
      else if (role === "Recipient") navigate("/recipient");
      else if (role === "Volunteer") navigate("/volunteer");
      else if (role === "Admin") navigate("/admin");
    } catch (err) {
      console.error(err);
      setError(err.message);
      alert(`Login failed: ${err.message}`);
    }
  };
  
  // NEW: Google Sign-In Handler
  const handleGoogleLogin = async () => {
    setError(null);
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;

      // Use the same role assignment logic as standard login (must be replaced later)
      const role = getRoleFromFirebaseUser(user); 
      
      if (role === "Donor") navigate("/donor");
      else if (role === "Recipient") navigate("/recipient");
      else if (role === "Volunteer") navigate("/volunteer");
      else if (role === "Admin") navigate("/admin");
      
    } catch (err) {
      console.error(err);
      setError(err.message);
      alert(`Google login failed: ${err.message}`);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="form-panel">
        <h2>Sign In to Platform</h2>
        
        <div className="social-login">
          {/* Only Google button remains */}
          <button title="Google" onClick={handleGoogleLogin}>G+</button> 
        </div>
        <p style={{ color: '#999', fontSize: '14px' }}>or use your email account:</p>

        <form onSubmit={handleLogin} className="auth-form">
          <div className="input-group">
            <span className="icon">📧</span>
            <input 
              type="email" 
              placeholder="Email" 
              onChange={(e) => setEmail(e.target.value)} 
              required
            />
          </div>
          <div className="input-group">
            <span className="icon">🔒</span>
            <input 
              type="password" 
              placeholder="Password" 
              onChange={(e) => setPassword(e.target.value)} 
              required
            />
          </div>
          <p style={{ fontSize: '13px', textAlign: 'right', margin: '0' }}>
            <a href="#" style={{ color: '#999', textDecoration: 'none' }}>Forgot your password?</a>
          </p>
          {error && <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>}
          <button type="submit">SIGN IN (Email/Password)</button>
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