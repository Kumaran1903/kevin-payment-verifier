import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  name: String,
  email: String,
  upiId: String,
  amount: Number,
  filename: String,
  ocrText: {
    fullText: String,
    upiId: String,
    amountPaid: String,
    time: String,
    transactionId: String,
  },
  status: {
    type: String,
    enum: ["pending", "accept", "reject"],
    default: "pending",
  },
});

export default mongoose.models.Payment ||
  mongoose.model("Payment", paymentSchema);
