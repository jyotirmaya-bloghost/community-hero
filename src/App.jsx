

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import ReportIssue from "./pages/ReportIssue";
import Dashboard from "./pages/Dashboard";
import IssueDetail from "./pages/IssueDetail";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/report" element={<ReportIssue />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/issue/:id" element={<IssueDetail />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}