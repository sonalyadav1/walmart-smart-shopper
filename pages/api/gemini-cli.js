import { exec } from "child_process";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "No prompt provided" });

  // Improved prompt: always return Walmart product list for any user request (including recipes/ingredients)
  const engineeredPrompt = `You are an AI shopping assistant for Walmart. The user may ask for ingredients, recipes, or shopping needs. For ANY request, respond ONLY with a JSON array of Walmart product suggestions that fulfill the request. Each product must include: name, brand, price, and aisle. For recipe/ingredient requests, map each ingredient to a real Walmart product. Do not include any explanation, text, or plain ingredient names—only the JSON array of products.\n\nUser request: ${prompt}`;

  exec(`echo "${engineeredPrompt.replace(/"/g, '\"')}" | gemini`, (err, stdout, stderr) => {
    if (err) {
      console.error("Gemini CLI error:", err);
      return res.status(500).json({ error: "Gemini CLI error", details: err.message });
    }
    if (stderr) {
      console.error("Gemini CLI stderr:", stderr);
    }
    res.status(200).json({ result: stdout.trim() });
  });
}
