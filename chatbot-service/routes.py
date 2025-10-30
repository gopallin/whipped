# routes.py

from flask import request, jsonify, current_app, Response, stream_with_context
from .ai_handler import get_ai_translation

def register_routes(app):
    @app.route("/api/chat", methods=['POST'])
    def chat():
        """
        Handles chat requests by interpreting the user's message via the AI
        and streaming the response.
        """
        data = request.get_json()

        if not data or 'messages' not in data:
            return jsonify({"error": "Invalid request. 'messages' is required."}), 400

        messages = data['messages']
        
        # The AI handler is now a generator, so we stream its response
        def generate():
            for chunk in get_ai_translation(messages, current_app.logger):
                yield chunk
        
        # Return a streaming response
        return Response(stream_with_context(generate()), mimetype='text/plain')

