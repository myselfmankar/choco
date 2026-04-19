const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      name: String,
      price: Number,
      quantity: Number,
    },
  ],
  totalAmount: { type: Number, required: true },
  orderedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", OrderSchema, "orders");
