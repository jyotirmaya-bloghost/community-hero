// export default function Home() {
//   return <div className="p-6"><h1 className="text-2xl font-semibold">Home</h1></div>;
// }

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db } from "../services/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import MapView from "../components/MapView";

const severityBadge = {
  Critical: "bg-red-100 text-red-700",
  High: "bg-orange-100 text-orange-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Low: "bg-green-100 text-green-700",
};

const statusBadge = {
  reported: "bg-gray-100 text-gray-600",
  verified: "bg-blue-100 text-blue-700",
  in_progress: "bg-amber-100 text-amber-700",
  resolved: "bg-green-100 text-green-700",
};

const statusLabel = {
  reported: "Reported",
  verified: "Verified",
  in_progress: "In Progress",
  resolved: "Resolved",
};

export default function Home() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "issues"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      // newest first
      data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setIssues(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-1">Community Issues</h1>
        <p className="text-gray-400 text-sm">
          {issues.length} issue{issues.length !== 1 ? "s" : ""} reported in your area
        </p>
      </div>

      {/* Map */}
      <div className="mb-6">
        <MapView issues={issues.filter((i) => i.location)} />
      </div>

      {/* Issue list */}
      {loading && (
        <p className="text-center text-gray-400 text-sm py-10">Loading issues...</p>
      )}

      {!loading && issues.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-400 text-sm mb-4">No issues reported yet.</p>
          <Link
            to="/report"
            className="bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-medium"
          >
            Report the first one
          </Link>
        </div>
      )}

      <div className="space-y-3">
        {issues.map((issue) => (
          <Link
            key={issue.id}
            to={`/issue/${issue.id}`}
            className="flex gap-4 border border-gray-200 rounded-xl p-4 hover:border-green-300 transition-colors"
          >
            {issue.imageBase64 && (
              <img
                src={issue.imageBase64}
                className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
              />
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-medium text-sm">
                  {issue.aiCategory || issue.category}
                </span>
                {issue.aiSeverity && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${severityBadge[issue.aiSeverity] || "bg-gray-100 text-gray-600"}`}>
                    {issue.aiSeverity}
                  </span>
                )}
                <span className={`text-xs px-2 py-0.5 rounded-full ${statusBadge[issue.status] || "bg-gray-100 text-gray-600"}`}>
                  {statusLabel[issue.status] || issue.status}
                </span>
              </div>

              <p className="text-sm text-gray-600 truncate mb-1">
                {issue.aiSummary || issue.description}
              </p>

              <p className="text-xs text-gray-400">
                {issue.votes || 0} confirmation{issue.votes !== 1 ? "s" : ""}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}