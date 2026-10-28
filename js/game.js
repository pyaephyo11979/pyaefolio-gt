// =========================================================================
// 5. DRIVING PHYSICS, AUTOPILOT, CAMERA & TELEMETRY STATE
// =========================================================================
const keys = { up: false, down: false, left: false, right: false, boost: false };
let appMode = "track"; // "track" | "garage"
let cameraMode = 0;    // 0: Chase, 1: Hood Cockpit, 2: Helicopter Overhead
const CAMERA_LABELS = ["Chase", "Cockpit", "Heli"];
let autopilot = false;

// Car state on circuit
let carPos = new THREE.Vector3();
let carHeading = 0;
let carSpeed = 0;
let nitroAmount = 100;
let lapStartTime = performance.now();
let bestLapSeconds = null;
let lastTrackT = 0;
let passedHalfway = false;
let activeZoneIndex = 0;
let lastFinishCross = 0;

// Place car at Start Grid (t = 0)
function warpToTrackProgress(targetT) {
  const normT = ((targetT % 1) + 1) % 1;
  const pt = trackCurve.getPointAt(normT);
  const tangent = trackCurve.getTangentAt(normT).normalize();
  carPos.set(pt.x, 0, pt.z);
  carHeading = Math.atan2(-tangent.x, -tangent.z);
  carSpeed = 0.35;
  lastTrackT = normT;
  showToast(`TELEPORTED TO TRACK SECTOR (${Math.round(normT * 100)}%)`);
}

warpToTrackProgress(0.0);

function showToast(msg) {
  const toast = document.getElementById("race-toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.style.opacity = "1";
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => {
    toast.style.opacity = "0";
  }, 2100);
}

// Update Right-Hand Live Zone Card when approaching a checkpoint
function updateLiveZoneHUD(zoneIdx, distMeters) {
  const zone = TRACK_ZONES[zoneIdx];
  if (!zone) return;

  document.getElementById("current-sector-badge").textContent = zone.sector;
  document.getElementById("zone-tag").textContent = zone.tag;
  document.getElementById("zone-distance").textContent = `${distMeters}m`;
  document.getElementById("zone-title").textContent = zone.title;
  document.getElementById("zone-subtitle").textContent = zone.subtitle;
  document.getElementById("zone-desc").textContent = zone.desc;

  const badgesEl = document.getElementById("zone-badges");
  badgesEl.innerHTML = zone.badges
    .map(b => `<span class="px-2 py-0.5 text-[10px] rounded-md bg-white/10 text-slate-200 font-medium">${b}</span>`)
    .join("");

  const primaryLink = document.getElementById("zone-primary-link");
  primaryLink.textContent = zone.linkText;
  if (zone.linkUrl === "#contact") {
    primaryLink.removeAttribute("target");
    primaryLink.href = "#contact";
    primaryLink.onclick = (e) => {
      e.preventDefault();
      openDossierModal("contact");
    };
  } else {
    primaryLink.setAttribute("target", "_blank");
    primaryLink.href = zone.linkUrl;
    primaryLink.onclick = null;
  }

  const inspectBtn = document.getElementById("zone-inspect-btn");
  inspectBtn.onclick = () => openDossierModal(zone.tabTarget);
}

updateLiveZoneHUD(0, 0);

// Find closest spline parameter t for current carPos
function getClosestTrackSample(pos) {
  let bestIndex = 0;
  let bestDistSq = Infinity;
  const samples = 240;
  for (let i = 0; i < samples; i++) {
    const t = i / samples;
    const p = trackCurve.getPointAt(t);
    const dx = p.x - pos.x;
    const dz = p.z - pos.z;
    const dSq = dx * dx + dz * dz;
    if (dSq < bestDistSq) {
      bestDistSq = dSq;
      bestIndex = i;
    }
  }
  return { t: bestIndex / samples, dist: Math.sqrt(bestDistSq) };
}

// Switch Supercar
function selectSupercar(index) {
  currentCarIndex = index;
  const spec = SUPERCARS[index];
  buildSupercarModel(spec);
  document.documentElement.style.setProperty("--accent", spec.neonHex);

  const pill = document.getElementById("active-car-pill");
  if (pill) pill.textContent = spec.name;

  document.querySelectorAll(".car-select-card").forEach((card) => {
    const cIdx = parseInt(card.getAttribute("data-car"), 10);
    if (cIdx === index) {
      card.classList.add("border-red-500", "bg-white/15");
      card.classList.remove("border-transparent", "bg-white/5");
    } else {
      card.classList.remove("border-red-500", "bg-white/15");
      card.classList.add("border-transparent", "bg-white/5");
    }
  });

  showToast(`SELECTED ${spec.name} (${spec.codename})`);
}

// Switch App Mode ("track" vs "garage")
function setAppMode(mode) {
  appMode = mode;
  const garageDrawer = document.getElementById("garage-drawer");
  const trackBtn = document.getElementById("nav-track-btn");
  const garageBtn = document.getElementById("nav-garage-btn");
  const zoneContainer = document.getElementById("zone-card-container");

  if (mode === "garage") {
    garageDrawer.classList.remove("hidden");
    zoneContainer.classList.add("hidden");
    garageBtn.classList.add("bg-red-600", "text-white", "shadow");
    garageBtn.classList.remove("text-slate-300");
    trackBtn.classList.remove("bg-red-600", "text-white", "shadow");
    trackBtn.classList.add("text-slate-300");
  } else {
    garageDrawer.classList.add("hidden");
    zoneContainer.classList.remove("hidden");
    trackBtn.classList.add("bg-red-600", "text-white", "shadow");
    trackBtn.classList.remove("text-slate-300");
    garageBtn.classList.remove("bg-red-600", "text-white", "shadow");
    garageBtn.classList.add("text-slate-300");
  }
}

// Open / Close Dossier Modal
function openDossierModal(tabName = "overview") {
  const modal = document.getElementById("dossier-modal");
  modal.classList.remove("hidden");
  switchDossierTab(tabName);
}

function closeDossierModal() {
  const modal = document.getElementById("dossier-modal");
  modal.classList.add("hidden");
}

function switchDossierTab(tabName) {
  document.querySelectorAll(".dossier-tab-panel").forEach(panel => {
    panel.classList.toggle("hidden", panel.id !== `tab-${tabName}`);
  });
  document.querySelectorAll(".dossier-tab-btn").forEach(btn => {
    const isCurrent = btn.getAttribute("data-tab") === tabName;
    btn.classList.toggle("bg-red-600", isCurrent);
    btn.classList.toggle("text-white", isCurrent);
    btn.classList.toggle("text-slate-300", !isCurrent);
  });
}

