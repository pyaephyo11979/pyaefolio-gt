// =========================================================================
// 6. EVENT LISTENERS (KEYBOARD, TOUCH, BUTTONS, FORM)
// =========================================================================
window.addEventListener("keydown", (e) => {
  if (["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) return;
  const k = e.key.toLowerCase();
  if (k === "w" || e.key === "ArrowUp") keys.up = true;
  if (k === "s" || e.key === "ArrowDown") keys.down = true;
  if (k === "a" || e.key === "ArrowLeft") keys.left = true;
  if (k === "d" || e.key === "ArrowRight") keys.right = true;
  if (e.key === "Shift" || e.key === " ") keys.boost = true;
  if (k === "1") selectSupercar(0);
  if (k === "2") selectSupercar(1);
  if (k === "3") selectSupercar(2);
  if (k === "c") {
    cameraMode = (cameraMode + 1) % CAMERA_LABELS.length;
    document.getElementById("camera-label").textContent = CAMERA_LABELS[cameraMode];
  }
});

window.addEventListener("keyup", (e) => {
  const k = e.key.toLowerCase();
  if (k === "w" || e.key === "ArrowUp") keys.up = false;
  if (k === "s" || e.key === "ArrowDown") keys.down = false;
  if (k === "a" || e.key === "ArrowLeft") keys.left = false;
  if (k === "d" || e.key === "ArrowRight") keys.right = false;
  if (e.key === "Shift" || e.key === " ") keys.boost = false;
});

// Touch / Mouse Hold Helper for On-Screen Controls
function bindHoldButton(btnId, keyProp) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  const start = (e) => { e.preventDefault(); keys[keyProp] = true; };
  const end = (e) => { e.preventDefault(); keys[keyProp] = false; };
  btn.addEventListener("mousedown", start);
  btn.addEventListener("mouseup", end);
  btn.addEventListener("mouseleave", end);
  btn.addEventListener("touchstart", start, { passive: false });
  btn.addEventListener("touchend", end, { passive: false });
}

bindHoldButton("touch-left", "left");
bindHoldButton("touch-right", "right");
bindHoldButton("touch-gas", "up");
bindHoldButton("touch-brake", "down");
bindHoldButton("touch-nos", "boost");

// Top Navigation & Teleport Buttons
document.getElementById("nav-track-btn").addEventListener("click", () => {
  closeDossierModal();
  setAppMode("track");
});

document.getElementById("nav-garage-btn").addEventListener("click", () => {
  closeDossierModal();
  setAppMode(appMode === "garage" ? "track" : "garage");
});

document.getElementById("garage-launch-btn").addEventListener("click", () => {
  setAppMode("track");
});

document.getElementById("nav-pit-projects").addEventListener("click", () => {
  openDossierModal("projects");
});

document.getElementById("nav-pit-skills").addEventListener("click", () => {
  openDossierModal("skills");
});

document.getElementById("nav-pit-career").addEventListener("click", () => {
  openDossierModal("overview");
});

document.getElementById("nav-hud-modal-btn").addEventListener("click", () => {
  openDossierModal("overview");
});

document.getElementById("close-dossier-btn").addEventListener("click", closeDossierModal);

// Autopilot Toggle
document.getElementById("autopilot-btn").addEventListener("click", () => {
  autopilot = !autopilot;
  document.getElementById("autopilot-state").textContent = autopilot ? "ON" : "OFF";
  showToast(autopilot ? "AI AUTOPILOT ENGAGED — CRUISING CIRCUIT" : "MANUAL DRIVER CONTROL ACTIVE");
});

// Camera Cycle
document.getElementById("camera-btn").addEventListener("click", () => {
  cameraMode = (cameraMode + 1) % CAMERA_LABELS.length;
  document.getElementById("camera-label").textContent = CAMERA_LABELS[cameraMode];
});

// Weather & Atmosphere Cycle Button
document.getElementById("weather-btn").addEventListener("click", () => {
  weatherMode = (weatherMode + 1) % WEATHER_MODES.length;
  const wm = WEATHER_MODES[weatherMode];
  document.getElementById("weather-label").textContent = wm.label;
  scene.fog.color.setHex(wm.fogColor);
  scene.fog.density = wm.fogDensity;
  rainSystem.visible = wm.rainVisible;
  rainMat.color.setHex(wm.rainColor);
  showToast(`NIGHT CITY ATMOSPHERE: ${wm.label.toUpperCase()}`);
});

// Audio Synthesizer Toggle
document.getElementById("audio-btn").addEventListener("click", initOrToggleAudio);

// Warp Buttons
document.querySelectorAll(".warp-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const targetT = parseFloat(btn.getAttribute("data-warp"));
    setAppMode("track");
    warpToTrackProgress(targetT);
  });
});

// Garage Car Selector Cards
document.querySelectorAll(".car-select-card").forEach(card => {
  card.addEventListener("click", () => {
    const idx = parseInt(card.getAttribute("data-car"), 10);
    selectSupercar(idx);
  });
});

// Dossier Sub-Tabs
document.querySelectorAll(".dossier-tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    switchDossierTab(btn.getAttribute("data-tab"));
  });
});

// Project Category Filters
document.querySelectorAll(".proj-filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".proj-filter-btn").forEach(b => {
      b.classList.remove("bg-red-600", "text-white");
      b.classList.add("bg-white/5", "text-slate-300");
    });
    btn.classList.add("bg-red-600", "text-white");
    btn.classList.remove("bg-white/5", "text-slate-300");
    renderProjectsGrid(btn.getAttribute("data-filter"));
  });
});

// Contact Form Handler
document.getElementById("pit-contact-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("contact-name").value.trim();
  const subj = document.getElementById("contact-subject").value;
  const statusEl = document.getElementById("contact-status");
  statusEl.textContent = `✓ Pit Radio Dispatch from ${name} (${subj}) logged for Pyae Phyo Hlaing!`;
  e.target.reset();
});

// Responsive Resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

