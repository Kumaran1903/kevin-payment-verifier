import Tesseract from "tesseract.js";
import path from "path";

export async function extractTextFromImage(filePath) {
  const absolutePath = path.resolve(filePath);
  try {
    const result = await Tesseract.recognize(absolutePath, "eng", {
      logger: (m) => console.log(m),
    });

    const text = result.data.text;

    const upiIdMatch = text.match(/[a-zA-Z0-9.\-_]{2,}@[a-zA-Z]{2,}/);
    const amountMatch = text.match(/₹\s?(\d+(\.\d+)?)/);
    const timeMatch = text.match(/\b\d{1,2}:\d{2}\s?(AM|PM)?\b/i);
    const txnIdMatch = text.match(/\b[0-9a-zA-Z]{10,}\b/);

    return {
      fullText: text,
      upiId: upiIdMatch?.[0] || "Not detected",
      amountPaid: amountMatch?.[1] || "Not detected",
      time: timeMatch?.[0] || "Not detected",
      transactionId: txnIdMatch?.[0] || "Not detected",
    };
  } catch (error) {
    console.error("❌ OCR failed:", error);
    return null;
  }
}
