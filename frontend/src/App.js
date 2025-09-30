import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

const DonorDash = () => <h2>Donor Dashboard</h2>;
const RecipientDash = () => <h2>Recipient Dashboard</h2>;
const VolunteerDash = () => <h2>Volunteer Dashboard</h2>;
const AdminDash = () => <h2>Admin Dashboard</h2>;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/donor" element={<DonorDash />} />
        <Route path="/recipient" element={<RecipientDash />} />
        <Route path="/volunteer" element={<VolunteerDash />} />
        <Route path="/admin" element={<AdminDash />} />
      </Routes>
    </Router>
  );
}

export default App;
