document.addEventListener("DOMContentLoaded", () => {
  const statusElement = document.getElementById("status");
  const containerElement = document.querySelector(".hud-container");

  // Check Web Speech API support
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    statusElement.textContent = "Speech Recognition Not Supported";
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = false;
  recognition.lang = "en-US";

  // Speech Synthesis (Text-to-Speech)
  const synth = window.speechSynthesis;

  function speak(text) {
    // Stop listening while speaking to prevent self-looping
    recognition.stop();
    updateUI(false, "FRIDAY Speaking...");

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Try finding a natural female voice
    const voices = synth.getVoices();
    const selectedVoice = voices.find(
      (v) => v.name.includes("Google UK English Female") || v.name.includes("Samantha") || v.lang === "en-GB"
    );
    if (selectedVoice) utterance.voice = selectedVoice;

    utterance.onend = () => {
      // Resume listening after speaking finishes
      recognition.start();
    };

    synth.speak(utterance);
  }

  // Update UI visual state
  function updateUI(isListening, message) {
    statusElement.textContent = message;
    if (isListening) {
      containerElement.classList.add("listening");
    } else {
      containerElement.classList.remove("listening");
    }
  }

  // Handle voice commands
  function processCommand(command) {
    const text = command.toLowerCase();

    if (text.includes("hello") || text.includes("hey friday")) {
      speak("Always at your service, boss. How can I assist?");
    } else if (text.includes("time")) {
      const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      speak(`The current time is ${currentTime}.`);
    } else if (text.includes("who are you")) {
      speak("I am FRIDAY, your personal artificial intelligence assistant.");
    } else if (text.includes("open google")) {
      speak("Opening Google now.");
      window.open("https://www.google.com", "_blank");
    } else {
      speak(`Command received: ${command}. Integrating response logic.`);
    }
  }

  // Recognition Events
  recognition.onstart = () => {
    updateUI(true, "Listening...");
  };

  recognition.onresult = (event) => {
    const current = event.resultIndex;
    const transcript = event.results[current][0].transcript;
    console.log("Heard:", transcript);
    processCommand(transcript);
  };

  recognition.onerror = (event) => {
    console.error("Speech Recognition Error:", event.error);
    updateUI(false, "Audio Error - Retrying...");
  };

  recognition.onend = () => {
    // Automatically restart listening session
    if (!synth.speaking) {
      recognition.start();
    }
  };

  // Click core ring to kickstart audio context
  containerElement.addEventListener("click", () => {
    try {
      recognition.start();
      speak("F R I D A Y online and operational.");
    } catch (e) {
      console.log("Recognition already running");
    }
  });

  // Warm up speech synthesis voices
  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = () => synth.getVoices();
  }
});

