import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicPath = path.join(__dirname, "public");

// Middleware
app.use(express.json({ limit: "30kb" }));
app.use(express.static(publicPath));

// Home page
app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Raaz AI English Tutor server is running."
  });
});

// AI English Tutor API
app.post("/api/chat", async (req, res) => {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(503).json({
        error:
          "OpenAI API key set nahi hai. Render ke Environment Variables mein OPENAI_API_KEY add karein."
      });
    }

    let messages = [];

    if (Array.isArray(req.body?.messages)) {
      messages = req.body.messages;
    } else if (typeof req.body?.message === "string") {
      messages = [
        {
          role: "user",
          content: req.body.message
        }
      ];
    }

    const safeMessages = messages
      .filter(
        (m) =>
          m &&
          ["user", "assistant"].includes(m.role) &&
          typeof m.content === "string"
      )
      .slice(-12)
      .map((m) => ({
        role: m.role,
        content: m.content.slice(0, 2000)
      }));

    if (
      safeMessages.length === 0 ||
      safeMessages[safeMessages.length - 1].role !== "user"
    ) {
      return res.status(400).json({
        error: "Pehle apna English question likhein ya bhejein."
      });
    }

    const client = new OpenAI({
      apiKey: apiKey
    });

    const response = await client.responses.create({
      model: "gpt-5.5",
      instructions: `
You are Raaz AI English Tutor.

Teach English to Hindi-speaking learners in India.
Explain in simple Hindi and English.
Correct English mistakes gently.

When the learner writes incorrect English, provide:
1. Correct English sentence
2. Hindi meaning
3. A short explanation

When the learner writes Hindi, translate it into natural everyday English.

Ask one short practice question after teaching.
Keep replies friendly, practical, and suitable for mobile screens.
Never claim to hear pronunciation from text alone.
`,
      input: safeMessages.map((m) => ({
        role: m.role,
        content: m.content
      })),
      max_output_tokens: 500
    });

    return res.json({
      reply:
        response.output_text ||
        "Maaf kijiye, jawab nahi mila. Dobara try karein."
    });
  } catch (err) {
    console.error("AI request failed:", err);

    if (err?.status === 401) {
      return res.status(401).json({
        error: "API key galat hai. Render Environment Variables check karein."
      });
    }

    if (err?.status === 429) {
      return res.status(429).json({
        error:
          "API usage limit ya billing issue ho sakta hai. OpenAI API account check karein."
      });
    }

    return res.status(500).json({
      error:
        "AI se jawab nahi mila. Render Logs aur API settings check karein."
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Raaz AI English Tutor running on port ${port}`);
});
