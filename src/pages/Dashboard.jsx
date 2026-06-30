// export default function Dashboard() {
//   return <div className="p-6"><h1 className="text-2xl font-semibold">Dashboard</h1></div>;
// }

import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import MapView from "../components/MapView";

const STATUS_FLOW = ["reported", "verified", "in_progress", "resolved"];

const STATUS_LABELS = {
  reported: "Reported",
  verified: "Verified",
  in_progress: "In Progress",
  resolved: "Resolved",
};

const SEVERITY_ORDER = { Critical: 0, High: 1, Medium: 2, Low: 3 };

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

export default function Dashboard() {
  const [issues, setIssues] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDept, setFilterDept] = useState("all");

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "issues"), (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setIssues(data);
    });
    return () => unsub();
  }, []);

  const updateStatus = async (id, newStatus) => {
    await updateDoc(doc(db, "issues", id), { status: newStatus });
  };

  const departments = [...new Set(issues.map((i) => i.aiDepartment).filter(Boolean))];

  const filtered = issues
    .filter((i) => filterStatus === "all" || i.status === filterStatus)
    .filter((i) => filterDept === "all" || i.aiDepartment === filterDept)
    .sort((a, b) => {
      const sa = SEVERITY_ORDER[a.aiSeverity] ?? 9;
      const sb = SEVERITY_ORDER[b.aiSeverity] ?? 9;
      return sa - sb;
    });

  const stats = {
    total: issues.length,
    reported: issues.filter((i) => i.status === "reported").length,
    inProgress: issues.filter((i) => i.status === "in_progress").length,
    resolved: issues.filter((i) => i.status === "resolved").length,
    urgent: issues.filter((i) => i.urgent).length,
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-1">Government Dashboard</h1>
      <p className="text-gray-400 text-sm mb-6">AI-prioritized issue queue</p>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        <StatCard label="Total" value={stats.total} />
        <StatCard label="Reported" value={stats.reported} />
        <StatCard label="In Progress" value={stats.inProgress} />
        <StatCard label="Resolved" value={stats.resolved} color="text-green-600" />
        <StatCard label="Urgent" value={stats.urgent} color="text-red-600" />
      </div>

      {/* Map */}
      <div className="mb-6">
        <MapView issues={issues} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
        >
          <option value="all">All statuses</option>
          {STATUS_FLOW.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>

        <select
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
        >
          <option value="all">All departments</option>
          {departments.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {/* Issue list */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-10">No issues match this filter.</p>
        )}

        {filtered.map((issue) => (
          <div key={issue.id} className="border border-gray-200 rounded-xl p-4 flex gap-4">
            {issue.imageBase64 && (
              <img
                src={issue.imageBase64}
                className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
              />
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-medium text-sm">{issue.aiCategory || issue.category}</span>
                {issue.aiSeverity && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${severityBadge[issue.aiSeverity] || "bg-gray-100 text-gray-600"}`}>
                    {issue.aiSeverity}
                  </span>
                )}
                <span className={`text-xs px-2 py-0.5 rounded-full ${statusBadge[issue.status] || "bg-gray-100 text-gray-600"}`}>
                  {STATUS_LABELS[issue.status] || issue.status}
                </span>
                {issue.urgent && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">⚠ Urgent</span>
                )}
              </div>

              <p className="text-sm text-gray-600 mb-1">{issue.aiSummary || issue.description}</p>

              <p className="text-xs text-gray-400">
                Routed to: {issue.aiDepartment || "Unassigned"} · Votes: {issue.votes || 0}
              </p>
            </div>

            <div className="flex-shrink-0">
              <select
                value={issue.status}
                onChange={(e) => updateStatus(issue.id, e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
              >
                {STATUS_FLOW.map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value, color = "text-gray-800" }) {
  return (
    <div className="border border-gray-200 rounded-xl p-4 text-center">
      <p className={`text-2xl font-semibold ${color}`}>{value}</p>
      <p className="text-xs text-gray-400 mt-1">{label}</p>
    </div>
  );
}