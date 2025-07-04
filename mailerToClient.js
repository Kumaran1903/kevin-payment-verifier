import { Resend } from "resend";
import dotenv from "dotenv";
import Product from "./models/Product.js";
import { connectDB } from "./db.js";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendClientMail(toEmail, productslist) {
  try {     
    await connectDB();
    const allProducts = await Product.find();

    // Filter products that match items in the given productslist
    const matchingProducts = allProducts.filter((product) =>
      productslist.includes(product.title)
    );

    // Generate product links HTML
    const productLinksHtml = matchingProducts
      .map(
        (product) => `
          <div style="margin-bottom: 16px;">
            <h3>${product.title}</h3>
            <a href="${product.downloadLink}" style="padding: 10px 20px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px;">
              Download ${product.title}
            </a>
          </div>
        `
      )
      .join("");

    const result = await resend.emails.send({
      from: `Kevin Universe Delivery Bot <${process.env.FROM_EMAIL}>`,
      to: toEmail,
      subject: "✅ Your Product is Ready!",
      html: `
        <h2>Thank you for your payment!</h2>
        <p>Your product(s) are ready. Click below to download:</p>
        ${productLinksHtml || "<p>No matching products found.</p>"}
      `,
    });

    console.log("✅ Client Mail Sent:", result);
  } catch (error) {
    console.error("❌ Error sending client mail:", error);
  }
}
