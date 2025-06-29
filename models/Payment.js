// models/Payment.js
import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  name: String,
  email: String,
  upiId: String,
  amount: String,
  filename: String,
  ocrText: String,
  status: String,
});

export default mongoose.model("Payment", paymentSchema);
