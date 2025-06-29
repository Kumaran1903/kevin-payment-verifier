import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendClientRejection(email) {
  try {
    const result = await resend.emails.send({
      from: "KVN Store <onboarding@resend.dev>",
      to: email,
      subject: "Issue with Your Payment",
      html: `
        <p>We could not verify your payment screenshot.</p>
        <p>If you believe this is an error, please contact support: <b>22202024@rmd.ac.in</b></p>
      `,
    });

    console.log("📩 Rejection Email Sent:", result);
  } catch (error) {
    console.error("❌ Error sending rejection email:", error);
  }
}
