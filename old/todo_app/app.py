from flask import Flask, render_template, request, jsonify
from pymongo import MongoClient
from bson.objectid import ObjectId

app = Flask(__name__, template_folder='.')

# MongoDB Connection
client = MongoClient('mongodb://localhost:27017/')
db = client['todo_db']
tasks_collection = db['tasks']

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    tasks = list(tasks_collection.find())
    for task in tasks:
        task['_id'] = str(task['_id'])
    return jsonify(tasks)

@app.route('/api/tasks', methods=['POST'])
def add_task():
    data = request.get_json(force=True)
    task = {
        "text": data.get('text'),
        "category": data.get('category', 'Personal'),
        "priority": data.get('priority', 'Low'),
        "completed": False
    }
    result = tasks_collection.insert_one(task)
    return jsonify({"_id": str(result.inserted_id), "text": task['text'], "completed": task['completed']}), 201

@app.route('/api/tasks/<id>', methods=['PATCH'])
def edit_task(id):
    data = request.get_json(force=True, silent=True) or {}
    update_fields = {}
    if 'text' in data: update_fields['text'] = data['text']
    if 'category' in data: update_fields['category'] = data['category']
    if 'priority' in data: update_fields['priority'] = data['priority']
    if 'completed' in data: update_fields['completed'] = data['completed']
    
    try:
        # Simple toggle logic if no body provided
        if not update_fields:
            task = tasks_collection.find_one({"_id": ObjectId(id)})
            if task: update_fields['completed'] = not task.get('completed', False)

        if update_fields:
            tasks_collection.update_one({"_id": ObjectId(id)}, {"$set": update_fields})
        return jsonify({"message": "Task updated"})
    except:
        return jsonify({"error": "Invalid ID"}), 400

@app.route('/api/tasks/<id>', methods=['DELETE'])
def delete_task(id):
    tasks_collection.delete_one({"_id": ObjectId(id)})
    return jsonify({"message": "Task deleted"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
