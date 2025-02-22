function simulateKeyPress(keyCode) {
  var downEvent = new KeyboardEvent("keydown", {
    bubbles: true,
    cancelable: true,
    key: keyCode,
    code: keyCode
  });
  document.dispatchEvent(downEvent);

  var upEvent = new KeyboardEvent("keyup", {
    bubbles: true,
    cancelable: true,
    key: keyCode,
    code: keyCode
  });
  document.dispatchEvent(upEvent);
}

document
  .getElementById("start-game-btn")
  .addEventListener("click", function () {
    document.querySelector(".start-screen").style.display = "none";
    document.querySelector(".game-container").style.display = "block";
    document.querySelector(".player-info").style.display = "block";
    document.querySelector(".mobile-controls").style.display = "block";

    var audio = new Audio("audio/lagu.mp3");
    audio.loop = true;
    audio.play().catch(function (error) {
      console.error("Audio playback was prevented:", error);
    });
  });
