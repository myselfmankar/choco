const mongoose = require("mongoose");

const CartItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  image: { type: String },
  quantity: { type: Number, default: 1, min: 0 }
});

module.exports = mongoose.model("CartItem", CartItemSchema, "cartitems");
