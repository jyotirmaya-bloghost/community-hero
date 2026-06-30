// import { Link } from "react-router-dom";

// export default function Navbar() {
//   return (
//     <nav className="bg-white border-b px-6 py-3 flex items-center justify-between">
//       <span className="text-green-600 font-bold text-lg">Community Hero</span>
//       <div className="flex gap-6 text-sm">
//         <Link to="/" className="text-gray-600 hover:text-green-600">Home</Link>
//         <Link to="/report" className="text-gray-600 hover:text-green-600">Report Issue</Link>
//         <Link to="/dashboard" className="text-gray-600 hover:text-green-600">Dashboard</Link>
//       </div>
//     </nav>
//   );
// }

import { Link, useLocation } from "react-router-dom";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/report", label: "Report Issue" },
  { to: "/dashboard", label: "Dashboard" },
];

export default function Navbar() {
  const { pathname } = useLocation();

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-semibold text-gray-800">CommunityHero</span>
        </Link>

        <div className="flex items-center gap-1">
          {navLinks.map((link) => {
            const active = pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                  ${active
                    ? "bg-green-50 text-green-700"
                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"}`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}