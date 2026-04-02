from flask import Flask, render_template, request, jsonify
from pymongo import MongoClient
from bson.objectid import ObjectId

app = Flask(__name__, template_folder='.')

# MongoDB Connection
client = MongoClient('mongodb://localhost:27017/')
db = client['student_db']
students_collection = db['students']

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/students', methods=['GET'])
def get_students():
    students = list(students_collection.find())
    for student in students:
        student['_id'] = str(student['_id'])
    return jsonify(students)

@app.route('/api/students', methods=['POST'])
def add_student():
    data = request.get_json(force=True, silent=True) or {}
    student = {
        "name": data.get('name'),
        "roll": data.get('roll'),
        "email": data.get('email'),
        "marks": int(data.get('marks', 0))
    }
    result = students_collection.insert_one(student)
    return jsonify({"message": "Student added", "id": str(result.inserted_id)}), 201

@app.route('/api/students/<id>', methods=['DELETE'])
def delete_student(id):
    result = students_collection.delete_one({"_id": ObjectId(id)})
    if result.deleted_count:
        return jsonify({"message": "Student deleted"}), 200
    return jsonify({"error": "Student not found"}), 404

@app.route('/api/students/<id>', methods=['PATCH'])
def update_student(id):
    data = request.json
    result = students_collection.update_one(
        {"_id": ObjectId(id)},
        {"$set": {
            "name": data.get('name'),
            "roll": data.get('roll'),
            "email": data.get('email'),
            "marks": data.get('marks')
        }}
    )
    if result.matched_count:
        return jsonify({"message": "Student updated"})
    return jsonify({"error": "Student not found"}), 404

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
