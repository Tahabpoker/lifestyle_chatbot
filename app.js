require('dotenv').config();
const axios = require('axios');
const readline = require('readline-sync');
const getPrompt = require('./prompt-template');

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + process.env.GEMINI_API_KEY;

// In-memory conversation history
const chatHistory = [];

async function getGeminiResponse(promptText) {
  try {
    const response = await axios.post(GEMINI_API_URL, {
      contents: [{ parts: [{ text: promptText }] }]
    });

    const reply = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm not sure how to help with that.";
    return reply;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

async function main() {
  console.log("👋 Welcome to your Lifestyle Coach Bot (Type 'exit' to quit)\n");

  while (true) {
    const userInput = readline.question("You: ");
    if (userInput.toLowerCase() === 'exit') break;

    // Save user message to history
    chatHistory.push({ role: 'user', content: userInput });

    // Build prompt from full history
    const prompt = getPrompt(userInput, chatHistory);

    const response = await getGeminiResponse(prompt);

    // Save assistant's response to history
    chatHistory.push({ role: 'assistant', content: response });

    console.log("Coach:", response + '\n');
  }

  console.log("👋 Session ended. Memory cleared.");
}

main();
