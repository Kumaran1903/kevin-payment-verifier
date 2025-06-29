import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.mailersend.net",
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAILERSEND_USERNAME,
    pass: process.env.MAILERSEND_PASSWORD,
  },
});

export async function sendClientMail(toEmail) {
  const mailOptions = {
    from: `"KVN Delivery Bot" <${process.env.OWNER_EMAIL}>`,
    to: toEmail,
    subject: "✅ Your Product is Ready!",
    html: `
      <h2>Thank you for your payment!</h2>
      <p>Your product is ready. Click below to download:</p>
      <a href="${process.env.DUMMY_PRODUCT_URL}" style="padding: 10px 20px; background: green; color: white; text-decoration: none; border-radius: 6px;">Download Product</a>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Client Mail Sent:", info.messageId);
  } catch (error) {
    console.error("❌ Error sending client mail:", error);
  }
}
