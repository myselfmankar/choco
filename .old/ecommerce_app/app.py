from flask import Flask, render_template, request, jsonify
from pymongo import MongoClient
from bson.objectid import ObjectId

app = Flask(__name__, template_folder='.')

# MongoDB Connection
client = MongoClient('mongodb://localhost:27017/')
db = client['store_db']
products_collection = db['products']
cart_collection = db['cart']

# Seed data if database is empty
def seed_db():
    if products_collection.count_documents({}) == 0:
        sample_products = [
            {"name": "Viking Classic Chrono", "price": 14999.00, "category": "Tech", "image": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop"},
            {"name": "Nordic Studio Pro", "price": 8990.00, "category": "Audio", "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop"},
            {"name": "Croma Lumix 5K", "price": 45000.00, "category": "Photography", "image": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1000&auto=format&fit=crop"},
            {"name": "Explorer Leather Bag", "price": 2500.00, "category": "Travel", "image": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1000&auto=format&fit=crop"}
        ]
        products_collection.insert_many(sample_products)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/products', methods=['GET'])
def get_products():
    products = list(products_collection.find())
    for p in products:
        p['_id'] = str(p['_id'])
    return jsonify(products)

@app.route('/api/cart', methods=['GET'])
def get_cart():
    items = list(cart_collection.find())
    for item in items:
        item['_id'] = str(item['_id'])
    return jsonify(items)

@app.route('/api/cart', methods=['POST'])
def add_to_cart():
    data = request.get_json(force=True, silent=True) or {}
    product_id = data.get('_id')
    quantity = int(data.get('quantity', 1))
    
    # Check if item already exists in cart
    existing_item = cart_collection.find_one({"_id": product_id})
    if existing_item:
        cart_collection.update_one({"_id": product_id}, {"$inc": {"quantity": quantity}})
    else:
        cart_collection.insert_one(data)
    
    return jsonify({"message": "Cart updated"})

@app.route('/api/cart', methods=['DELETE'])
def clear_cart():
    cart_collection.delete_many({})
    return jsonify({"message": "Cart cleared"})

@app.route('/api/cart/<id>', methods=['PATCH'])
def update_cart_item(id):
    data = request.get_json(force=True, silent=True) or {}
    new_qty = int(data.get('quantity', 1))
    # Try deleting/updating using the string ID directly first, as it's stored that way in the cart
    target_id = id
    if new_qty < 1:
        cart_collection.delete_one({"_id": target_id})
        return jsonify({"message": "Item removed"})
    
    cart_collection.update_one(
        {"_id": target_id},
        {"$set": {"quantity": new_qty}}
    )
    return jsonify({"message": "Quantity updated"})

if __name__ == '__main__':
    seed_db()
    app.run(host='0.0.0.0', port=5000, debug=True)
