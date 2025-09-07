import { GoogleGenAI, Type } from '@google/genai';
import { Exercise, Feedback } from '../types';
import { GEMINI_MODEL_NAME } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const analyzePoseSchema = {
  type: Type.OBJECT,
  properties: {
    isCorrect: {
      type: Type.BOOLEAN,
      description: 'Whether the user\'s pose is correct based on the instructions.',
    },
    feedback: {
      type: Type.STRING,
      description: 'Specific, concise feedback for the user to improve their form. Should be encouraging. If the form is good, provide positive reinforcement.',
    },
    score: {
        type: Type.INTEGER,
        description: 'A score from 0 to 100 representing the accuracy of the pose.',
    },
    keypoints: {
      type: Type.ARRAY,
      description: 'An array of key body joints detected in the image. Ensure all joints listed in POSE_CONNECTIONS are included if visible.',
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: 'Name of the keypoint (e.g., "left_shoulder", "right_wrist").' },
          x: { type: Type.NUMBER, description: 'Normalized x-coordinate (0-1) from left to right.' },
          y: { type: Type.NUMBER, description: 'Normalized y-coordinate (0-1) from top to bottom.' },
        },
        required: ['name', 'x', 'y'],
      },
    },
  },
  required: ['isCorrect', 'feedback', 'score'],
};

export const analyzePose = async (
    imageDataUrl: string, 
    exercise: Exercise, 
    strictness: 'low' | 'medium' | 'high' = 'medium'
): Promise<Feedback> => {
  const base64ImageData = imageDataUrl.split(',')[1];
  if (!base64ImageData) {
      throw new Error("Invalid image data URL provided.");
  }

  const imagePart = {
    inlineData: {
      mimeType: 'image/jpeg',
      data: base64ImageData,
    },
  };

  const instructionsText = exercise.instructions.map(inst => `- ${inst}`).join('\n');
  
  const strictnessMap = {
    low: "Relaxed: Focus only on major errors that could cause injury.",
    medium: "Standard: Be accurate and point out clear deviations from good form.",
    high: "Strict: Be very critical and comment on even minor imperfections to help the user achieve perfect form."
  };

  const prompt = `
    You are an expert AI personal trainer. Your task is to analyze the user's pose in the provided image for the exercise: "${exercise.name}".

    **Analysis Strictness:** ${strictnessMap[strictness]}

    **Key Instructions to Evaluate Against:**
    ${instructionsText}

    **Your Analysis Process:**
    1.  **Determine Viewpoint:** First, identify the camera angle (e.g., front view, side view, 45-degree view). Your feedback must be based on what is visible. If a key aspect (like back straightness) isn't visible, infer it from other keypoints if possible, or focus on visible aspects.
    2.  **Analyze Pose:** Evaluate the user's form against the instructions, paying close attention to common errors for a ${exercise.name}. For example, for a Squat, check for knees caving in, back rounding, or insufficient depth. For a Push-up, check for hip sagging or flaring elbows.
    3.  **Provide Feedback:** Generate a JSON response according to the schema. The feedback should be the single most important, actionable correction the user can make. If the form is good, provide specific positive reinforcement (e.g., "Excellent depth on that squat!").

    Your analysis must be accurate based on the set strictness level. From the image, detect the user's body keypoints and their normalized coordinates (0-1 range).

    Then, respond with a JSON object that strictly adheres to the provided schema. Do not add any explanations or introductory text outside of the JSON object.
  `;

  const textPart = { text: prompt };
  
  try {
    const response = await ai.models.generateContent({
        model: GEMINI_MODEL_NAME,
        contents: { parts: [imagePart, textPart] },
        config: {
          responseMimeType: 'application/json',
          responseSchema: analyzePoseSchema,
        },
    });

    const jsonText = response.text.trim();
    if (!jsonText) {
        throw new Error("Received an empty response from the AI. The pose may not be detectable.");
    }

    const result = JSON.parse(jsonText);
    return result as Feedback;

  } catch (error) {
    console.error('Error analyzing pose with Gemini:', error);
    if (error instanceof Error) {
        throw new Error(`AI analysis failed. Please check your connection and try again. Details: ${error.message}`);
    }
    throw new Error('An unknown error occurred while analyzing the pose.');
  }
};
