// mailerToClientReject.js
import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendClientRejection(toEmail) {
  try {
    const result = await resend.emails.send({
      from: `Kevinuniverse Support <${process.env.FROM_EMAIL}>`,
      to: toEmail,
      subject: "❌ Payment Verification Failed",
      html: `
        <h2>We're Sorry 😔</h2>
        <p>We couldn't verify your payment screenshot.</p>
        <p>If you believe this was a mistake, contact <b>${process.env.SUPPORT_EMAIL}</b>.</p>
      `,
    });

    console.log("📩 Rejection Email Sent:", result);
  } catch (error) {
    console.error("❌ Error sending rejection email:", error);
  }
}
