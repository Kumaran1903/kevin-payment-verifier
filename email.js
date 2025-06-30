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

  const response = await resend.emails.send({
    from: `KVN Payment Bot <${process.env.FROM_EMAIL}>`,
    to: [process.env.OWNER_EMAIL],
    subject: `🧾 New Payment Submission from ${name}`,
    html: `
      <h2>New Payment Received</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>UPI ID:</strong> ${upiId}</p>
      <p><strong>Amount:</strong> ₹${amount}</p>
      <hr />
      <h3>🧠 OCR Extracted Text:</h3>
      <pre>${extractedText}</pre>
      <a href="${process.env.BASE_URL}/api/decision?status=accept&email=${encodeURIComponent(email)}&key=${process.env.VERIFICATION_SECRET}" style="padding: 10px 20px; background: green; color: white; text-decoration: none; border-radius: 8px;">✅ Accept</a>
      &nbsp;
      <a href="${process.env.BASE_URL}/api/decision?status=reject&email=${encodeURIComponent(email)}&key=${process.env.VERIFICATION_SECRET}" style="padding: 10px 20px; background: red; color: white; text-decoration: none; border-radius: 8px;">❌ Reject</a>
    `,
    attachments: [
      {
        filename: file.originalname,
        content: fileBuffer,
      },
    ],
  });

  console.log("📧 Owner email sent:", response);
}
