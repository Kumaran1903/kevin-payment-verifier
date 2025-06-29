// ocr.js
import Tesseract from "tesseract.js";
import path from "path";

export async function extractTextFromImage(filePath) {
  const absolutePath = path.resolve(filePath);

  try {
    const result = await Tesseract.recognize(absolutePath, "eng", {
      logger: (m) => console.log(m),
    });

    const extractedText = result.data.text;
    console.log("🔍 OCR Extracted Text:\n", extractedText);

    return extractedText;
  } catch (err) {
    console.error("❌ OCR Failed:", err);
    return null;
  }
}
