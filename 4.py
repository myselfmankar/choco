from flask import Flask, request, jsonify, render_template_string

app = Flask(__name__)

# --- CONFIGURATION (EASY TO LEARN) ---

responses = {
    "hello": "Hello! Welcome to The Coffee Book. How can I help?",
    "menu": "We have Espresso, Latte, Cappuccino, and fresh Cookies.",
    "coffee": "We have Espresso, Latte, Cappuccino, and fresh Cookies.",
    "price": "Coffees range from ₹150 to ₹350.",
    "hours": "We are open daily from 8 AM to 8 PM.",
    "location": "Find us at MG Road, Downtown.",
    "bye": "Thanks for visiting! Have a great day!"
}

# --- HTML CONTENT IN ONE PLACE ---

index_html = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>The Coffee Book</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: Arial, sans-serif;
            background-color: #faf3e0;
            color: #4b2c20;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
        }
        .container { text-align: center; }
        h1 { margin-bottom: 5px; }

        /* Chat Icon */
        #chat-icon {
            position: fixed;
            bottom: 25px;
            right: 25px;
            background: #4b2c20;
            color: #fff;
            width: 55px;
            height: 55px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 24px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }

        /* Chat Box */
        #chat-box {
            display: none;
            position: fixed;
            bottom: 90px;
            right: 25px;
            width: 300px;
            height: 400px;
            background: #fff;
            border: 1px solid #ddd;
            border-radius: 10px;
            flex-direction: column;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }

        #chat-header {
            padding: 15px;
            background: #4b2c20;
            color: #fff;
            font-weight: bold;
            border-top-left-radius: 10px;
            border-top-right-radius: 10px;
        }

        #chat-messages {
            flex: 1;
            padding: 15px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .msg { padding: 8px 12px; border-radius: 15px; font-size: 14px; }
        .user-msg { align-self: flex-end; background: #6f4e37; color: #fff; }
        .bot-msg { align-self: flex-start; background: #f1f1f1; color: #333; }

        .chat-footer {
            padding: 10px;
            display: flex;
            gap: 5px;
            border-top: 1px solid #eee;
        }

        #user-input { flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 5px; }
        #send-btn { 
            background: #4b2c20; 
            color: #fff; 
            border: none; 
            padding: 8px 15px; 
            border-radius: 5px; 
            cursor: pointer; 
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Welcome to The Coffee Nook</h1>
        <p>Your favorite brew, just an assistant away.</p>
    </div>

    <!-- Chat Icon -->
    <div id="chat-icon" onclick="toggleChat()">☕</div>

    <!-- Chat Box -->
    <div id="chat-box">
        <div id="chat-header">Coffee Bot</div>
        <div id="chat-messages">
            <div class="msg bot-msg">Hello! Welcome to The Coffee Nook. How can I help?</div>
        </div>
        <div class="chat-footer">
            <input type="text" id="user-input" placeholder="Type message..."
                onkeypress="if(event.key === 'Enter') sendMessage()">
            <button id="send-btn" onclick="sendMessage()">Send</button>
        </div>
    </div>

    <script>
        function toggleChat() {
            const box = document.getElementById("chat-box");
            box.style.display = (box.style.display === "flex") ? "none" : "flex";
        }

        function sendMessage() {
            const input = document.getElementById("user-input");
            const msg = input.value.trim();
            if (!msg) return;

            appendMessage("User", msg);
            input.value = "";

            fetch("/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: msg })
            })
            .then(res => res.json())
            .then(data => appendMessage("Bot", data.response));
        }

        function appendMessage(sender, text) {
            const chat = document.getElementById("chat-messages");
            const div = document.createElement("div");
            div.className = "msg " + (sender === "User" ? "user-msg" : "bot-msg");
            div.textContent = text;
            chat.appendChild(div);
            chat.scrollTop = chat.scrollHeight;
        }
    </script>
</body>
</html>
"""

# --- BACKEND ROUTES ---

def get_response(msg):
    msg = msg.lower()
    for key in responses:
        if key in msg:
            return responses[key]
    return "Sorry, I didn't understand."

@app.route("/")
def home():
    # Return the HTML string directly
    # return render_template("index.html")
    return render_template_string(index_html)

@app.route("/chat", methods=["POST"])
def chat():
    user_msg = request.json.get("message")
    return jsonify({"response": get_response(user_msg)})

if __name__ == "__main__":
    app.run(debug=True)