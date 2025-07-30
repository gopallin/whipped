# app.py

import os
from flask import Flask
from dotenv import load_dotenv
import google.generativeai as genai

# --- App Initialization ---
def create_app():
    """Creates and configures the Flask application."""
    app = Flask(__name__)
    
    # Load environment variables
    load_dotenv()

    # Configure the Gemini API
    try:
        genai.configure(api_key=os.environ["GEMINI_API_KEY"])
        app.logger.info("Gemini API configured successfully.")
    except KeyError:
        app.logger.error("FATAL: GEMINI_API_KEY environment variable not set.")

    # Register routes from the routes.py file
    with app.app_context():
        from . import routes
        routes.register_routes(app)

    return app

# --- Main Execution ---
if __name__ == "__main__":
    app = create_app()
    # The command in docker-compose will set the host and port
    app.run()
