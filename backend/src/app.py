from flask import Flask, request, jsonify
from models.Chatbot import Chatbot

app = Flask(__name__)
print("Flask app initialized.")

try:
    chatbot = Chatbot()
    MODEL_LOADED = True
    print("Chatbot instance created.")
except Exception as e:
    MODEL_LOADED = False
    print(f"Error initializing Chatbot: {e}")
    chatbot = None

@app.route('/generate_response', methods=['POST'])
def generate_response():
    """
        Endpoint to generate a travel itinerary based on user input.
    """
    if not MODEL_LOADED:
        return jsonify({"error": "Model not loaded. Please check server logs."}), 500

    data = request.get_json()

    if not data or 'user_input' not in data:
        return jsonify({"error": "Invalid input. 'user_input' is required."}), 400
    
    user_input = data['user_input']
    print(f"Received user input: {user_input}")

    try:
        response = chatbot.generate_responses(user_input)
        print("Response generated successfully.")
        return jsonify({"response": response}), 200
    except Exception as e:
        print(f"Error generating response: {e}")
        return jsonify({"error": str(e)}), 500
    
@app.route('/status', methods=['GET'])
def status():
    """
        Endpoint to check the status of the server and model.
    """
    if MODEL_LOADED:
        return jsonify({"status": "Model loaded and server is running."}), 200
    else:
        return jsonify({"status": "Model not loaded. Please check server logs."}), 500
    
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)