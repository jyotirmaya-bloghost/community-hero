import { useState } from "react";
import { submitIssue } from "../services/issueService";
import { analyzeIssue } from "../services/gemini";

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ReportIssue() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Other");
  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const getLocation = () => {
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationLoading(false);
      },
      () => {
        alert("Location access denied. Please enable it.");
        setLocationLoading(false);
      }
    );
  };

  const handleSubmit = async () => {
    if (!image || !description || !location) {
      alert("Please add a photo, description, and location.");
      return;
    }
    setSubmitting(true);
    try {
      const base64 = await fileToBase64(image);

      const result = await analyzeIssue(base64, description);
      setAiResult(result);

      const id = await submitIssue({
        image,
        description,
        category: result.category || category,
        location,
        aiResult: result,
      });

      console.log("Saved issue ID:", id);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Try again.");
    }
    setSubmitting(false);
  };

  const resetForm = () => {
    setSubmitted(false);
    setImage(null);
    setPreview(null);
    setDescription("");
    setCategory("Other");
    setLocation(null);
    setAiResult(null);
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto p-6 text-center mt-12">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-xl font-semibold text-green-600 mb-2">Issue Reported!</h2>
        <p className="text-gray-500 mb-6">Our AI has analyzed your report.</p>

        {aiResult && (
          <div className="text-left bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 text-sm space-y-1">
            <p><span className="text-gray-400">Category:</span> {aiResult.category}</p>
            <p><span className="text-gray-400">Severity:</span> {aiResult.severity} ({aiResult.severityScore}/5)</p>
            <p><span className="text-gray-400">Routed to:</span> {aiResult.department}</p>
            <p><span className="text-gray-400">Summary:</span> {aiResult.summary}</p>
            {aiResult.urgent && (
              <p className="text-red-600 font-medium mt-2">⚠ Marked urgent</p>
            )}
          </div>
        )}

        <button
          onClick={resetForm}
          className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm"
        >
          Report Another
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-1">Report an Issue</h1>
      <p className="text-gray-400 text-sm mb-6">Help your community by flagging civic problems</p>

      <div className="mb-5">
        <label className="block text-sm font-medium mb-2">Photo / Video</label>
        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-green-400 transition-colors">
          {preview ? (
            <img src={preview} className="h-full w-full object-cover rounded-xl" />
          ) : (
            <div className="text-center">
              <div className="text-3xl mb-1">📷</div>
              <p className="text-sm text-gray-400">Click to upload image</p>
            </div>
          )}
          <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
        </label>
      </div>

      <div className="mb-5">
        <label className="block text-sm font-medium mb-2">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="e.g. Large pothole on main road near bus stop, causing accidents..."
          className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-green-400"
        />
      </div>

      <div className="mb-5">
        <label className="block text-sm font-medium mb-2">Category</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Pothole", icon: "🕳️" },
            { label: "Street light", icon: "💡" },
            { label: "Water leak", icon: "💧" },
            { label: "Garbage", icon: "🗑️" },
            { label: "Tree fall", icon: "🌳" },
            { label: "Other", icon: "📌" },
          ].map(({ label, icon }) => (
            <button
              key={label}
              onClick={() => setCategory(label)}
              className={`flex items-center gap-2 border rounded-lg px-3 py-2 text-sm transition-colors
                ${category === label
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-gray-200 hover:border-green-400"}`}
            >
              <span>{icon}</span>{label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Location</label>
        <button
          onClick={getLocation}
          className="flex items-center gap-2 border border-gray-200 rounded-lg px-4 py-2 text-sm hover:border-green-400 transition-colors"
        >
          {locationLoading ? "Detecting..." : "📍 Detect my location"}
        </button>
        {location && (
          <p className="text-xs text-green-600 mt-2">
            ✓ Location captured: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
          </p>
        )}
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
      >
        {submitting ? "Analyzing with AI..." : "Submit Report"}
      </button>
    </div>
  );
}