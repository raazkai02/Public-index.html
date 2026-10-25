import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json({ limit: "30kb" }));
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/chat", async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "put_your_api_key_here") {
      return res.status(503).json({
        error: "AI API key सेट नहीं है। .env फाइल में OPENAI_API_KEY जोड़ें।"
      });
    }

    const messages = Array.isArray(req.body.messages) ? req.body.messages : [];
    const safeMessages = messages
      .filter(m => m && ["user", "assistant"].includes(m.role) && typeof m.content === "string")
      .slice(-12)
      .map(m => ({ role: m.role, content: m.content.slice(0, 2000) }));

    if (!safeMessages.length || safeMessages[safeMessages.length - 1].role !== "user") {
      return res.status(400).json({ error: "पहले अपना सवाल लिखें या बोलें।" });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.responses.create({
      model: "gpt-5.5",
      instructions: `You are Raaz AI English Tutor, a kind English-speaking coach for a Hindi-speaking beginner in India.
Teach spoken English from beginner to advanced. Reply in simple Hindi + English as useful.
When the learner writes/speaks English, gently correct mistakes using:
Correct English: ...
Hindi meaning: ...
Why: ...
Then ask one short practice question.
If the learner writes Hindi, translate it into natural everyday English, show the Hindi meaning, and invite them to repeat it.
Keep answers friendly, practical, short, and suitable for a phone screen. Never claim to hear pronunciation from text alone.
For voice conversation transcripts, respond naturally and help the learner practice.`,
      input: safeMessages.map(m => ({ role: m.role, content: m.content })),
      max_output_tokens: 500
    });

    res.json({ reply: response.output_text || "माफ़ कीजिए, जवाब नहीं मिला। फिर कोशिश करें।" });
  } catch (err) {
    console.error("AI request failed:", err?.message || err);
    const status = err?.status === 401 ? 401 : 500;
    res.status(status).json({
      error: status === 401
        ? "API key गलत है। .env में अपनी सही key जाँचें।"
        : "AI से कनेक्ट नहीं हो पाया। Internet, API key और API account की स्थिति जाँचें।"
    });
  }
});

app.listen(port, () => {
  console.log(`Raaz AI English Tutor चल रहा है: http://localhost:${port}`);
});
