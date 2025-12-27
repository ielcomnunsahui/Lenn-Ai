/**
 * Supabase Edge Function: gemini-chat
 * 
 * PURPOSE: Secure proxy for Gemini API chat queries
 * SECURITY: API key stored server-side, never exposed to browser
 * 
 * Deploy: supabase functions deploy gemini-chat
 * Set secret: supabase secrets set GEMINI_API_KEY=your-key-here
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { GoogleGenAI, Type } from 'npm:@google/genai@1.3.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get Gemini API key from environment (server-side only)
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not configured in Edge Function secrets');
    }

    // Parse request body
    const { text, history = [] } = await req.json();

    if (!text) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: text' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Gemini AI
    const ai = new GoogleGenAI({ apiKey });

    // System instruction for chatbot
    const systemInstruction = `You are Lennai, an AI Learning Assistant for nursing and health science students.
    SECTION: CHATBOT (QUESTION-BASED LEARNING)

    PURPOSE:
    Strictly for typed questions and follow-ups.

    BEHAVIOR RULES:
    1. Treat the user's question as the learning topic.
    2. Automatically identify the subject and explain in simple language.
    3. Generate visual guide descriptions and practice questions.
    4. STUDY AIDS: Automatically generate concise SLIDES and Q/A FLASHCARDS based on the topic.

    OUTPUT STRUCTURE (MANDATORY ORDER):
    - Topic Title
    - Simple Explanation
    - Key Points
    - Visual Guide Description
    - Exam Focus
    - Practice Questions (NCLEX-style)
    - Slides Section
    - Flashcards Section`;

    // Build history context
    const historyParts = history.map((h: any) => ({
      text: `${h.role === 'user' ? 'Student' : 'Lennai'}: ${h.content}`
    }));

    // Response schema
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        topicTitle: { type: Type.STRING },
        simpleExplanation: { type: Type.STRING },
        keyConcepts: { type: Type.ARRAY, items: { type: Type.STRING } },
        visualGuide: { type: Type.STRING },
        examFocus: { type: Type.STRING },
        practiceQuestions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              text: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.INTEGER },
              explanation: { type: Type.STRING }
            },
            required: ['id', 'text', 'options', 'correctAnswer', 'explanation']
          }
        },
        slides: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
              imageDescription: { type: Type.STRING },
              notes: { type: Type.STRING }
            },
            required: ['title', 'bullets', 'imageDescription']
          }
        },
        flashcards: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              front: { type: Type.STRING },
              back: { type: Type.STRING }
            },
            required: ['front', 'back']
          }
        },
        subject: { type: Type.STRING }
      },
      required: ['topicTitle', 'simpleExplanation', 'keyConcepts', 'visualGuide', 'examFocus', 'practiceQuestions', 'subject', 'slides', 'flashcards']
    };

    // Call Gemini API
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: [{
        parts: [
          { text: systemInstruction },
          ...historyParts,
          { text: `Question: ${text}` }
        ]
      }],
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema as any
      }
    });

    const result = JSON.parse(response.text || '{}');

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Edge Function Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});