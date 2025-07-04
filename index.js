import express from "express";
import multer from "multer";
import dotenv from "dotenv";
import cors from "cors";
import fs from "fs";

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
    const { name, email, amount, products: productsRaw } = req.body;
    const file = req.file;

    let products = [];
    if (productsRaw) {
      try {
        products = JSON.parse(productsRaw);
      } catch {
        return res.status(400).json({ error: "Invalid products format." });
      }
    }

    if (!file)
      return res.status(400).json({ error: "Screenshot is required." });

    const newEntry = new Payment({
      name,
      email,
      amount,
      products,
    });
    await newEntry.save();

    const extractedText = await extractTextFromImage(file.path);
    newEntry.ocrText = extractedText;
    await newEntry.save();

    console.log("🧠 OCR Text:\n", extractedText);

    await sendPaymentEmail({
      name,
      email,
      amount,
      extractedText,
      file,
      products,
    });

    res.status(200).json({ message: "Payment submission received!" });
  } catch (error) {
    console.error("❌ Error in /api/verify:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

app.get("/api/decision", async (req, res) => {
  const { status, email, products, key } = req.query;

  if (key !== process.env.VERIFICATION_SECRET)
    return res.status(403).send("❌ Invalid key");

  if (status === "accept") {
    await sendClientMail(email, products || []);
    return res.send("✅ Accepted. Product sent.");
  } else {
    await sendClientRejection(email);
    return res.send("❌ Rejected. Client notified.");
  }
});

app.get("/", (req, res) => {
  res.send("✅ Payment backend running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Running at http://localhost:${PORT}`);
});
