import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Lazily initializes and returns the Gemini generative model.
 * Throws a clean error if the API key is not configured, preventing module load crashes.
 */
function getGenerativeModel(modelName = 'gemini-3.5-flash-lite') {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '') {
    throw new Error('MISSING_API_KEY');
  }

  const genAI = new GoogleGenerativeAI(apiKey.trim());
  return genAI.getGenerativeModel({
    model: modelName,
  });
}

/**
 * Maps raw API/client errors to user-safe messages without leaking sensitive key information.
 */
function formatErrorMessage(error: unknown, fallbackMessage: string): string {
  if (error instanceof Error) {
    if (error.message === 'MISSING_API_KEY') {
      return 'HealthSphere AI is not configured. Please set a valid Gemini API key in your environment.';
    }

    const msg = error.message.toLowerCase();
    if (msg.includes('api key not valid') || msg.includes('api_key_invalid') || msg.includes('unauthorized') || msg.includes('403')) {
      return 'Authentication failed with the AI service. Please verify your Gemini API key.';
    }

    if (msg.includes('resource_exhausted') || msg.includes('quota') || msg.includes('429')) {
      return 'HealthSphere AI request limit reached. Please wait a moment before trying again.';
    }

    if (msg.includes('failed to fetch') || msg.includes('network') || msg.includes('timeout')) {
      return 'Network error connecting to the AI service. Please check your internet connection and try again.';
    }
  }

  return fallbackMessage;
}

export async function askMedicalAssistant(message: string): Promise<string> {
  try {
    const model = getGenerativeModel();

    const prompt = `
You are HealthSphere AI, a helpful healthcare assistant.

Rules:
- Provide educational and wellness guidance only.
- Do not give a final medical diagnosis.
- Encourage consulting a healthcare professional for serious symptoms.
- Keep answers clear, concise, supportive, and easy to understand.

User question:
${message}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error: unknown) {
    console.error('Gemini Assistant Error:', error instanceof Error ? error.message : 'Unknown error');
    return formatErrorMessage(error, 'Sorry, I am unable to connect to the AI service right now. Please try again later.');
  }
}

export async function analyzeMedicalReport(reportText: string): Promise<string> {
  try {
    const model = getGenerativeModel();
    const prompt = `Analyze this medical report and provide a brief summary of key findings, abnormal values, and recommendations:\n\n${reportText}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error: unknown) {
    console.error('Gemini Report Analysis Error:', error instanceof Error ? error.message : 'Unknown error');
    return formatErrorMessage(error, 'Analysis temporarily unavailable. Please try again later.');
  }
}
