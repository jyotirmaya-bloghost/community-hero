import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { db, auth } from "../services/firebase";
import {
  doc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  arrayRemove,
  increment,
} from "firebase/firestore";

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

export default function IssueDetail() {
  const { id } = useParams();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "issues", id), (snap) => {
      if (snap.exists()) {
        setIssue({ id: snap.id, ...snap.data() });
      }
      setLoading(false);
    });
    return () => unsub();
  }, [id]);

  const userId = auth.currentUser?.uid;
  const hasVoted = issue?.verifiedBy?.includes(userId);

  const handleVote = async () => {
    if (!userId) return;
    setVoting(true);
    const issueRef = doc(db, "issues", id);

    try {
      if (hasVoted) {
        await updateDoc(issueRef, {
          verifiedBy: arrayRemove(userId),
          votes: increment(-1),
        });
      } else {
        await updateDoc(issueRef, {
          verifiedBy: arrayUnion(userId),
          votes: increment(1),
        });

        // Auto-promote to "verified" status once 3+ confirmations
        const newVoteCount = (issue.votes || 0) + 1;
        if (newVoteCount >= 3 && issue.status === "reported") {
          await updateDoc(issueRef, { status: "verified" });
        }
      }
    } catch (err) {
      console.error(err);
    }
    setVoting(false);
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-400">Loading...</div>;
  }

  if (!issue) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500 mb-4">Issue not found.</p>
        <Link to="/" className="text-green-600 text-sm">← Back to map</Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-6">
      <Link to="/" className="text-sm text-gray-400 hover:text-green-600 mb-4 inline-block">
        ← Back to map
      </Link>

      {issue.imageBase64 && (
        <img
          src={issue.imageBase64}
          className="w-full h-56 object-cover rounded-xl mb-4"
        />
      )}

      <div className="flex items-center gap-2 flex-wrap mb-3">
        <span className="font-semibold text-lg">{issue.aiCategory || issue.category}</span>
        {issue.aiSeverity && (
          <span className={`text-xs px-2 py-0.5 rounded-full ${severityBadge[issue.aiSeverity] || "bg-gray-100 text-gray-600"}`}>
            {issue.aiSeverity}
          </span>
        )}
        <span className={`text-xs px-2 py-0.5 rounded-full ${statusBadge[issue.status] || "bg-gray-100 text-gray-600"}`}>
          {statusLabel[issue.status] || issue.status}
        </span>
        {issue.urgent && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">⚠ Urgent</span>
        )}
      </div>

      <p className="text-gray-600 text-sm mb-4">{issue.description}</p>

      {issue.aiSummary && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4 text-sm">
          <p className="text-gray-400 text-xs mb-1">AI summary</p>
          <p className="text-gray-700">{issue.aiSummary}</p>
        </div>
      )}

      <div className="text-xs text-gray-400 mb-6 space-y-1">
        <p>Routed to: {issue.aiDepartment || "Unassigned"}</p>
        {issue.location && (
          <p>Location: {issue.location.lat.toFixed(4)}, {issue.location.lng.toFixed(4)}</p>
        )}
      </div>

      {/* Community verification */}
      <div className="border border-gray-200 rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">{issue.votes || 0} community confirmations</p>
          <p className="text-xs text-gray-400">
            {issue.status === "reported"
              ? `${Math.max(3 - (issue.votes || 0), 0)} more to verify`
              : "Verified by the community"}
          </p>
        </div>
        <button
          onClick={handleVote}
          disabled={voting}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50
            ${hasVoted
              ? "bg-green-600 text-white"
              : "border border-green-500 text-green-600 hover:bg-green-50"}`}
        >
          {hasVoted ? "✓ Confirmed" : "Confirm this issue"}
        </button>
      </div>
    </div>
  );
}