# Gemini API Setup Instructions

## Step 1: Get Your API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the generated API key

## Step 2: Configure Your Application

1. In your project folder, create a file named `.env.local` (if it doesn't exist)
2. Add the following line, replacing `your_api_key_here` with your actual API key:

```
VITE_GEMINI_API_KEY=your_actual_api_key_here
```

3. Save the file

## Step 3: Restart Development Server

After adding the API key, you need to restart your development server:

1. Stop the current server (Ctrl+C in the terminal)
2. Start it again with `npm run dev`

## Step 4: Test the AI Features

1. Navigate to **AI Assistant** in the sidebar (✨ icon)
2. Try each tab:
   - **Job Analysis**: Paste a job description and click "Analyze"
   - **Cover Letter**: Select a CV, paste a job description, and generate
   - **CV Optimizer**: Paste CV text and job description for suggestions

## Important Notes

- **Free Tier**: Gemini API has a generous free tier with rate limits
- **Privacy**: Your API key is stored locally and never committed to git
- **Costs**: Monitor your usage at [Google AI Studio](https://aistudio.google.com/)

## Troubleshooting

**Error: "Gemini API key not found"**
- Make sure `.env.local` exists in the project root
- Verify the variable name is exactly `VITE_GEMINI_API_KEY`
- Restart the development server

**Error: "API key not valid"**
- Double-check you copied the entire key
- Ensure there are no extra spaces
- Try generating a new key
