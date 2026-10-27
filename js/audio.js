// =========================================================================
// 3. SYNTHESIZED WEB AUDIO V10 ENGINE SOUND & BOOST FX
// =========================================================================
let audioCtx = null;
let engineOsc1 = null;
let engineOsc2 = null;
let engineGain = null;
let audioEnabled = false;

function initOrToggleAudio() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    audioCtx = new AudioContextClass();

    engineOsc1 = audioCtx.createOscillator();
    engineOsc2 = audioCtx.createOscillator();
    const filter = audioCtx.createBiquadFilter();
    engineGain = audioCtx.createGain();

    engineOsc1.type = "sawtooth";
    engineOsc2.type = "triangle";
    engineOsc1.frequency.value = 65;
    engineOsc2.frequency.value = 130;

    filter.type = "lowpass";
    filter.frequency.value = 420;

    engineGain.gain.value = 0.0;

    engineOsc1.connect(filter);
    engineOsc2.connect(filter);
    filter.connect(engineGain);
    engineGain.connect(audioCtx.destination);

    engineOsc1.start();
    engineOsc2.start();
  }

  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }

  audioEnabled = !audioEnabled;
  const label = document.getElementById("audio-label");
  const btn = document.getElementById("audio-btn");
  if (label) label.textContent = audioEnabled ? "V10 ON" : "MUTE";
  if (btn) {
    btn.classList.toggle("border-red-500/60", audioEnabled);
    btn.classList.toggle("text-red-300", audioEnabled);
  }
  if (!audioEnabled && engineGain && audioCtx) {
    engineGain.gain.setTargetAtTime(0.0, audioCtx.currentTime, 0.05);
  }
}

function updateEngineAudio(speedRatio, isBoosting) {
  if (!audioEnabled || !audioCtx || !engineOsc1 || !engineGain) return;
  const baseFreq = 58 + speedRatio * 195 + (isBoosting ? 45 : 0);
  engineOsc1.frequency.setTargetAtTime(baseFreq, audioCtx.currentTime, 0.04);
  engineOsc2.frequency.setTargetAtTime(baseFreq * 1.5, audioCtx.currentTime, 0.04);
  const targetVol = 0.04 + speedRatio * 0.07;
  engineGain.gain.setTargetAtTime(targetVol, audioCtx.currentTime, 0.05);
}

