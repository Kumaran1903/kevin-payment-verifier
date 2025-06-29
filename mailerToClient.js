// mailerToClient.js
import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendClientMail(toEmail) {
  try {
    const result = await resend.emails.send({
      from: `KVN Delivery Bot <${process.env.FROM_EMAIL}>`,
      to: toEmail,
      subject: "✅ Your Product is Ready!",
      html: `
        <h2>Thank you for your payment!</h2>
        <p>Your product is ready. Click the button below to download:</p>
        <a href="${process.env.DUMMY_PRODUCT_URL}" style="padding: 10px 20px; background: green; color: white; text-decoration: none; border-radius: 6px;">Download Product</a>
      `,
    });

    console.log("✅ Client Mail Sent:", result);
  } catch (error) {
    console.error("❌ Error sending client mail:", error);
  }
}
