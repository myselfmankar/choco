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
client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
db = client['expense_db']
expenses_collection = db['expenses']

def check_db():
    try:
        client.admin.command('ping')
        return True
    except:
        return False

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/expenses', methods=['GET'])
def get_expenses():
    try:
        expenses = list(expenses_collection.find().sort('date', -1))
        for exp in expenses:
            exp['_id'] = str(exp['_id'])
        return jsonify(expenses)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

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
        result = expenses_collection.insert_one(expense)
        return jsonify({"message": "Transaction added", "id": str(result.inserted_id)}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/expenses/<id>', methods=['DELETE'])
def delete_expense(id):
    try:
        expenses_collection.delete_one({"_id": ObjectId(id)})
        return jsonify({"message": "Transaction deleted"}), 200
    except:
        return jsonify({"error": "Delete failed"}), 500

@app.route('/api/stats', methods=['GET'])
def get_stats():
    try:
        expenses = list(expenses_collection.find())
        category_totals = {}
        person_totals = {}
        owed_to_me = 0
        owe_to_others = 0
        total_spent = 0
        
        for e in expenses:
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
            "net_balance": (owed_to_me - owe_to_others)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    if check_db():
        print("✅ MongoDB connected.")
    app.run(host='0.0.0.0', port=5000, debug=True)
