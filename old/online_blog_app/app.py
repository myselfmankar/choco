from flask import Flask, render_template, request, jsonify
from pymongo import MongoClient
from bson.objectid import ObjectId
import os

app = Flask(__name__, template_folder='.')

# MongoDB Configuration
# Modify the URI if your MongoDB is not local
client = MongoClient('mongodb://localhost:27017/')
db = client['blog_db']
posts_collection = db['posts']

"""
inital flush
python -c "from pymongo import MongoClient; MongoClient('mongodb://localhost:27017/')['store_db']['products'].delete_many({})"
"""
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/posts', methods=['GET'])
def get_posts():
    posts = list(posts_collection.find())
    for post in posts:
        post['_id'] = str(post['_id'])
    return jsonify(posts)

@app.route('/api/posts', methods=['POST'])
def add_post():
    data = request.get_json(force=True, silent=True) or {}
    post = {
        "title": data.get('title'),
        "content": data.get('content'),
        "author": data.get('author', 'Anonymous'),
        "date": data.get('date', '')
    }
    result = posts_collection.insert_one(post)
    return jsonify({"message": "Post added", "id": str(result.inserted_id)}), 201

@app.route('/api/posts/<id>', methods=['PATCH'])
def update_post(id):
    data = request.get_json(force=True, silent=True) or {}
    
    update_fields = {}
    if 'title' in data: update_fields['title'] = data['title']
    if 'content' in data: update_fields['content'] = data['content']
    
    if update_fields:
        result = db.posts.update_one({"_id": ObjectId(id)}, {"$set": update_fields})
        if result.matched_count:
            return jsonify({"message": "Post updated"})
    return jsonify({"error": "Post not found"}), 404

@app.route('/api/posts/<id>', methods=['DELETE'])
def delete_post(id):
    result = posts_collection.delete_one({"_id": ObjectId(id)})
    if result.deleted_count:
        return jsonify({"message": "Post deleted"}), 200
    return jsonify({"error": "Post not found"}), 404

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
