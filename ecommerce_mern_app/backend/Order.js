const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      name: String,
      price: Number,
      quantity: Number,
      image: String,
    },
  ],
  subtotal: { type: Number },
  shipping: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  status: { type: String, default: "Confirmed" },
  orderedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", OrderSchema, "orders");
