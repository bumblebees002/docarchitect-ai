/**
 * Document Extractor Service
 * Extracts text content from PDF and DOCX files
 */

import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Set up PDF.js worker using CDN - version 3.11.174 is stable and well-tested
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

/**
 * Extract text from a PDF file
 */
export async function extractTextFromPDF(base64Data: string): Promise<string> {
  console.log("[PDF Extractor] Starting PDF extraction...");
  console.log("[PDF Extractor] Base64 data length:", base64Data.length);
  console.log("[PDF Extractor] Worker source:", pdfjsLib.GlobalWorkerOptions.workerSrc);
  
  try {
    // Convert base64 to Uint8Array
    const binaryString = atob(base64Data);
    console.log("[PDF Extractor] Binary string length:", binaryString.length);
    
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    console.log("[PDF Extractor] Uint8Array created, length:", bytes.length);

    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({ data: bytes });
    const pdf = await loadingTask.promise;
    console.log("[PDF Extractor] PDF loaded, pages:", pdf.numPages);
    
    let fullText = '';
    
    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      console.log(`[PDF Extractor] Page ${pageNum} text length:`, pageText.length);
      fullText += pageText + '\n\n';
    }
    
    console.log("[PDF Extractor] Total extracted text length:", fullText.length);
    console.log("[PDF Extractor] First 500 chars:", fullText.substring(0, 500));
    
    return fullText.trim();
  } catch (error) {
    console.error('[PDF Extractor] Error extracting text from PDF:', error);
    throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extract text from a DOCX file
 */
export async function extractTextFromDOCX(base64Data: string): Promise<string> {
  console.log("[DOCX Extractor] Starting DOCX extraction...");
  console.log("[DOCX Extractor] Base64 data length:", base64Data.length);
  
  try {
    // Convert base64 to ArrayBuffer
    const binaryString = atob(base64Data);
    console.log("[DOCX Extractor] Binary string length:", binaryString.length);
    
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const arrayBuffer = bytes.buffer;
    console.log("[DOCX Extractor] ArrayBuffer created, byteLength:", arrayBuffer.byteLength);

    // Extract text using mammoth
    const result = await mammoth.extractRawText({ arrayBuffer });
    console.log("[DOCX Extractor] Extraction complete, text length:", result.value.length);
    console.log("[DOCX Extractor] First 500 chars:", result.value.substring(0, 500));
    
    return result.value.trim();
  } catch (error) {
    console.error('[DOCX Extractor] Error extracting text from DOCX:', error);
    throw new Error('Failed to extract text from DOCX. The file may be corrupted.');
  }
}

/**
 * Detect file type and extract text accordingly
 */
export async function extractTextFromDocument(
  base64Data: string, 
  mimeType: string,
  fileName?: string
): Promise<{ text: string; type: 'pdf' | 'docx' | 'image' | 'unknown' }> {
  console.log("[Document Extractor] ========================================");
  console.log("[Document Extractor] Starting document extraction");
  console.log("[Document Extractor] File name:", fileName);
  console.log("[Document Extractor] MIME type:", mimeType);
  console.log("[Document Extractor] Base64 data length:", base64Data?.length || 0);
  
  // Determine file type from mime type or file extension
  const isPDF = mimeType === 'application/pdf' || fileName?.toLowerCase().endsWith('.pdf');
  const isDOCX = mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
                 mimeType === 'application/msword' ||
                 fileName?.toLowerCase().endsWith('.docx') ||
                 fileName?.toLowerCase().endsWith('.doc');
  const isImage = mimeType.startsWith('image/');

  console.log("[Document Extractor] Detection - isPDF:", isPDF, "isDOCX:", isDOCX, "isImage:", isImage);

  if (isPDF) {
    console.log("[Document Extractor] Processing as PDF...");
    const text = await extractTextFromPDF(base64Data);
    console.log("[Document Extractor] PDF extraction complete, text length:", text.length);
    return { text, type: 'pdf' };
  } else if (isDOCX) {
    console.log("[Document Extractor] Processing as DOCX...");
    const text = await extractTextFromDOCX(base64Data);
    console.log("[Document Extractor] DOCX extraction complete, text length:", text.length);
    return { text, type: 'docx' };
  } else if (isImage) {
    console.log("[Document Extractor] File is an image, will use vision API");
    return { text: '', type: 'image' };
  } else {
    console.log("[Document Extractor] Unknown file type!");
    return { text: '', type: 'unknown' };
  }
}
