from flask import Flask, render_template, request, jsonify
from pymongo import MongoClient
from bson.objectid import ObjectId
from datetime import datetime
import os
import time
import uuid

app = Flask(__name__, template_folder='.')

# --- DATABASE CONFIG ---
MONGO_URI = os.environ.get("MONGO_URI", "mongodb://127.0.0.1:27017/")
client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=2000) # Short timeout for Vercel
db = client['expense_db']
expenses_collection = db['expenses']

# --- MOCK DATA FALLBACK ---
# This allows the app to run on Vercel immediately without a DB
IS_DEMO_MODE = False
MOCK_EXPENSES = [
    {"_id": "m1", "title": "Coffee with Team", "amount": 450, "category": "Food", "type": "Expense", "person": "Self", "date": datetime.now().strftime('%Y-%m-%d')},
    {"_id": "m2", "title": "Freelance Payment", "amount": 15000, "category": "Other", "type": "Take", "person": "Client X", "date": datetime.now().strftime('%Y-%m-%d')},
    {"_id": "m3", "title": "Office Rent", "amount": 12000, "category": "Bills", "type": "Expense", "person": "Self", "date": datetime.now().strftime('%Y-%m-%d')},
    {"_id": "m4", "title": "Lunch split", "amount": 300, "category": "Food", "type": "Give", "person": "Alice", "date": datetime.now().strftime('%Y-%m-%d')},
]

try:
    client.admin.command('ping')
    print("✅ MongoDB Connected.")
except:
    print("⚠️ Database Offline. Entering DEMO MODE.")
    IS_DEMO_MODE = True

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/expenses', methods=['GET'])
def get_expenses():
    if IS_DEMO_MODE:
        return jsonify(MOCK_EXPENSES)
    try:
        expenses = list(expenses_collection.find().sort('date', -1))
        for exp in expenses:
            exp['_id'] = str(exp['_id'])
        return jsonify(expenses)
    except:
        return jsonify(MOCK_EXPENSES) # Secondary fallback

@app.route('/api/expenses', methods=['POST'])
def add_expense():
    try:
        data = request.get_json(force=True, silent=True) or {}
        expense = {
            "title": data.get('title'),
            "amount": float(data.get('amount', 0)),
            "category": data.get('category', 'Other'),
            "type": data.get('type', 'Expense'),
            "person": data.get('person', 'Self'),
            "date": data.get('date', datetime.now().strftime('%Y-%m-%d'))
        }
        
        if IS_DEMO_MODE:
            expense["_id"] = str(uuid.uuid4())
            MOCK_EXPENSES.insert(0, expense)
            return jsonify({"message": "Demo mode: Transaction saved in memory", "id": expense["_id"]}), 201

        result = expenses_collection.insert_one(expense)
        return jsonify({"message": "Transaction added", "id": str(result.inserted_id)}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/expenses/<id>', methods=['DELETE'])
def delete_expense(id):
    if IS_DEMO_MODE:
        global MOCK_EXPENSES
        MOCK_EXPENSES = [e for e in MOCK_EXPENSES if e['_id'] != id]
        return jsonify({"message": "Demo mode: Transaction deleted"}), 200
        
    try:
        expenses_collection.delete_one({"_id": ObjectId(id)})
        return jsonify({"message": "Transaction deleted"}), 200
    except:
        return jsonify({"error": "Delete failed"}), 500

@app.route('/api/stats', methods=['GET'])
def get_stats():
    data_source = MOCK_EXPENSES if IS_DEMO_MODE else list(expenses_collection.find())
    
    category_totals = {}
    person_totals = {}
    owed_to_me = 0
    owe_to_others = 0
    total_spent = 0
    
    for e in data_source:
        etype = e.get('type', 'Expense')
        amt = e.get('amount', 0)
        person = e.get('person', 'Self')
        
        if person:
            person_totals[person] = person_totals.get(person, 0) + amt
        
        if etype == 'Expense':
            cat = e.get('category', 'Other')
            category_totals[cat] = category_totals.get(cat, 0) + amt
            total_spent += amt
        elif etype == 'Give':
            owed_to_me += amt
        elif etype == 'Take':
            owe_to_others += amt
                
    return jsonify({
        "category_totals": category_totals,
        "person_totals": person_totals,
        "you_are_owed": owed_to_me,
        "you_owe": owe_to_others,
        "total_spent": total_spent,
        "net_balance": (owed_to_me - owe_to_others),
        "demo": IS_DEMO_MODE
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
