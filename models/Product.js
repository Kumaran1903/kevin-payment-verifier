import mongoose from "mongoose";
const productSchema = mongoose.Schema({
  title: {
    type: String,
  },
  link: {
    type: String,
  },
});

export default mongoose.models?.Product ||
  mongoose.model("Product", productSchema);
