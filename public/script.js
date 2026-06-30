document.addEventListener("DOMContentLoaded", () => {
    const button = document.getElementById("start-recording");
    const languageSelect = document.getElementById("language");
    const originalText = document.getElementById("original-text");
    const translatedText = document.getElementById("translated-text");
    const audioElement = document.getElementById("translated-audio");

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        button.addEventListener("click", () => {
            alert("Speech recognition isn't supported in this browser. Try Chrome or Edge.");
        });
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US"; // language being spoken into the mic

    let listening = false;

    button.addEventListener("click", () => {
        if (listening) return;

        originalText.innerText = "🎤 Speak now...";
        translatedText.innerText = "🌐 Translation will appear here...";

        try {
            recognition.start();
        } catch (err) {
            console.error("Could not start recognition:", err);
        }
    });

    recognition.addEventListener("start", () => {
        listening = true;
        button.innerHTML = "🎤 Listening...";
        button.style.background = "rgba(255, 0, 0, 0.5)";
    });

    recognition.addEventListener("result", (event) => {
        const speechText = event.results[0][0].transcript;
        originalText.innerText = "Recognized: " + speechText;

        const lang = languageSelect.value;

        fetch("/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: speechText, lang: lang }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.error) {
                    alert(data.error);
                    return;
                }
                translatedText.innerText = "Translated: " + data.translated_text;
                audioElement.src = "data:audio/mp3;base64," + data.audio;
                audioElement.play();
            })
            .catch((error) => console.error("Error:", error));
    });

    recognition.addEventListener("error", (event) => {
        console.error("Speech recognition error:", event.error);
        if (event.error === "no-speech") {
            alert("Didn't catch that — please try again.");
        } else if (event.error === "not-allowed" || event.error === "service-not-allowed") {
            alert("Microphone access was blocked. Please allow microphone permissions and try again.");
        } else {
            alert("Speech recognition error: " + event.error);
        }
    });

    recognition.addEventListener("end", () => {
        listening = false;
        button.innerHTML = "🎙 Start Recording";
        button.style.background = "";
    });
});

function on() {
    document.getElementById("overlay").style.display = "block";
}

function off() {
    document.getElementById("overlay").style.display = "none";
}
