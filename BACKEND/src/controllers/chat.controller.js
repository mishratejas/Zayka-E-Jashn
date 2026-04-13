import { ApiResponse, ApiError, asyncHandler } from "../utils/helpers.js";

const SYSTEM_PROMPT = `You are a friendly and helpful assistant for Zayka-E-Jashn, an authentic Indian restaurant in Allahabad, India.

You help customers with:
- Menu recommendations and dish descriptions  
- Dietary information (veg/non-veg, allergens, spice levels)
- Order placement guidance
- Restaurant hours, location, and reservations

Restaurant info:
- Location: Civil Lines, Allahabad, UP, India
- Hours: 11:00 AM to 11:00 PM daily
- Phone: +91 98765 43210
- Specialties: Raj Kachori, Hyderabadi Biryani, Kadhai Paneer, Gulab Jamun

Be warm, concise (under 80 words per reply), and helpful.`;

// Singleton — created lazily on first request, not at import/startup time
let openaiClient = null;

const getClient = async () => {
  if (openaiClient) return openaiClient;

  if (!process.env.OPENAI_API_KEY) {
    throw new ApiError(503, "Chat service unavailable — OPENAI_API_KEY not set in .env");
  }

  // Dynamic import avoids the module-level crash when key is missing
  const { default: OpenAI } = await import("openai");
  openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return openaiClient;
};

export const chatWithBot = asyncHandler(async (req, res) => {
  const { message, history = [] } = req.body;
  if (!message?.trim()) throw new ApiError(400, "Message is required");

  const client = await getClient();

  const completion = await client.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.slice(-10),
      { role: "user", content: message },
    ],
    max_tokens: 200,
    temperature: 0.7,
  });

  const reply = completion.choices[0].message.content;
  res.status(200).json(new ApiResponse(200, { reply }, "OK"));
});