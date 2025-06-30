import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    upiId: String,
    amount: String,
    filename: String,
    ocrText: String,
    status: {
      type: String,
      enum: ["pending", "accept", "reject"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
