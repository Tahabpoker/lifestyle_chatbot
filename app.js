require('dotenv').config();
const axios = require('axios');
const readline = require('readline-sync');
const getPrompt = require('./prompt-template');

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + process.env.GEMINI_API_KEY;

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

    const prompt = getPrompt(userInput);
    const response = await getGeminiResponse(prompt);
    console.log("Coach:", response + '\n');
  }
}

main();
