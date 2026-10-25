import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Public folder se website serve karein
const publicPath = path.join(__dirname, "Public");

app.use(express.json({ limit: "30kb" }));
app.use(express.static(publicPath));

// Main website page
app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

// AI chat API
app.post("/api/chat", async (req, res) => {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(503).json({
        error: "OpenAI API key Render Environment Variables mein set nahi hai."
      });
    }

    let messages = [];

    if (Array.isArray(req.body.messages)) {
      messages = req.body.messages;
    } else if (typeof req.body.message === "string") {
      messages = [
        {
          role: "user",
          content: req.body.message
        }
      ];
    }

    const safeMessages = messages
      .filter(m =>
        m &&
        ["user", "assistant"].includes(m.role) &&
        typeof m.content === "string"
      )
      .slice(-12)
      .map(m => ({
        role: m.role,
        content: m.content.slice(0, 2000)
      }));

    if (
      !safeMessages.length ||
      safeMessages[safeMessages.length - 1].role !== "user"
    ) {
      return res.status(400).json({
        error: "Pehle apna English question likhein."
      });
    }

    const client = new OpenAI({ apiKey });

    const response = await client.responses.create({
      model: "gpt-5.5",
      instructions: `You are Raaz AI English Tutor.
Teach English to Hindi-speaking learners in India.
Explain in simple Hindi and English.
Correct English mistakes gently.
Give natural English sentences and Hindi meanings.
Ask one short practice question.
Keep replies friendly and suitable for mobile screens.`,
      input: safeMessages.map(m => ({
        role: m.role,
        content: m.content
      })),
      max_output_tokens: 500
    });

    res.json({
      reply: response.output_text ||
        "Maaf kijiye, jawab nahi mila. Dobara try karein."
    });

  } catch (err) {
    console.error("AI request failed:", err.message);

    res.status(500).json({
      error: "AI se jawab nahi mila. Render logs aur API settings check karein."
    });
  }
});

app.listen(port, () => {
  console.log(`Raaz AI English Tutor running on port ${port}`);
});
