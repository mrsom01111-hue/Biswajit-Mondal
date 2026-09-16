import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK lazily / safely
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasApiKey: !!process.env.GEMINI_API_KEY,
    appName: "Phone AI Agent",
    permissions: ["android.permission.CALL_PHONE", "android.permission.SEND_SMS"],
  });
});

// 1. Natural Language Agent Command Parser
app.post("/api/agent/command", async (req, res) => {
  const { prompt, contacts = [] } = req.body;
  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Missing or invalid prompt" });
  }

  const ai = getGeminiClient();
  if (!ai) {
    // Fallback heuristic if API key is not yet set
    const lower = prompt.toLowerCase();
    const isCall = lower.includes("call") || lower.includes("dial") || lower.includes("ring");
    const isSms = lower.includes("text") || lower.includes("sms") || lower.includes("message");
    
    // Find contact mentioned
    const matchedContact = contacts.find((c: any) =>
      lower.includes(c.name.toLowerCase())
    );

    return res.json({
      action: isCall ? "CALL" : isSms ? "SMS" : "QUERY",
      targetName: matchedContact ? matchedContact.name : "Contact",
      targetNumber: matchedContact ? matchedContact.phone : "+1 (555) 019-2831",
      content: isSms ? prompt.replace(/^(text|send sms to|message)\s+[^:]+:\s*/i, "") : "",
      objective: isCall ? prompt : "",
      reasoning: "Heuristic parser fallback (API key not configured). Ready to execute Android intent.",
      needsConfirmation: true,
    });
  }

  try {
    const contactsContext = (contacts as any[])
      .map((c) => `${c.name} (${c.phone}, ${c.company || "Personal"})`)
      .join("; ");

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: `You are the core intelligence of an Android Phone AI Agent application with permissions:
- android.permission.CALL_PHONE: Can place phone calls and manage call assistants.
- android.permission.SEND_SMS: Can draft and dispatch SMS messages.

User voice or text command: "${prompt}"

Known Address Book / Contacts:
${contactsContext || "No contacts provided"}

Analyze the command and output structured JSON:
- action: One of "CALL", "SMS", "SCREEN_CALL", "SUMMARIZE_SMS", "QUERY"
- targetName: The identified contact or business name, or null
- targetNumber: The target phone number from contacts or extracted from command, or standard formatted number
- content: If SMS, the exact polished message text to send. If not SMS, null.
- objective: If CALL, the clear purpose of the phone call (e.g. "Confirm appointment for 3 PM tomorrow").
- reasoning: Brief 1-sentence explanation of what the agent will do on Android.
- needsConfirmation: boolean, true if it involves placing an external call or sending a text.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            action: { type: Type.STRING },
            targetName: { type: Type.STRING },
            targetNumber: { type: Type.STRING },
            content: { type: Type.STRING },
            objective: { type: Type.STRING },
            reasoning: { type: Type.STRING },
            needsConfirmation: { type: Type.BOOLEAN },
          },
          required: ["action", "reasoning", "needsConfirmation"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Agent command error:", error);
    res.status(500).json({ error: error.message || "Failed to parse command" });
  }
});

// 2. Active Phone Call Dialog Turn (Simulating caller or AI agent)
app.post("/api/agent/call-turn", async (req, res) => {
  const {
    objective,
    contactName,
    history = [],
    callerRole = "remote", // "remote" (the person called) or "agent" (AI answering on your behalf)
    userMessage,
  } = req.body;

  const ai = getGeminiClient();
  if (!ai) {
    // Simple mock conversational dialog fallback
    const mockReplies = [
      "Hello! Thanks for calling. How can I help you today?",
      "Yes, I see your reservation right here. Would you like to confirm for 3:00 PM?",
      "That sounds great, I have noted that down for you. Anything else?",
      "Perfect, all set! Have a wonderful day, goodbye!",
    ];
    const turnIndex = Math.min(history.length, mockReplies.length - 1);
    return res.json({
      text: mockReplies[turnIndex],
      shouldHangUp: turnIndex >= mockReplies.length - 1,
      sentiment: "friendly",
    });
  }

  try {
    const dialogHistory = (history as any[])
      .map((h) => `${h.speaker.toUpperCase()}: ${h.text}`)
      .join("\n");

    const promptText = `You are participating in a realistic phone call simulation for an Android Phone AI Agent.
Call Context:
- Target Contact / Business: ${contactName || "Customer Service"}
- Call Objective: ${objective || "General inquiry"}
- Your Role in this turn: ${callerRole === "remote" ? "The person/business receiving the call" : "The Phone AI Agent speaking on behalf of the user Alex"}

Conversation History so far:
${dialogHistory || "Call just connected."}

Latest message: "${userMessage || "Hello"}"

Respond with natural, concise spoken phone dialogue (1 to 2 sentences max, spoken tone).
Also indicate whether the objective has been concluded and if the call should hang up.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: promptText,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING, description: "Spoken dialogue line" },
            shouldHangUp: { type: Type.BOOLEAN, description: "Whether the call concluded" },
            sentiment: { type: Type.STRING, description: "friendly | neutral | hurried | formal" },
            actionSummary: { type: Type.STRING, description: "Brief outcome note (e.g. Appointment scheduled, Info provided)" },
          },
          required: ["text", "shouldHangUp"],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");
    res.json(result);
  } catch (error: any) {
    console.error("Call turn error:", error);
    res.status(500).json({ error: error.message || "Failed to simulate call turn" });
  }
});

// 3. AI Smart Call Screen (Answering on user's behalf)
app.post("/api/agent/screen-call", async (req, res) => {
  const { callerName, callerNumber, callerSpeech } = req.body;

  const ai = getGeminiClient();
  if (!ai) {
    return res.json({
      screeningResponse: "Hi, I am an AI assistant answering for Alex. Could you please state your name and the reason for your call?",
      category: "Unknown / Inquiry",
      urgency: "Medium",
      recommendation: "Review transcript before answering",
      suggestedReply: "I'll take a message and have them call you back shortly.",
    });
  }

  try {
    const promptText = `An incoming phone call is received on Android from:
Caller Name: ${callerName || "Unknown Caller"}
Caller Number: ${callerNumber || "Unknown"}
What the caller just said: "${callerSpeech || "Hello, is Alex available?"}"

As an Android Phone AI Agent performing real-time Call Screening:
1. Generate what the AI Agent should say to the caller to clarify their purpose or handle the call politely.
2. Classify caller category: "Spam / Robocall", "Delivery / Courier", "Doctor / Medical", "Work / Business", "Personal / Family", "Urgent".
3. Determine urgency level: "Low", "Medium", "High".
4. Provide a recommendation for the user: "Accept Call", "Decline / Block", "Send to Voicemail", "Let AI continue inquiry".
5. Quick suggested SMS reply if user decides not to pick up.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: promptText,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            screeningResponse: { type: Type.STRING },
            category: { type: Type.STRING },
            urgency: { type: Type.STRING },
            recommendation: { type: Type.STRING },
            suggestedReply: { type: Type.STRING },
          },
          required: ["screeningResponse", "category", "urgency", "recommendation", "suggestedReply"],
        },
      },
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("Screen call error:", error);
    res.status(500).json({ error: error.message || "Failed to screen call" });
  }
});

// 4. Smart SMS Draft & Auto-Responder
app.post("/api/agent/draft-sms", async (req, res) => {
  const { threadContext = [], recipientName, userIntent, tone = "friendly" } = req.body;

  const ai = getGeminiClient();
  if (!ai) {
    return res.json({
      draft: `Hi ${recipientName || "there"}, ${userIntent || "sounds good, will get back to you soon!"}`,
      options: [
        `Hi ${recipientName || "there"}, thanks for reaching out!`,
        `Got it! I will check and follow up shortly.`,
        `Sounds great, see you then!`,
      ],
    });
  }

  try {
    const historyText = (threadContext as any[])
      .map((m) => `${m.sender.toUpperCase()}: ${m.text}`)
      .join("\n");

    const promptText = `You are the SMS drafting assistant for an Android Phone AI Agent.
Recipient: ${recipientName || "Contact"}
Tone requested: ${tone} (e.g. professional, friendly, concise, urgent)
User prompt / intent: "${userIntent}"

Recent Conversation Thread:
${historyText || "No previous messages"}

Generate:
1. The primary recommended SMS text (concise, natural for text messaging, under 160 characters if possible).
2. Two alternative quick replies or variations.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: promptText,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            draft: { type: Type.STRING },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["draft", "options"],
        },
      },
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("Draft SMS error:", error);
    res.status(500).json({ error: error.message || "Failed to draft SMS" });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Phone AI Agent server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
