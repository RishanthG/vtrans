from flask import Flask, render_template, request, jsonify
from deep_translator import GoogleTranslator
from gtts import gTTS
import os
import base64
import uuid

# Compute absolute paths from this file's location rather than relying on
# Flask's relative-path resolution (which depends on how/where the script
# is launched). templates/ lives inside api/ (not at the project root)
# because Vercel only reliably bundles files inside the api/ directory
# into the deployed function — a sibling templates/ folder gets left out.
HERE = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(HERE)
TEMPLATE_DIR = os.path.join(HERE, "templates")
PUBLIC_DIR = os.path.join(BASE_DIR, "public")

# This also runs correctly with a plain `python index.py` in VS Code, not
# just on Vercel (Vercel serves public/ via its own filesystem routing and
# ignores this, so it's safe to set for both environments).
app = Flask(
    __name__,
    static_folder=PUBLIC_DIR,
    static_url_path="",
    template_folder=TEMPLATE_DIR,
)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/")
def speak():
    return render_template("index.html")


@app.route("/translate", methods=["POST"])
def translate():
    """
    Expects JSON: { "text": "<recognized speech>", "lang": "ta" }
    The actual speech-to-text now happens in the browser (Web Speech API)
    since Vercel's serverless functions have no microphone access.
    This route only translates text and generates spoken audio for it.
    """
    data = request.get_json(silent=True) or {}
    speech_text = (data.get("text") or "").strip()
    lang = data.get("lang", "ta")

    if not speech_text:
        return jsonify({"error": "No speech text received."}), 400

    # Translate text
    try:
        translator = GoogleTranslator(source="auto", target=lang)
        translated_text = translator.translate(speech_text)
    except Exception as e:
        return jsonify({"error": f"Translation failed: {str(e)}"}), 500

    # Convert translated text to speech.
    # Vercel functions only allow writes inside /tmp, and each request
    # needs its own filename since multiple requests can run concurrently.
    audio_path = f"/tmp/{uuid.uuid4().hex}.mp3"
    try:
        tts = gTTS(translated_text, lang=lang)
        tts.save(audio_path)

        with open(audio_path, "rb") as audio_file:
            audio_base64 = base64.b64encode(audio_file.read()).decode()
    except Exception as e:
        return jsonify({"error": f"Speech generation failed: {str(e)}"}), 500
    finally:
        if os.path.exists(audio_path):
            os.remove(audio_path)

    return jsonify(
        {
            "original_text": speech_text,
            "translated_text": translated_text,
            "audio": audio_base64,
        }
    )


if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5000)
