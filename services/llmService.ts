
import OpenAI from "openai";
import { ResumeData } from "../types.ts";
import { extractTextFromDocument } from "./documentExtractor.ts";

const SYSTEM_INSTRUCTION = `You are the "Elite Document Architect AI". Your goal is to generate or update professional business documents in JSON format.

SUPPORTED TYPES:
1. 'resume': Professional ATS-optimized CV.
2. 'cover-letter': Persuasive letter to a hiring manager.
3. 'letterhead': Formal branded template with content.
4. 'experience-letter': Formal certification of employment and performance.

CRITICAL RULE - DOCUMENT CONTENT:
When the user provides document content (marked with "--- UPLOADED DOCUMENT CONTENT ---"), you MUST:
1. Extract and use the ACTUAL person's name from the document - DO NOT use placeholder names
2. Extract and use the ACTUAL email, phone, location from the document
3. Extract and use the ACTUAL work experience, job titles, companies, dates from the document
4. Extract and use the ACTUAL education, schools, degrees from the document
5. Extract and use the ACTUAL skills mentioned in the document
6. Extract and use ANY other information (projects, certifications, languages, etc.) from the document
7. NEVER create fictional or placeholder data when real data is available in the document

CORE RULES:
1. ANALYZE: Detect the intent. If a user asks for a cover letter, set type to 'cover-letter'.
2. ENRICH: Improve the wording and formatting, but KEEP the actual facts from the uploaded document.
3. METADATA: For letters, populate 'metadata' fields (recipientName, companyName, subject, etc.). Ensure labels like 'toLabel', 'subjectLabel', 'signOffLabel' are professional.
4. SECTION_TITLES: Provide high-prestige section titles in 'sectionTitles' if helpful.
5. CONTENT_BODY: For 'cover-letter', 'letterhead', or 'experience-letter', put the main text in 'contentBody'.
6. ATS: For resumes, use powerful keywords and quantified metrics while preserving the actual information.
7. FORMAT: Output valid JSON matching the schema precisely.

If updating: modify the provided CURRENT_STATE according to the USER_REQUEST.
If generating from uploaded document: Extract ALL real information from the document and create a professional version.
If generating new without document: architect a high-prestige document from scratch based on the prompt.

CRITICAL: You MUST respond with ONLY valid JSON (no markdown, no code blocks, no explanation). The JSON must match this exact structure:
{
  "message": "A brief architect note about the document designed.",
  "resumeData": {
    "type": "resume",
    "metadata": {
      "date": "string",
      "recipientName": "string",
      "recipientTitle": "string",
      "companyName": "string",
      "subject": "string",
      "subjectLabel": "string",
      "referenceNumber": "string",
      "referenceLabel": "string",
      "toLabel": "string",
      "signOffLabel": "string"
    },
    "sectionTitles": {
      "summary": "string",
      "skills": "string",
      "experience": "string",
      "projects": "string",
      "education": "string",
      "certifications": "string",
      "languages": "string",
      "awards": "string",
      "volunteering": "string"
    },
    "personalInfo": {
      "fullName": "string (required)",
      "jobTitle": "string",
      "email": "string (required)",
      "phone": "string",
      "location": "string",
      "summary": "string",
      "linkedin": "string",
      "website": "string",
      "profilePicture": "string"
    },
    "skills": {
      "hard": ["string"],
      "soft": ["string"],
      "tools": ["string"]
    },
    "experience": [{
      "company": "string",
      "role": "string",
      "location": "string",
      "startDate": "string",
      "endDate": "string",
      "current": false,
      "description": ["string"]
    }],
    "education": [{
      "school": "string",
      "degree": "string",
      "field": "string",
      "location": "string",
      "graduationDate": "string"
    }],
    "projects": [{
      "name": "string",
      "description": "string",
      "technologies": ["string"]
    }],
    "certifications": ["string"],
    "languages": ["string"],
    "awards": ["string"],
    "volunteering": [{
      "organization": "string",
      "role": "string",
      "description": "string"
    }],
    "contentBody": "string (main body text for letters or letterheads)"
  }
}

Remember: Output ONLY the JSON object, nothing else.`;

const getOpenAIClient = () => {
  return new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    baseURL: import.meta.env.VITE_OPENAI_BASE_URL || "https://api.openai.com/v1",
    dangerouslyAllowBrowser: true
  });
};

// Helper function to extract JSON from response that might contain markdown code blocks
const extractJSON = (text: string): string => {
  // Try to extract JSON from markdown code blocks
  const jsonBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonBlockMatch) {
    return jsonBlockMatch[1].trim();
  }
  
  // Try to find JSON object directly
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return jsonMatch[0];
  }
  
  return text.trim();
};

// Check if the mime type is an image type that can be sent to vision models
const isImageMimeType = (mimeType: string): boolean => {
  return mimeType.startsWith('image/');
};

export const architectResume = async (
  prompt: string, 
  history: { role: 'user' | 'model', content: string }[] = [], 
  currentState?: ResumeData,
  fileData?: { data: string, mimeType: string, fileName?: string }
) => {
  const openai = getOpenAIClient();
  const model = import.meta.env.VITE_OPENAI_MODEL || "gpt-4o";
  
  console.log("Using model:", model);
  console.log("Using base URL:", import.meta.env.VITE_OPENAI_BASE_URL);
  if (fileData) {
    console.log("File uploaded with mimeType:", fileData.mimeType);
  }
  
  // Convert history to OpenAI format
  const recentHistory = history.slice(-6);
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_INSTRUCTION }
  ];
  
  // Add conversation history
  recentHistory.forEach(h => {
    messages.push({
      role: h.role === 'model' ? 'assistant' : 'user',
      content: h.content
    });
  });
  
  // Build user message content
  let userContent: string | OpenAI.Chat.ChatCompletionContentPart[] = "";
  let baseTextContent = currentState 
    ? `CURRENT_STATE: ${JSON.stringify(currentState)}\n\nUSER_REQUEST: ${prompt}`
    : `USER_REQUEST: ${prompt}`;
  
  // Handle file uploads
  if (fileData) {
    try {
      // Try to extract text from the document
      const extracted = await extractTextFromDocument(fileData.data, fileData.mimeType, fileData.fileName);
      
      if (extracted.type === 'pdf' || extracted.type === 'docx') {
        // Successfully extracted text from PDF/DOCX
        console.log("Extracted text from document:", extracted.text.substring(0, 500) + "...");
        console.log("Full extracted text length:", extracted.text.length, "characters");
        
        const documentContent = `

--- UPLOADED DOCUMENT CONTENT (${fileData.fileName || 'document'}) ---
${extracted.text}
--- END OF DOCUMENT ---

MANDATORY INSTRUCTIONS FOR THIS REQUEST:
1. The document above contains REAL information about a REAL person
2. You MUST extract and use the ACTUAL name found in this document (look for names at the top or in headers)
3. You MUST extract and use the ACTUAL email address found in this document
4. You MUST extract and use the ACTUAL phone number found in this document
5. You MUST extract and use the ACTUAL work experience (companies, job titles, dates, descriptions)
6. You MUST extract and use the ACTUAL education (schools, degrees, graduation dates)
7. You MUST extract and use the ACTUAL skills listed in this document
8. DO NOT use placeholder text like "Your Name", "your.email@example.com", or "[Company Name]"
9. If any information is not found in the document, leave that field empty or omit it
10. The output should be a professional resume containing THIS PERSON'S real information`;
        
        baseTextContent = baseTextContent + documentContent;
        userContent = baseTextContent;
      } else if (extracted.type === 'image' && isImageMimeType(fileData.mimeType)) {
        // For vision models with image support - only for actual images
        console.log("Sending as vision request with image");
        userContent = [
          { type: "text", text: baseTextContent + "\n\nIMPORTANT: Analyze the uploaded image/document and extract ALL information from it to create the resume. Extract the person's name, contact info, experience, education, skills, and all other details visible in the image." },
          { 
            type: "image_url", 
            image_url: { 
              url: `data:${fileData.mimeType};base64,${fileData.data}` 
            } 
          }
        ];
      } else {
        // Unknown file type
        console.log("Unknown file type, processing as text request");
        userContent = baseTextContent + `\n\nNote: A file was uploaded (${fileData.mimeType}) but could not be processed. Please try uploading a PDF, DOCX, or image file.`;
      }
    } catch (extractError) {
      console.error("Error extracting document:", extractError);
      userContent = baseTextContent + `\n\nNote: Failed to extract text from the uploaded file. Error: ${extractError instanceof Error ? extractError.message : 'Unknown error'}. Please try a different file or copy/paste the content.`;
    }
  } else {
    userContent = baseTextContent;
  }
  
  messages.push({ role: "user", content: userContent });

  try {
    const response = await openai.chat.completions.create({
      model,
      messages,
      temperature: 0.3,
      max_tokens: 4096
    });

    const text = response.choices[0]?.message?.content;
    console.log("Raw API response:", text?.substring(0, 500));
    
    if (!text) throw new Error("Empty response from architect engine.");
    
    // Extract and parse JSON
    const jsonText = extractJSON(text);
    console.log("Extracted JSON:", jsonText.substring(0, 500));
    
    try {
      return JSON.parse(jsonText);
    } catch (parseError) {
      console.error("Failed to parse JSON response:", jsonText);
      throw new Error("Invalid JSON response from AI model.");
    }
  } catch (error: any) {
    console.error("API Error:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    
    // Handle specific error types
    if (error.status === 429) {
      throw new Error("Rate limit exceeded. Please wait a moment and try again.");
    }
    if (error.status === 401) {
      throw new Error("Invalid API key. Please check your credentials.");
    }
    if (error.status === 404) {
      throw new Error("Model not found. Please check the model name.");
    }
    if (error.status === 400) {
      // Bad request - often means the model doesn't support the request format
      const errorMsg = error.message || "Bad request";
      if (errorMsg.includes("image") || errorMsg.includes("vision")) {
        throw new Error("This model doesn't support image/vision inputs. Please use text input or try a different model.");
      }
      throw new Error(`Request error: ${errorMsg}`);
    }
    
    throw new Error(error.message || "Failed to connect to AI service.");
  }
};

export const enhancePrompt = async (prompt: string) => {
  const openai = getOpenAIClient();
  const model = import.meta.env.VITE_OPENAI_MODEL || "gpt-4o";
  
  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: "You are a professional document request enhancer. Transform user requests into high-impact briefs for an AI document architect."
        },
        {
          role: "user",
          content: `Transform this professional document request into a high-impact brief for an AI architect. 
Detect if it is for a Resume, Cover Letter, Letterhead, or Experience Letter.
Request: "${prompt}"
Output ONLY the enhanced prompt string, nothing else.`
        }
      ],
      temperature: 0.5,
      max_tokens: 500
    });

    return response.choices[0]?.message?.content || prompt;
  } catch (error) {
    console.error("Enhance prompt error:", error);
    return prompt;
  }
};

// Re-export with original name for backward compatibility
export { architectResume as architectDocument };
