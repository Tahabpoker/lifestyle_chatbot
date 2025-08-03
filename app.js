require('dotenv').config();
const axios = require('axios');
const readline = require('readline-sync');
const fs = require('fs');
const getPrompt = require('./prompt-template');

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + process.env.GEMINI_API_KEY;

// Temporary memory for the current session
let conversationHistory = [];

function buildFullPrompt(userInput) {
  const historyText = conversationHistory.map(entry => `User: ${entry.user}\nCoach: ${entry.bot}`).join('\n');
  return `
You are a helpful AI coach for lifestyle improvement.

Your job is to only answer questions related to:
- Health and Fitness
- Mental Wellness
- Time Management
- Motivation and Goals
- Nutrition
Reject unrelated topics like programming or coding.

Conversation so far:
${historyText}

User asked: "${userInput}"

Now respond accordingly:
`;
}

async function getGeminiResponse(promptText) {
  try {
    const response = await axios.post(GEMINI_API_URL, {
      contents: [{ parts: [{ text: promptText }] }]
    });

    const reply = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm not sure how to help with that.";
    return reply;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    return "Something went wrong. Try again.";
  }
}

async function main() {
  console.log("👋 Welcome to your Lifestyle Coach Bot (Type 'exit or quit' to quit)\n");

  while (true) {
    const userInput = readline.question("You: ");
    if (userInput.toLowerCase() === 'exit' | userInput.toLowerCase() === 'quit') {
      console.log("🧹 Ending session and clearing memory.");
      try {
        fs.unlinkSync('./session_log.json');
      } catch {}
      break;
    }

    const fullPrompt = buildFullPrompt(userInput);
    const botReply = await getGeminiResponse(fullPrompt);

    // Store in memory
    conversationHistory.push({ user: userInput, bot: botReply });

    // Optional: Log to temporary JSON file
    fs.writeFileSync('./session_log.json', JSON.stringify(conversationHistory, null, 2));

    console.log("Coach:", botReply + '\n');
  }
}

main();
