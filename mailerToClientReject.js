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

export async function sendClientRejection(toEmail) {
  const mailOptions = {
    from: `"KVN Store" <${process.env.OWNER_EMAIL}>`,
    to: toEmail,
    subject: "❌ Issue with Your Payment",
    html: `
      <p>We could not verify your payment screenshot.</p>
      <p>If you believe this is an error, please contact support at <b>22202024@rmd.ac.in</b></p>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("📩 Rejection Mail Sent:", info.messageId);
  } catch (error) {
    console.error("❌ Error sending rejection email:", error);
  }
}
