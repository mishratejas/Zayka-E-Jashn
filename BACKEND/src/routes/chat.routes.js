import express from "express";
import dotenv from "dotenv";
import {OpenAI} from "openai";

dotenv.config();

const router = express.Router();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: message }],
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error("Chatbot error:", err.message);
    res.status(500).json({ reply: "Bot error. Try again later." });
  }
});

export default router;
