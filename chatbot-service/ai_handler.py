# ai_handler.py

import google.generativeai as genai
from google.api_core import exceptions as google_exceptions
from .prompt_template import PROMPT_TEXT

# A list of models to try in order of preference.
SUPPORTED_MODELS = [
    'gemini-1.5-flash',
    'gemini-1.0-pro',
    'gemini-pro',
]

def get_ai_translation(user_message, logger):
    """
    Uses the Gemini API to get the "inner voice" translation,
    with a fallback mechanism, yielding the response as a stream.
    """
    prompt = PROMPT_TEXT.format(user_message=user_message)

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

