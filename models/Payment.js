import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  name: String,
  email: String,
  amount: Number,
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
