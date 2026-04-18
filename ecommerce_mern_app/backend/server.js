require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Product = require("./Product");
const CartItem = require("./CartItem");

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/ecommerce_db")
  .then(async () => {
    console.log("MongoDB Connected to ecommerce_db");
    // Reset and Seed test products
    await Product.deleteMany({});
    await CartItem.deleteMany({});

    await Product.insertMany([
      { name: "The Aurelia Watch", price: 29500, category: "Timepieces", image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=800&auto=format&fit=crop" },
      { name: "Midnight Onyx Ring", price: 14500, category: "Fine Jewelry", image: "https://images.unsplash.com/photo-1588444833098-420556502da5?q=80&w=800&auto=format&fit=crop" },
      { name: "Sartorial Silk Scarf", price: 4200, category: "Accessories", image: "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?q=80&w=800&auto=format&fit=crop" },
      { name: "Leather Aviator Bag", price: 18500, category: "Travel", image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=800&auto=format&fit=crop" },
      { name: "Cashmere Overcoat", price: 32000, category: "Apparel", image: "https://images.unsplash.com/photo-1544923246-77307dd654ca?q=80&w=800&auto=format&fit=crop" },
      { name: "Crystal Decanter Set", price: 8500, category: "Home", image: "https://images.unsplash.com/photo-1585533611414-26372671077f?q=80&w=800&auto=format&fit=crop" }
    ]);
    console.log("Seeded database with updated NEXUS products.");
  })
  .catch((err) => console.log(err));

// Routes

// Get all products
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get Cart
app.get("/api/cart", async (req, res) => {
  try {
    const items = await CartItem.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add to Cart or Update Qty
app.post("/api/cart", async (req, res) => {
  const { _id, name, price, image, quantity } = req.body;

  try {
    let item = await CartItem.findOne({ productId: _id });
    if (item) {
      item.quantity += quantity;
      await item.save();
    } else {
      item = new CartItem({ productId: _id, name, price, image, quantity });
      await item.save();
    }
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update Cart Item (Remove if qty=0)
app.patch("/api/cart/:id", async (req, res) => {
  try {
    const { quantity } = req.body;
    if (quantity === 0) {
      await CartItem.findByIdAndDelete(req.params.id);
      return res.json({ message: "Item removed" });
    }
    const item = await CartItem.findByIdAndUpdate(req.params.id, { quantity }, { new: true });
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Clear Cart (Checkout)
app.delete("/api/cart", async (req, res) => {
  try {
    await CartItem.deleteMany({});
    res.json({ message: "Cart cleared" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`Ecommerce Server started on port ${PORT}`));
