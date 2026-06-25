import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-white border-b px-6 py-3 flex items-center justify-between">
      <span className="text-green-600 font-bold text-lg">Community Hero</span>
      <div className="flex gap-6 text-sm">
        <Link to="/" className="text-gray-600 hover:text-green-600">Home</Link>
        <Link to="/report" className="text-gray-600 hover:text-green-600">Report Issue</Link>
        <Link to="/dashboard" className="text-gray-600 hover:text-green-600">Dashboard</Link>
      </div>
    </nav>
  );
}