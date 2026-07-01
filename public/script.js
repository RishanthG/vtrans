document.addEventListener("DOMContentLoaded", () => {

    const button = document.getElementById("start-recording");
    const sourceLanguage = document.getElementById("source-language");
    const targetLanguage = document.getElementById("language");

    const originalText = document.getElementById("original-text");
    const translatedText = document.getElementById("translated-text");
    const audioElement = document.getElementById("translated-audio");

    const swapButton = document.getElementById("swap-language");
    const copyButton = document.getElementById("copy-btn");
    const playButton = document.getElementById("play-btn");
    const statusText = document.getElementById("status-text");

    const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {

        button.addEventListener("click", () => {

            alert("Speech recognition is only supported in Chrome or Edge.");

        });

        return;
    }

    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;

    sourceLanguage.addEventListener("change", () => {
        recognition.lang = sourceLanguage.value;
    });

    let listening = false;

    recognition.lang = sourceLanguage.value;


    /* ----------------------------
       Update recognition language
    ---------------------------- */

    sourceLanguage.addEventListener("change", () => {

        const map = {
            en: "en-US",
            ta: "ta-IN",
            hi: "hi-IN",
            ml: "ml-IN",
            kn: "kn-IN",
            fr: "fr-FR",
            de: "de-DE"
        };

        recognition.lang = map[sourceLanguage.value] || "en-US";

    });

    /* ----------------------------
       Start Recording
    ---------------------------- */

    button.addEventListener("click", () => {

        if (listening) return;

        originalText.innerHTML = "🎤 Listening...";
        translatedText.innerHTML = "Waiting for translation...";

        try {

            recognition.start();

        } catch (e) {

            console.log(e);

        }

    });

    /* ----------------------------
       Recognition Started
    ---------------------------- */

    recognition.addEventListener("start", () => {

        listening = true;

        button.innerHTML =
            "<span class='material-symbols-outlined'>mic</span> Listening...";

        button.style.background = "#EA4335";

        statusText.innerText = "Listening...";

    });

    /* ----------------------------
       Speech Result
    ---------------------------- */

    recognition.addEventListener("result", (event) => {

        const speech = event.results[0][0].transcript;

        originalText.innerHTML = speech;

        fetch("/translate", {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify({

                text: speech,

                lang: targetLanguage.value

            })

        })

        .then(res => res.json())

        .then(data => {

            if (data.error) {

                alert(data.error);

                return;

            }

            translatedText.innerHTML = data.translated_text;

            audioElement.src =
                "data:audio/mp3;base64," + data.audio;

            statusText.innerText = "Translation Complete";

        })

        .catch(err => {

            console.log(err);

            statusText.innerText = "Translation Failed";

        });

    });

    /* ----------------------------
       Recognition End
    ---------------------------- */

    recognition.addEventListener("end", () => {

        listening = false;

        button.innerHTML =
            "<span class='material-symbols-outlined'>mic</span> Start Recording";

        button.style.background = "#1A73E8";

        statusText.innerText = "Ready";

    });

    /* ----------------------------
       Recognition Error
    ---------------------------- */

    recognition.addEventListener("error", (event) => {

        listening = false;

        statusText.innerText = "Error";

        alert(event.error);

    });

    /* ----------------------------
       Swap Languages
    ---------------------------- */

    swapButton.addEventListener("click", () => {

        let temp = sourceLanguage.value;

        sourceLanguage.value = targetLanguage.value;

        targetLanguage.value = temp;

        sourceLanguage.dispatchEvent(new Event("change"));

    });

    /* ----------------------------
       Copy Translation
    ---------------------------- */

    copyButton.addEventListener("click", () => {

        navigator.clipboard.writeText(translatedText.innerText);

        copyButton.innerHTML =
            "<span class='material-symbols-outlined'>done</span>";

        setTimeout(() => {

            copyButton.innerHTML =
                "<span class='material-symbols-outlined'>content_copy</span>";

        }, 1500);

    });

    /* ----------------------------
       Play Audio
    ---------------------------- */

    playButton.addEventListener("click", () => {

        if (audioElement.src) {

            audioElement.play();

        }

    });

});


/* ===========================
   Login Overlay
=========================== */

function on() {

    document.getElementById("overlay").style.display = "flex";

}

function off() {

    document.getElementById("overlay").style.display = "none";

}