import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// Convert image file to base64 string
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;

    reader.readAsDataURL(file);
  });
}

export async function submitIssue({
  image,
  description,
  category,
  location,
  aiResult,
}) {
  const imageBase64 = await fileToBase64(image);

  const docRef = await addDoc(collection(db, "issues"), {
    description,
    category,
    location,
    imageBase64,

    status: "reported",
    votes: 0,

    aiCategory: aiResult?.category || null,
    aiSeverity: aiResult?.severity || null,
    aiSeverityScore: aiResult?.severityScore || null,
    aiDepartment: aiResult?.department || null,
    aiSummary: aiResult?.summary || null,
    urgent: aiResult?.urgent || false,

    createdAt: serverTimestamp(),
  });

  return docRef.id;
}