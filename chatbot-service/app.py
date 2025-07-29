import os
from flask import Flask, request, jsonify
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Configure the Gemini API
try:
    genai.configure(api_key=os.environ["GEMINI_API_KEY"])
    model = genai.GenerativeModel('gemini-1.5-flash')
except KeyError:
    app.logger.error("FATAL: GEMINI_API_KEY environment variable not set.")
    # We could exit here, but Flask will fail on startup which is clear enough.

def get_ai_translation(user_message):
    """
    Uses the Gemini API to get the "inner voice" translation.
    """
    if not model:
        return "Error: AI model not initialized."

    # The prompt is engineered to instruct the AI on its persona.
    prompt = f"""
    You are an AI that translates what a high-maintenance girlfriend says into what she actually means.
    Your job is to reveal the true, underlying meaning of her words.
    Do not be conversational. Only provide the translation.

    Statement: "Oh, what bad weather."
    Translation: "The user means that they do not want to go out for lunch, and you should cook for them."

    Statement: "It's fine."
    Translation: "It is absolutely not fine. You need to figure out what you did wrong and apologize immediately."

    Statement: "I'm not hungry, you can have the last slice of pizza."
    Translation: "I am testing you. If you eat that last slice, you will regret it for the rest of the week."

    Statement: "{user_message}"
    Translation:
    """

    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        app.logger.error(f"Gemini API call failed: {e}")
        return "Sorry, I couldn't process that right now."


@app.route("/api/chat", methods=['POST'])
def chat():
    """
    Handles chat requests by interpreting the user's message via the AI.
    """
    data = request.get_json()

    if not data or 'message' not in data:
        return jsonify({"error": "Invalid request. 'message' is required."}), 400

    user_message = data['message']
    ai_response = get_ai_translation(user_message)

    return jsonify({
        "input_message": user_message,
        "ai_response": ai_response
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)
