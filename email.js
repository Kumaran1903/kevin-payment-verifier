import fs from "fs";
import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPaymentEmail({
  name,
  email,
  upiId,
  amount,
  file,
  extractedText,
}) {
  const filePath = `uploads/${file.filename}`;
  const fileBuffer = fs.readFileSync(filePath);

  const paidAmount = parseFloat(extractedText.amountPaid);
  const expectedAmount = parseFloat(amount);

  let paymentStatus = "Not clear";
  if (!isNaN(paidAmount)) {
    if (paidAmount < expectedAmount) paymentStatus = "❗Underpaid";
    else if (paidAmount > expectedAmount) paymentStatus = "⚠️Overpaid";
    else paymentStatus = "✅ Exact";
  }

  const htmlContent = `
    <h2>🧾 New Payment Submission</h2>
    <h3>🧑 Customer Details</h3>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Amount Expected:</strong> ₹${expectedAmount}</p>

    <h3>🔍 OCR Extracted Info</h3>
    <ul>
      <li><strong>Amount Paid:</strong> ₹${extractedText.amountPaid}</li>
      <li><strong>Transaction ID:</strong> ${extractedText.transactionId}</li>
      <li><strong>Time:</strong> ${extractedText.time}</li>
      <li><strong>UPI ID in Screenshot:</strong> ${extractedText.upiId}</li>
      <li><strong>Status:</strong> ${paymentStatus}</li>
    </ul>

    <h3>🧠 Full OCR Text</h3>
    <pre style="background:#f4f4f4;padding:10px;border-radius:8px;">${extractedText.fullText}</pre>

    <h3>Owner Action:</h3>
    <a href="${process.env.BASE_URL}/api/decision?status=accept&email=${encodeURIComponent(email)}&key=${process.env.VERIFICATION_SECRET}" 
      style="padding: 10px 20px; background: green; color: white; text-decoration: none; border-radius: 6px;">✅ Accept</a>
    &nbsp;
    <a href="${process.env.BASE_URL}/api/decision?status=reject&email=${encodeURIComponent(email)}&key=${process.env.VERIFICATION_SECRET}" 
      style="padding: 10px 20px; background: red; color: white; text-decoration: none; border-radius: 6px;">❌ Reject</a>
  `;

  const response = await resend.emails.send({
    from: "Kumar Payment Bot <onboarding@resend.dev>",
    to: [process.env.OWNER_EMAIL],
    subject: `🧾 New Payment from ${name}`,
    html: htmlContent,
    attachments: [
      {
        filename: file.originalname,
        content: fileBuffer,
      },
    ],
  });

  console.log("📧 Owner email sent:", response);
}
