import Tesseract from "tesseract.js";
import path from "path";

export async function extractTextFromImage(filePath) {
  const absolutePath = path.resolve(filePath);
  try {
    const result = await Tesseract.recognize(absolutePath, "eng", {
      logger: (m) => console.log(m),
    });
    return result.data.text;
  } catch (error) {
    console.error("❌ OCR failed:", error);
    return null;
  }
}
