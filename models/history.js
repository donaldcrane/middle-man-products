const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const HistorySchema = new Schema(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    email: String,
    status: String,
    reference: String, 
    amount: Number,
  },
  
);

module.exports = mongoose.model("History", HistorySchema);
