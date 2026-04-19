require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Product = require("./Product");
const CartItem = require("./CartItem");
const path = require("path");

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
      {
        name: "Aura Smart Watch",
        price: 2950,
        category: "Timepieces",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop"
      },
      {
        name: "Midnight Onyx Ring",
        price: 1450,
        category: "Fine Jewelry",
        image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=800&fit=crop"
      },
      {
        name: "Sartorial Silk Scarf",
        price: 420,
        category: "Accessories",
        image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&h=800&fit=crop"
      },
      {
        name: "Leather Aviator Bag",
        price: 1850,
        category: "Travel",
        image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&h=800&fit=crop"
      },
      {
        name: "Cashmere Overcoat",
        price: 3200,
        category: "Apparel",
        image: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&h=800&fit=crop"
      },
      {
        name: "Crystal Decanter Set",
        price: 850,
        category: "Home",
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=800&fit=crop"
      }
    ]);
    console.log("Seeded database with scaled nexus products.");
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



// Unity Architecture: Serve Frontend
app.use(express.static(path.join(__dirname, "../frontend/dist")));

app.get("*path", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`Ecommerce Server started on port ${PORT}`));
