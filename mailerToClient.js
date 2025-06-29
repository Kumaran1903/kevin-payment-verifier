import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendClientMail(to) {
  const response = await resend.emails.send({
    from: "Kumar Delivery Bot <onboarding@resend.dev>",
    to,
    subject: "🎉 Your Product is Ready!",
    html: `
      <h2>✅ Payment Verified</h2>
      <p>Thanks for your payment! Click below to access your product:</p>
      <a href="${process.env.DUMMY_PRODUCT_URL}" style="display:inline-block;margin-top:10px;padding:10px 20px;background:blue;color:white;text-decoration:none;border-radius:6px;">Download Product</a>
    `,
  });

  console.log("📩 Client Email Sent:", response);
}
