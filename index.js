import express from "express";
import multer from "multer";
import dotenv from "dotenv";
import cors from "cors";
import fs from "fs";
import path from "path";
import { sendClientMail } from "./mailerToClient.js"; // we’ll make this next
import { sendClientRejection } from "./mailerToClientReject.js";

import { connectDB } from "./db.js";
import { sendPaymentEmail } from "./email.js";
import { extractTextFromImage } from "./ocr.js";
import Payment from "./models/Payment.js";

dotenv.config();

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(cors());
app.use(express.json());

connectDB();

app.post("/api/verify", upload.single("screenshot"), async (req, res) => {
  try {
    const { name, email, upiId, amount } = req.body;
    const file = req.file;

    if (!file)
      return res.status(400).json({ error: "Screenshot is required." });

    // Step 1: Save to MongoDB (initially without OCR)
    const newEntry = new Payment({
      name,
      email,
      upiId,
      amount,
      filename: file.filename,
    });
    await newEntry.save();

    // Step 2: Run OCR on the image
    const extractedText = await extractTextFromImage(file.path);
    console.log("🧠 OCR Extracted Text:\n", extractedText);

    // Step 3: Update DB entry with OCR result
    newEntry.ocrText = extractedText;
    await newEntry.save();

    // Step 4: Send email to owner
    await sendPaymentEmail({ name, email, upiId, amount, file, extractedText });

    return res.status(200).json({ message: "Payment submission received!" });
  } catch (error) {
    console.error("❌ Error in /api/verify:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

app.get("/api/decision", async (req, res) => {
  const { status, email, key } = req.query;

  if (key !== process.env.VERIFICATION_SECRET) {
    return res.status(403).send("❌ Invalid verification key.");
  }

  if (!email || !status) {
    return res.status(400).send("❗ Missing parameters.");
  }

  // Find the record in DB
  const entry = await Payment.findOne({ email });
  if (!entry)
    return res.status(404).send("❌ No payment found for this email.");

  // Update decision
  entry.status = status;
  await entry.save();

  // Send client result
  if (status === "accept") {
    await sendClientMail(email);
    return res.send("✅ Payment approved. Product sent to client.");
  } else {
    await sendClientRejection(email);
    return res.send("❌ Payment rejected. Client notified.");
  }
});

app.get("/", (req, res) => {
  res.send("✅ Payment verifier backend is running.");
});
