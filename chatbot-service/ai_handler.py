# ai_handler.py

import google.generativeai as genai
from google.api_core import exceptions as google_exceptions
from .prompt_template import PROMPT_TEXT

# A list of models to try in order of preference.
SUPPORTED_MODELS = [
    'gemini-pro-latest',
    'gemini-flash-latest',
]

def get_ai_translation(messages, logger):
    """
    Uses the Gemini API to get the "inner voice" translation, 
    building context from a conversation history and yielding the response as a stream.
    """
    # Start with the base prompt that sets the context
    prompt_parts = [
        "You are an AI that translates what a high-maintenance girlfriend says into what she actually means.",
        "Your job is to reveal the true, underlying meaning of her words.",
        "Do not be conversational. Only provide the translation.",
        "\nStatement: \"Oh, what bad weather.\"",
        "Translation: \"The user means that they do not want to go out for lunch, and you should cook for them.\"",
        "\nStatement: \"It's fine.\"",
        "Translation: \"It is absolutely not fine. You need to figure out what you did wrong and apologize immediately.\"",
        "\nStatement: \"I'm not hungry, you can have the last slice of pizza.\"",
        "Translation: \"I am testing you. If you eat that last slice, you will regret it for the rest of the week.\""
    ]

    # Build the conversation history from the messages
    for message in messages:
        if message['sender'] == 'user':
            prompt_parts.append(f"\nStatement: \"{message['text']}\"")
        elif message['sender'] == 'ai':
            prompt_parts.append(f"Translation: \"{message['text']}\"")

    # Add the final prompt for the AI to respond to
    prompt_parts.append("\nTranslation:")
    
    prompt = '\n'.join(prompt_parts)

    for model_name in SUPPORTED_MODELS:
        logger.info(f"Attempting to use model: {model_name} for streaming")
        try:
            model = genai.GenerativeModel(model_name)
            # Set a 60-second timeout for the entire stream
            request_options = {"timeout": 60}
            responses = model.generate_content(
                prompt,
                stream=True,
                request_options=request_options
            )
            
            # Yield each chunk of the response
            for response in responses:
                yield response.text

            # If we successfully streamed, exit the loop
            return

        except (google_exceptions.ServiceUnavailable, google_exceptions.DeadlineExceeded, google_exceptions.ResourceExhausted) as e:
            logger.warning(f"Model {model_name} failed with a server-side error: {e}. Trying next model.")
            continue
        except Exception as e:
            logger.error(f"An unexpected error occurred with model {model_name}: {e}")
            break
    
    # Fallback message if all models fail
    yield "Sorry, I couldn't process that right now."

