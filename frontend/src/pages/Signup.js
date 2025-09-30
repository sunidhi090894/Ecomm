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
      alert("Signup successful");
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.detail || "Signup failed");
    }
  };

  return (
    <div>
      <h2>Signup</h2>
      <form onSubmit={handleSignup}>
        <input name="name" placeholder="Name" onChange={handleChange} />
        <input name="email" type="email" placeholder="Email" onChange={handleChange} />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} />
        
        <select name="role" onChange={handleChange}>
          <option value="Donor">Donor</option>
          <option value="Recipient">Recipient</option>
          <option value="Volunteer">Volunteer</option>
          <option value="Admin">Admin</option>
        </select>

        <button type="submit">Register</button>
      </form>
    </div>
  );
}
