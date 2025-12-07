
import { GoogleGenAI, Type, Modality, LiveServerMessage } from "@google/genai";
import { QuizQuestion, DictionaryData, TranslationResult, StudyGuide, Message, Roadmap } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Use Gemini 2.5 Flash model as specified in the requirements
const MODEL_FAST = 'gemini-2.5-flash';
const MODEL_SMART = 'gemini-2.5-flash';
const MODEL_AUDIO = 'gemini-2.5-flash';
const MODEL_LIVE = 'gemini-2.5-flash';

// Helper to ensure an item is an array
const ensureArray = (item: any): any[] => Array.isArray(item) ? item : [];

// Helper to sanitize Quiz Questions ensuring options is always an array
const sanitizeQuestions = (input: any): QuizQuestion[] => {
  // Handle both root array and root object with questions property
  const rawList = Array.isArray(input) ? input : (input?.questions && Array.isArray(input.questions) ? input.questions : []);
  
  return rawList.map((item: any) => {
    let options: string[] = [];
    
    // Robustly extract options
    if (Array.isArray(item.options)) {
        options = item.options.map(String);
    } else if (item.choices && Array.isArray(item.choices)) {
        options = item.choices.map(String);
    } else if (typeof item.options === 'object' && item.options !== null) {
        // Handle case where options might be {a: "...", b: "..."}
        options = Object.values(item.options).map(String);
    }

    // Default Fallback if completely empty (should be rare with Pro model + Schema)
    if (options.length < 2) {
        options = ["True", "False"];
    }

    // Ensure correct answer matches an option. Force string conversion to prevent TypeErrors later.
    let correctAnswerStr = String(item.correctAnswer || options[0] || "");
    
    // 1. If correct Answer is an index number
    if (typeof item.correctAnswer === 'number' && options[item.correctAnswer]) {
        correctAnswerStr = options[item.correctAnswer];
    }
    // 2. If correct answer is a letter "A", "B", etc.
    else if (correctAnswerStr.length === 1 && /^[A-D]$/i.test(correctAnswerStr)) {
        const index = correctAnswerStr.toUpperCase().charCodeAt(0) - 65;
        if (options[index]) correctAnswerStr = options[index];
    }
    // 3. If strictly not in options, try to fuzzy match
    else if (!options.includes(correctAnswerStr)) {
        const fuzzy = options.find(opt => opt.toLowerCase() === correctAnswerStr.toLowerCase());
        if (fuzzy) {
            correctAnswerStr = fuzzy;
        } else {
             // If still no match, check if correct answer is a substring of an option
             const contains = options.find(opt => opt.includes(correctAnswerStr) || correctAnswerStr.includes(opt));
             if (contains) correctAnswerStr = contains;
             else correctAnswerStr = options[0]; // Absolute fallback
        }
    }

    return {
      question: item.question || "Question unavailable",
      options: options,
      correctAnswer: correctAnswerStr,
      explanation: item.explanation || "No explanation provided."
    };
  });
};

// Helper to safely parse JSON from AI response
const cleanAndParseJSON = (text: string | undefined): any => {
  if (!text) return null;
  try {
    // 1. Try strict parse first
    return JSON.parse(text);
  } catch (e) {
    // 2. Try removing markdown code blocks
    const textStr = text.toString();
    const markdownRegex = /```(?:json)?\s*([\s\S]*?)\s*```/;
    const match = textStr.match(markdownRegex);
    
    if (match && match[1]) {
      try {
        return JSON.parse(match[1]);
      } catch (e2) {
        // Continue
      }
    }
    
    // 3. Find outermost braces for Object or Array
    const firstOpenBrace = textStr.indexOf('{');
    const firstOpenBracket = textStr.indexOf('[');
    const lastCloseBrace = textStr.lastIndexOf('}');
    const lastCloseBracket = textStr.lastIndexOf(']');
    
    // Determine if we look for { } or [ ] based on which comes first
    let start = -1;
    let end = -1;

    if (firstOpenBrace !== -1 && (firstOpenBracket === -1 || firstOpenBrace < firstOpenBracket)) {
        start = firstOpenBrace;
        end = lastCloseBrace;
    } else if (firstOpenBracket !== -1) {
        start = firstOpenBracket;
        end = lastCloseBracket;
    }

    if (start !== -1 && end !== -1 && end > start) {
        try {
            return JSON.parse(textStr.substring(start, end + 1));
        } catch(e3) {
            console.warn("Failed to clean and parse JSON via substring:", e3);
            return null;
        }
    }
    
    return null;
  }
};

/**
 * Helper: Base64 Decode
 */
function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Helper: Decode Audio Data (PCM to AudioBuffer)
 */
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

/**
 * Generate Speech (TTS) using Gemini
 */
export const speakText = async (text: string, langName: string = 'English'): Promise<void> => {
  try {
    const prompt = `Read the following ${langName} text clearly and naturally. Do not translate it, just read it as is. Text: "${text}"`;

    const response = await ai.models.generateContent({
      model: MODEL_AUDIO,
      contents: { parts: [{ text: prompt }] },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Puck' },
            },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (base64Audio) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass({ sampleRate: 24000 });
      
      const audioBytes = decodeBase64(base64Audio);
      const audioBuffer = await decodeAudioData(audioBytes, audioCtx);
      
      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);
      source.start();
    } else {
        throw new Error("No audio data returned");
    }
  } catch (error) {
    console.error("TTS Error:", error);
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  }
};

/**
 * Advanced Translation
 */
export const translateAdvanced = async (
  text: string,
  targetLang: string,
  tone: string = 'Standard'
): Promise<TranslationResult> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: `Translate the following text into ${targetLang}. 
      Tone: ${tone}.
      Input Text: "${text}"
      
      Return JSON object.`,
      config: {
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 },
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            translatedText: { type: Type.STRING },
            transliteration: { type: Type.STRING, nullable: true },
            culturalNote: { type: Type.STRING, nullable: true },
            detectedLanguage: { type: Type.STRING, nullable: true },
          }
        }
      }
    });

    const data = cleanAndParseJSON(response.text);
    if (!data) throw new Error("Invalid JSON response");
    
    return data as TranslationResult;
  } catch (error) {
    console.error("Translation Error:", error);
    return { translatedText: "Translation unavailable." };
  }
};

/**
 * Chat Tutor
 */
export const chatWithTutor = async (
  message: string,
  history: { role: 'user' | 'model'; content: string }[],
  useSearch: boolean,
  targetLang: string
): Promise<{ text: string; sources?: { uri: string; title: string }[] }> => {
  try {
    const tools = useSearch ? [{ googleSearch: {} }] : [];
    
    // Updated system instruction to cover general subjects
    const systemInstruction = `You are Luminous, an AI tutor.
    Your expertise covers:
    1. Language learning (Specializing in ${targetLang}).
    2. General academic subjects including Math, Science, Programming, History, and Social Studies.

    Be helpful, concise, and encourage the student. 
    If the user asks for translations, provide them and explain the grammar. 
    If the user asks about a complex topic (e.g. "Quantum Computing", "Calculus"), explain it clearly in ${targetLang} (or in English if appropriate).
    Do not limit yourself to only language teaching if the user asks about other subjects.
    If useSearch is on, use it to find real-time info about culture or news.`;
    
    const response = await ai.models.generateContent({
      model: MODEL_SMART,
      contents: [
        ...history.map(h => ({ role: h.role, parts: [{ text: h.content }] })),
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction,
        tools,
      }
    });

    const text = response.text || "I'm having trouble connecting to the neural network.";
    
    let sources: { uri: string; title: string }[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks && Array.isArray(chunks)) {
        sources = chunks
        .map((chunk: any) => chunk.web)
        .filter((web: any) => web)
        .map((web: any) => ({ uri: web.uri, title: web.title }));
    }

    return { text, sources };
  } catch (error: any) {
    console.error("Chat Error:", error);
    
    // Handle specific error cases
    if (error.status === 429) {
      return { 
        text: "I've reached my usage limit for now. This is due to API rate limiting. Please try again in a few minutes or check your API key configuration." 
      };
    } else if (error.message?.includes("API_KEY")) {
      return { 
        text: "There seems to be an issue with the API key configuration. Please check your .env.local file and ensure your GEMINI_API_KEY is correctly set." 
      };
    }
    
    return { text: "Connection interrupted. Please try again in a moment." };
  }
};

/**
 * Generate Quiz
 */
export const generateQuiz = async (topic: string, lang: string, count: number = 5): Promise<QuizQuestion[]> => {
  try {
    // Using gemini-3-pro-preview for complex reasoning and better structure adherence as requested.
    const response = await ai.models.generateContent({
      model: MODEL_SMART, 
      contents: `You are an expert tutor. Generate a high-quality multiple-choice quiz about "${topic}" in ${lang}.
      
      Requirements:
      - Create exactly ${count} questions.
      - Each question MUST have exactly 4 distinct options.
      - One option is the correct answer.
      - Provide a clear, educational explanation for the answer.
      - Return STRICT JSON format matching the schema.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING, description: "The quiz question text" },
                  options: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING },
                    description: "An array of 4 possible answer strings"
                  },
                  correctAnswer: { type: Type.STRING, description: "The string text of the correct option, must match one of the options exactly" },
                  explanation: { type: Type.STRING, description: "Explanation why the answer is correct" },
                },
                required: ["question", "options", "correctAnswer", "explanation"]
              }
            }
          }
        }
      }
    });

    const parsed = cleanAndParseJSON(response.text);
    if (!parsed) return [];
    
    const questions = sanitizeQuestions(parsed);
    return questions.slice(0, count);
  } catch (error) {
    console.error("Quiz Gen Error:", error);
    return [];
  }
};

/**
 * Generate Study Guide
 */
export const generateStudyGuide = async (
  fileData: { base64: string; mimeType: string }, 
  lang: string
): Promise<StudyGuide | null> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: fileData.mimeType,
              data: fileData.base64
            }
          },
          {
            text: `Analyze content. Target Lang: ${lang}. Return JSON study guide.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 },
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
            vocabulary: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  term: { type: Type.STRING },
                  definition: { type: Type.STRING },
                  translation: { type: Type.STRING },
                }
              }
            }
          }
        }
      }
    });

    const data = cleanAndParseJSON(response.text);
    if (!data) throw new Error("Invalid JSON response");

    return {
        summary: data.summary || "",
        keyPoints: ensureArray(data.keyPoints),
        vocabulary: ensureArray(data.vocabulary)
    };
  } catch (error) {
    console.error("Study Guide Error:", error);
    return null;
  }
};

/**
 * Generate Learning Roadmap
 */
export const generateLearningRoadmap = async (
  topic: string, 
  difficulty: string, 
  lang: string
): Promise<Roadmap | null> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: `Act as an expert career and education counselor. Create a detailed, step-by-step learning roadmap for the topic: "${topic}".
      Difficulty Level: ${difficulty}.
      Language: ${lang}.
      
      Requirements:
      - Break it down into logical phases.
      - Include duration for each phase.
      - List key topics to master in each phase.
      - Provide a comprehensive description.
      `,
      config: {
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 },
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            difficulty: { type: Type.STRING },
            phases: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  phaseTitle: { type: Type.STRING },
                  duration: { type: Type.STRING },
                  description: { type: Type.STRING },
                  topics: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
              }
            }
          }
        }
      }
    });

    const data = cleanAndParseJSON(response.text);
    if (!data) return null;

    return {
      title: data.title || "Untitled Roadmap",
      description: data.description,
      difficulty: data.difficulty,
      phases: ensureArray(data.phases)
    };
  } catch (error) {
    console.error("Roadmap Error:", error);
    return null;
  }
};

/**
 * Lookup Word
 */
export const lookupWord = async (word: string, lang: string): Promise<DictionaryData | null> => {
  try {
    // Explicitly requesting all fields to ensure the model populates the schema
    const prompt = `
      Act as a comprehensive dictionary. 
      Word: "${word}"
      User Language: ${lang}
      
      Tasks:
      1. Define the word clearly in ${lang}.
      2. Provide the phonetic transcription.
      3. Translate the word into 5 diverse major languages (e.g. Spanish, French, German, Hindi, Japanese, Chinese).
      4. Provide 3 distinct example sentences showing usage in ${lang}.
      5. List synonyms and antonyms.

      Return the result as a valid JSON object matching the schema.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 },
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            word: { type: Type.STRING },
            phonetic: { type: Type.STRING },
            definition: { type: Type.STRING },
            translations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  lang: { type: Type.STRING },
                  text: { type: Type.STRING }
                }
              }
            },
            examples: { type: Type.ARRAY, items: { type: Type.STRING } },
            synonyms: { type: Type.ARRAY, items: { type: Type.STRING } },
            antonyms: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });

    const data = cleanAndParseJSON(response.text);
    if (!data) throw new Error("Invalid JSON response");

    return {
        word: data.word,
        phonetic: data.phonetic || '',
        definition: data.definition,
        translations: ensureArray(data.translations),
        examples: ensureArray(data.examples),
        synonyms: ensureArray(data.synonyms),
        antonyms: ensureArray(data.antonyms)
    };
  } catch (error) {
    console.error("Dictionary Error:", error);
    return null;
  }
};

/**
 * Generate Exam
 */
export const generateExam = async (subject: string, type: 'weekly' | 'monthly', lang: string): Promise<QuizQuestion[]> => {
  try {
    const numQuestions = type === 'weekly' ? 10 : 25;
    const difficulty = type === 'weekly' ? 'Medium' : 'Hard';

    // Using MODEL_SMART for exams as well to ensure high quality
    const response = await ai.models.generateContent({
      model: MODEL_SMART,
      contents: `Generate ${difficulty} ${type} exam for "${subject}" in ${lang}.
      Count: Exactly ${numQuestions} questions.
      Format: Strict JSON object with "questions" array.
      Ensure high accuracy and variety.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctAnswer: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                },
                required: ["question", "options", "correctAnswer", "explanation"]
              }
            }
          }
        }
      }
    });

    const parsed = cleanAndParseJSON(response.text);
    if (!parsed) return [];

    const questions = sanitizeQuestions(parsed);
    return questions.slice(0, numQuestions);
  } catch (error) {
    console.error("Exam Gen Error:", error);
    return [];
  }
};

/**
 * Generate Exam Feedback
 */
export const generateExamFeedback = async (
  questions: QuizQuestion[],
  answers: {[key: number]: string},
  subject: string,
  type: string,
  lang: string
): Promise<string> => {
  try {
    const summary = questions.map((q, i) => `Q: ${q.question} | Correct: ${q.correctAnswer} | User Answer: ${answers[i] || 'Skipped'}`).join('\n');
    
    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: `Analyze exam results. Subject: ${subject}. Lang: ${lang}.
      Provide concise constructive feedback (max 100 words).
      Data: ${summary}`,
      config: {
        thinkingConfig: { thinkingBudget: 0 },
      }
    });

    return response.text || "Analysis unavailable.";
  } catch (error) {
    return "Could not generate feedback.";
  }
};

/**
 * Start Live Translation Session
 */
export const startLiveSession = async (
  sourceLang: string,
  targetLang: string,
  onTranscript: (text: string, type: 'input' | 'output') => void,
  onError: (err: any) => void
) => {
  try {
    // Create new instance to ensure clean state
    const liveAi = new GoogleGenAI({ apiKey: process.env.API_KEY });
    let nextStartTime = 0;
    
    // Setup Audio Contexts
    const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const outputNode = outputAudioContext.createGain();
    outputNode.connect(outputAudioContext.destination);
    
    // Get Mic Stream
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    const sessionPromise = liveAi.live.connect({
      model: MODEL_LIVE,
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } },
        },
        // IMPORTANT: systemInstruction must be a string for Live API.
        systemInstruction: `You are a helpful simultaneous interpreter. 
          You will hear a conversation involving two languages: ${sourceLang} and ${targetLang}.
          If you hear ${sourceLang}, translate it to ${targetLang}.
          If you hear ${targetLang}, translate it to ${sourceLang}.
          Output only the translated audio. Do not include your own thoughts or conversational fillers.`,
      },
      callbacks: {
        onopen: () => {
          console.log("Live Session Connected");
          
          // Setup Audio Processing
          const source = inputAudioContext.createMediaStreamSource(stream);
          const processor = inputAudioContext.createScriptProcessor(4096, 1, 1);
          
          processor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            
            // PCM 16-bit Conversion
            const pcm16 = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) {
                pcm16[i] = inputData[i] * 0x7FFF;
            }
            
            // Base64 Encode manually
            const uint8 = new Uint8Array(pcm16.buffer);
            let binary = '';
            const len = uint8.byteLength;
            for (let i = 0; i < len; i++) {
                binary += String.fromCharCode(uint8[i]);
            }
            const b64 = btoa(binary);

            sessionPromise.then(session => {
              session.sendRealtimeInput({
                media: {
                  mimeType: 'audio/pcm;rate=16000',
                  data: b64
                }
              });
            });
          };

          source.connect(processor);
          processor.connect(inputAudioContext.destination);
        },
        onmessage: async (msg: LiveServerMessage) => {
           // Handle Transcripts
           if (msg.serverContent?.inputTranscription?.text) {
               onTranscript(msg.serverContent.inputTranscription.text, 'input');
           }
           if (msg.serverContent?.outputTranscription?.text) {
               onTranscript(msg.serverContent.outputTranscription.text, 'output');
           }

           // Handle Audio Output
           const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
           if (audioData) {
              const binaryString = atob(audioData);
              const len = binaryString.length;
              const bytes = new Uint8Array(len);
              for (let i = 0; i < len; i++) {
                  bytes[i] = binaryString.charCodeAt(i);
              }

              const dataInt16 = new Int16Array(bytes.buffer);
              const buffer = outputAudioContext.createBuffer(1, dataInt16.length, 24000);
              const channelData = buffer.getChannelData(0);
              for(let i=0; i<dataInt16.length; i++) {
                  channelData[i] = dataInt16[i] / 32768.0;
              }

              const source = outputAudioContext.createBufferSource();
              source.buffer = buffer;
              source.connect(outputNode);
              
              const now = outputAudioContext.currentTime;
              const startTime = Math.max(now, nextStartTime);
              source.start(startTime);
              nextStartTime = startTime + buffer.duration;
           }
        },
        onclose: () => {
            console.log("Live Session Closed");
        },
        onerror: (err) => {
            console.error("Live Session Error", err);
            onError(err);
        }
      }
    });

    // Return cleanup function
    return () => {
       stream.getTracks().forEach(t => t.stop());
       inputAudioContext.close();
       outputAudioContext.close();
       // sessionPromise.then(s => s.close && s.close());
    };

  } catch (e) {
    onError(e);
    return () => {};
  }
};
