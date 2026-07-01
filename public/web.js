function on() {
  document.getElementById("overlay").style.display = "block";
}

function off() {
  document.getElementById("overlay").style.display = "none";
}

document.addEventListener("DOMContentLoaded", () => {
  const speakButton = document.getElementById("speakButton");
  if (speakButton) {
    speakButton.addEventListener("click", function () {
      window.location.href = "/speak";
    });
  }
});
