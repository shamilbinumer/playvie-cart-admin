import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Navbar from "./components/common/Navbar";
import Dashboard from "./components/pages/Dashboard";
import Sidebar from "./components/layout/Sidebar";

export default function App() {
  return (
    <Router>
      <Navbar />

      <div style={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar />

        <div style={{ flex: 1 }} className="pt-16">
          <Routes>
            {/* Redirect from "/" to "/dashboard" */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
