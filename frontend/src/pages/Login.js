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
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">Login</button>
      </form>
      <button onClick={() => navigate("/signup")}>Go to Signup</button>
    </div>
  );
}