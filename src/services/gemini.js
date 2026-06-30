const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${API_KEY}`;

export async function analyzeIssue(imageBase64, description) {
  // Strip the "data:image/jpeg;base64," prefix
  const base64Data = imageBase64.split(",")[1];
  const mimeType = imageBase64.split(";")[0].split(":")[1];

  const prompt = `
You are an AI assistant for a civic issue reporting platform.
Analyze this image and description of a community problem.

Description: "${description}"

Respond ONLY in this exact JSON format, no extra text:
{
  "category": "Pothole" | "Street light" | "Water leak" | "Garbage" | "Tree fall" | "Other",
  "severityScore": <integer 1-10>,
  "department": "<responsible government department>",
  "summary": "<one sentence, max 20 words>",
  "urgent": <true if severityScore >= 7, else false>,
  "confidence": "High" | "Medium" | "Low"
}
`;

  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Data,
              },
            },
            { text: prompt },
          ],
        },
      ],
    }),
  });

  const data = await response.json();
  console.log("RAW GEMINI RESPONSE:", data); // ← add this

  const text = data.candidates[0].content.parts[0].text;

  // Clean and parse JSON
  const cleaned = text.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}