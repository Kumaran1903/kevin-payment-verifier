import Tesseract from "tesseract.js";
import path from "path";

export async function extractTextFromImage(filePath) {
  const absolutePath = path.resolve(filePath);

  try {
    const result = await Tesseract.recognize(absolutePath, "eng", {
      logger: (m) => console.log(m),
    });

    const text = result.data.text;
    console.log("🔍 Full OCR Text:\n", text);

    const amountRegex = /(?:₹|\$|INR|Rs\.?)\s?(\d+(?:,\d{3})*(?:\.\d{1,2})?)/i;
    const txnIdRegex = /(?:Txn|Transaction)\s*(?:ID|Id)[:\s-]*([A-Z0-9]+)/i;
    const timeRegex = /(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i;
    const upiRegex = /[a-zA-Z0-9_.\-]+@[a-zA-Z]+/;

    const amountMatch = text.match(amountRegex);
    const transactionMatch = text.match(txnIdRegex);
    const timeMatch = text.match(timeRegex);
    const upiMatch = text.match(upiRegex);

    const ocrSummary = {
      fullText: text,
      upiId: upiMatch?.[0] || "Not detected",
      amountPaid: amountMatch?.[1] || "Not detected",
      time: timeMatch?.[0] || "Not detected",
      transactionId: transactionMatch?.[1] || "Not detected",
    };

    console.log("✅ Extracted Details:", ocrSummary);
    return ocrSummary;
  } catch (err) {
    console.error("❌ OCR Failed:", err);
    return null;
  }
}
