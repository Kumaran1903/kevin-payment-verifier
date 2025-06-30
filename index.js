// server.js or index.js
import express from "express";
import multer from "multer";
import dotenv from "dotenv";
import cors from "cors";
import fs from "fs";
import path from "path";

import { sendClientMail } from "./mailerToClient.js";
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

    const newEntry = new Payment({
      name,
      email,
      upiId,
      amount,
      filename: file.filename,
    });
    await newEntry.save();

    const extractedText = await extractTextFromImage(file.path);
    newEntry.ocrText = extractedText;
    await newEntry.save();

    console.log("\ud83e\udde0 OCR Text:\n", extractedText);

    await sendPaymentEmail({ name, email, upiId, amount, file, extractedText });

    res.status(200).json({ message: "Payment submission received!" });
  } catch (error) {
    console.error("\u274c Error in /api/verify:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/decision", async (req, res) => {
  const { status, email, key } = req.query;

  if (key !== process.env.VERIFICATION_SECRET)
    return res.status(403).send("\u274c Invalid key");
  if (!email || !status)
    return res.status(400).send("\u2757 Missing parameters");

  const entry = await Payment.findOne({ email });
  if (!entry) return res.status(404).send("\u274c No payment found");

  entry.status = status;
  await entry.save();

  if (status === "accept") {
    await sendClientMail(email);
    return res.send("\u2705 Accepted. Product sent.");
  } else {
    await sendClientRejection(email);
    return res.send("\u274c Rejected. Client notified.");
  }
});

app.get("/", (req, res) => {
  res.send("\u2705 Payment backend running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\ud83d\ude80 Running at http://localhost:${PORT}`);
});
    