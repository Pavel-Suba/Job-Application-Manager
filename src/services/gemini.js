import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini API
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
    console.warn("Gemini API key not found. Please add VITE_GEMINI_API_KEY to your .env.local file.");
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Get the model - using gemini-1.5-flash for speed and cost efficiency
export const getModel = () => {
    if (!genAI) {
        throw new Error("Gemini API not initialized. Please check your API key.");
    }
    return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
};

export { genAI };
