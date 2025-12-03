import { useState } from 'react';
import { getModel } from '../services/gemini';

export const useGemini = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);

    const analyzeJobDescription = async (jobText) => {
        setLoading(true);
        setError(null);
        try {
            const model = getModel();
            const prompt = `Analyze this job description and extract key information in JSON format:

Job Description:
${jobText}

Please provide a JSON response with the following structure:
{
  "company": "company name if mentioned",
  "position": "job title",
  "keySkills": ["skill1", "skill2", ...],
  "requirements": ["requirement1", "requirement2", ...],
  "responsibilities": ["responsibility1", "responsibility2", ...],
  "summary": "brief summary of the role"
}`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Try to parse JSON from the response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                setResult(parsed);
                return parsed;
            } else {
                throw new Error("Could not parse AI response");
            }
        } catch (err) {
            console.error("Error analyzing job description:", err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const generateCoverLetter = async (jobDescription, cvData, userProfile = {}) => {
        setLoading(true);
        setError(null);
        try {
            const model = getModel();
            const prompt = `Generate a professional cover letter based on the following information:

Job Description:
${jobDescription}

CV/Resume Information:
${JSON.stringify(cvData, null, 2)}

User Profile:
${JSON.stringify(userProfile, null, 2)}

Please write a compelling, personalized cover letter that:
1. Addresses the specific requirements in the job description
2. Highlights relevant experience and skills from the CV
3. Shows enthusiasm for the role
4. Is professional but personable
5. Is approximately 300-400 words

Format the letter with proper paragraphs.`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            setResult(text);
            return text;
        } catch (err) {
            console.error("Error generating cover letter:", err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const suggestCVImprovements = async (cvText, jobDescription) => {
        setLoading(true);
        setError(null);
        try {
            const model = getModel();
            const prompt = `Review this CV/Resume against the job description and provide specific improvement suggestions:

Job Description:
${jobDescription}

CV/Resume:
${cvText}

Please provide:
1. Key skills from the job description that should be emphasized
2. Specific sections or bullet points that should be modified
3. Keywords that should be added
4. Overall suggestions for better alignment with the role

Format your response as a structured list of actionable recommendations.`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            setResult(text);
            return text;
        } catch (err) {
            console.error("Error suggesting CV improvements:", err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        result,
        analyzeJobDescription,
        generateCoverLetter,
        suggestCVImprovements
    };
};
