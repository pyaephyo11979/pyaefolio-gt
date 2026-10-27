// =========================================================================
// 4. THREE.JS 3D CIRCUIT, PROCEDURAL HYPERCAR BUILDER & SHOWROOM
// =========================================================================
const canvas = document.getElementById("race-canvas");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x070312);
scene.fog = new THREE.FogExp2(0x0b041c, 0.0024);

const camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.5, 1100);

// Cyberpunk 2077 Night City Atmospheric Lighting
const ambientLight = new THREE.AmbientLight(0x2a164d, 0.95);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0x00f0ff, 1.15);
dirLight.position.set(90, 160, 70);
scene.add(dirLight);

const magentaFillLight = new THREE.DirectionalLight(0xff0055, 0.9);
magentaFillLight.position.set(-120, 110, -90);
scene.add(magentaFillLight);

// Closed Grand Prix Spline Circuit
const trackControlPoints = [
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0, 0, -140),
  new THREE.Vector3(75, 0, -250),
  new THREE.Vector3(210, 0, -230),
  new THREE.Vector3(270, 0, -100),
  new THREE.Vector3(220, 0, 40),
  new THREE.Vector3(110, 0, 120),
  new THREE.Vector3(-60, 0, 150),
  new THREE.Vector3(-190, 0, 95),
  new THREE.Vector3(-220, 0, -35),
  new THREE.Vector3(-120, 0, -95),
  new THREE.Vector3(-20, 0, 50)
];
const trackCurve = new THREE.CatmullRomCurve3(trackControlPoints, true, "catmullrom", 0.5);
const TRACK_SEGMENTS = 480;
const ROAD_HALF_WIDTH = 9.5;

// Procedural Textures for Cyberpunk Skyscraper Windows & Holo-Billboards
function createCyberWindowTexture(accentHex, secondaryHex) {
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 256;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#05020c";
  ctx.fillRect(0, 0, c.width, c.height);

  const cols = 8;
  const rows = 24;
  const padX = 3;
  const padY = 3;
  const cellW = c.width / cols;
  const cellH = c.height / rows;

  for (let r = 0; r < rows; r++) {
    // Occasional horizontal neon megabuilding trim band
    if (r % 7 === 0) {
      ctx.fillStyle = accentHex;
      ctx.fillRect(0, r * cellH, c.width, 2);
      continue;
    }
    for (let col = 0; col < cols; col++) {
      const rand = Math.sin(r * 19.3 + col * 7.7) * 0.5 + 0.5;
      if (rand > 0.36) {
        ctx.fillStyle = rand > 0.82 ? accentHex : (rand > 0.62 ? secondaryHex : "#1e293b");
        ctx.fillRect(col * cellW + padX, r * cellH + padY, cellW - padX * 2, cellH - padY * 2);
      }
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function createHoloBillboardTexture(title, subtitle, jpText, bgHex, borderHex, textHex) {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 256;
  const ctx = c.getContext("2d");

  // Dark translucent cyber backdrop
  ctx.fillStyle = bgHex;
  ctx.fillRect(0, 0, c.width, c.height);

  // Scanlines
  ctx.fillStyle = "rgba(0, 240, 255, 0.06)";
  for (let y = 0; y < c.height; y += 6) {
    ctx.fillRect(0, y, c.width, 2);
  }

  // Outer cyber frame
  ctx.strokeStyle = borderHex;
  ctx.lineWidth = 10;
  ctx.strokeRect(8, 8, c.width - 16, c.height - 16);

  // Corner cut accents
  ctx.fillStyle = borderHex;
  ctx.fillRect(8, 8, 90, 28);
  ctx.fillStyle = "#05020c";
  ctx.font = "bold 16px Orbitron, sans-serif";
  ctx.fillText("NC // 2077", 16, 28);

  // Japanese Katakana Neon Header
  ctx.fillStyle = borderHex;
  ctx.font = "bold 28px sans-serif";
  ctx.fillText(jpText, 120, 42);

  // Main Headline
  ctx.fillStyle = textHex;
  ctx.font = "900 44px Orbitron, sans-serif";
  ctx.fillText(title, 28, 128);

  // Subtitle bar
  ctx.fillStyle = borderHex;
  ctx.fillRect(28, 152, c.width - 56, 4);

  ctx.fillStyle = "#e2e8f0";
  ctx.font = "bold 24px Inter, sans-serif";
  ctx.fillText(subtitle, 28, 198);

  // Bottom telemetry code
  ctx.fillStyle = textHex;
  ctx.font = "16px Orbitron, sans-serif";
  ctx.fillText("SYS.TELEMETRY // PYAEFOLIO.NETLIFY.APP // SECTOR ACTIVE", 28, 232);

  return new THREE.CanvasTexture(c);
}

// Build Procedural Wet Rain-Slicked Night City Road Ribbon & Neon Curbs
function buildCircuitGeometry() {
  const roadPositions = [];
  const roadColors = [];
  const roadIndices = [];

  const cDark = new THREE.Color(0x070913);
  const cMid = new THREE.Color(0x0f1428);
  const cCurbCyan = new THREE.Color(0x00f0ff);
  const cCurbMagenta = new THREE.Color(0xff0055);
  const cCurbYellow = new THREE.Color(0xfcee0a);

  for (let i = 0; i <= TRACK_SEGMENTS; i++) {
    const t = i / TRACK_SEGMENTS;
    const pt = trackCurve.getPointAt(t);
    const tangent = trackCurve.getTangentAt(t).normalize();
    const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

    // 4 vertices across road: outer-left curb, left lane, right lane, outer-right curb
    const vL2 = pt.clone().addScaledVector(normal, -(ROAD_HALF_WIDTH + 1.5));
    const vL1 = pt.clone().addScaledVector(normal, -ROAD_HALF_WIDTH);
    const vR1 = pt.clone().addScaledVector(normal, ROAD_HALF_WIDTH);
    const vR2 = pt.clone().addScaledVector(normal, ROAD_HALF_WIDTH + 1.5);

    roadPositions.push(
      vL2.x, 0.04, vL2.z,
      vL1.x, 0.02, vL1.z,
      vR1.x, 0.02, vR1.z,
      vR2.x, 0.04, vR2.z
    );

    const isAlt = i % 2 === 0;
    const leftCurbCol = isAlt ? cCurbCyan : cCurbMagenta;
    const rightCurbCol = isAlt ? cCurbYellow : cCurbMagenta;
    const laneCol = isAlt ? cDark : cMid;

    roadColors.push(
      leftCurbCol.r, leftCurbCol.g, leftCurbCol.b,
      laneCol.r, laneCol.g, laneCol.b,
      laneCol.r, laneCol.g, laneCol.b,
      rightCurbCol.r, rightCurbCol.g, rightCurbCol.b
    );

    if (i < TRACK_SEGMENTS) {
      const base = i * 4;
      roadIndices.push(base, base + 1, base + 4, base + 1, base + 5, base + 4);
      roadIndices.push(base + 1, base + 2, base + 5, base + 2, base + 6, base + 5);
      roadIndices.push(base + 2, base + 3, base + 6, base + 3, base + 7, base + 6);
    }
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.Float32BufferAttribute(roadPositions, 3));
  geom.setAttribute("color", new THREE.Float32BufferAttribute(roadColors, 3));
  geom.setIndex(roadIndices);
  geom.computeVertexNormals();

  // Wet rain-slicked Night City asphalt material
  const mat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.16,
    metalness: 0.78,
    side: THREE.DoubleSide
  });
  const mesh = new THREE.Mesh(geom, mat);
  scene.add(mesh);

  // Triple Neon Laser Guide Lines (Center Cyber Yellow + Left/Right Cyan/Magenta Lanes)
  const centerPts = [];
  const leftLanePts = [];
  const rightLanePts = [];
  for (let i = 0; i <= 360; i++) {
    const t = i / 360;
    const p = trackCurve.getPointAt(t);
    const tang = trackCurve.getTangentAt(t).normalize();
    const norm = new THREE.Vector3(-tang.z, 0, tang.x).normalize();
    centerPts.push(new THREE.Vector3(p.x, 0.07, p.z));
    leftLanePts.push(p.clone().addScaledVector(norm, -4.5).setY(0.065));
    rightLanePts.push(p.clone().addScaledVector(norm, 4.5).setY(0.065));
  }
  scene.add(new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(centerPts),
    new THREE.LineBasicMaterial({ color: 0xfcee0a, transparent: true, opacity: 0.85 })
  ));
  scene.add(new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(leftLanePts),
    new THREE.LineBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.55 })
  ));
  scene.add(new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(rightLanePts),
    new THREE.LineBasicMaterial({ color: 0xff0055, transparent: true, opacity: 0.55 })
  ));
}

buildCircuitGeometry();

// Wet Mirror Ground Plane & Synthwave Cyber Grid Floor
const groundMirrorGeom = new THREE.PlaneGeometry(1600, 1600);
const groundMirrorMat = new THREE.MeshStandardMaterial({
  color: 0x05020d,
  roughness: 0.12,
  metalness: 0.88
});
const groundMirror = new THREE.Mesh(groundMirrorGeom, groundMirrorMat);
groundMirror.rotation.x = -Math.PI / 2;
groundMirror.position.y = -0.05;
scene.add(groundMirror);

const gridHelper = new THREE.GridHelper(1400, 140, 0xff0055, 0x160b30);
gridHelper.position.y = -0.02;
scene.add(gridHelper);

// Night City Holographic Sky Moon, Orbital Ring & Vertical Sky Laser Beams
const moonGeom = new THREE.SphereGeometry(42, 32, 32);
const moonMat = new THREE.MeshBasicMaterial({ color: 0xff0055, transparent: true, opacity: 0.85 });
const cyberMoon = new THREE.Mesh(moonGeom, moonMat);
cyberMoon.position.set(60, 210, -480);
scene.add(cyberMoon);

const haloGeom = new THREE.RingGeometry(52, 58, 64);
const haloMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, side: THREE.DoubleSide, transparent: true, opacity: 0.65 });
const cyberHalo = new THREE.Mesh(haloGeom, haloMat);
cyberHalo.position.copy(cyberMoon.position);
scene.add(cyberHalo);

// Build Checkpoint Gantry Arches, Japanese Holo-Signs & Glowing Beacons along the Circuit
const checkpointMeshes = [];
const ZONE_JP_LABELS = [
  "ナイトシティ // START GRID",
  "アラサカ // TECH BREEZE",
  "ブレイン // BRAINWAVE R&D",
  "キャリア // CAREERHUB 2077",
  "システム // DISTRIBUTED RMI",
  "モバイル // OPEN PATH API",
  "ラジオ // PIT COMMS LINK"
];

TRACK_ZONES.forEach((zone, idx) => {
  const pt = trackCurve.getPointAt(zone.t);
  const tangent = trackCurve.getTangentAt(zone.t).normalize();
  const angle = Math.atan2(tangent.x, tangent.z);

  const archGroup = new THREE.Group();
  archGroup.position.copy(pt);
  archGroup.rotation.y = angle;

  const pillarGeom = new THREE.BoxGeometry(1.1, 11.5, 1.1);
  const pillarMat = new THREE.MeshStandardMaterial({ color: 0x090414, metalness: 0.85, roughness: 0.15 });

  const leftPillar = new THREE.Mesh(pillarGeom, pillarMat);
  leftPillar.position.set(-(ROAD_HALF_WIDTH + 1.6), 5.75, 0);
  archGroup.add(leftPillar);

  const rightPillar = new THREE.Mesh(pillarGeom, pillarMat);
  rightPillar.position.set(ROAD_HALF_WIDTH + 1.6, 5.75, 0);
  archGroup.add(rightPillar);

  // Neon Strips on Pillars
  const stripGeom = new THREE.BoxGeometry(0.25, 11.2, 1.2);
  const stripMat = new THREE.MeshBasicMaterial({ color: zone.archColor });
  const leftStrip = new THREE.Mesh(stripGeom, stripMat);
  leftStrip.position.set(-(ROAD_HALF_WIDTH + 1.0), 5.75, 0);
  archGroup.add(leftStrip);

  const rightStrip = leftStrip.clone();
  rightStrip.position.x = ROAD_HALF_WIDTH + 1.0;
  archGroup.add(rightStrip);

  // Overhead Cyberpunk Holographic Billboard Gantry
  const boardTex = createHoloBillboardTexture(
    zone.sector + " // " + (idx + 1),
    zone.title.slice(0, 32),
    ZONE_JP_LABELS[idx % ZONE_JP_LABELS.length],
    "#090318",
    "#fcee0a",
    "#00f0ff"
  );
  const beamGeom = new THREE.BoxGeometry((ROAD_HALF_WIDTH + 2.2) * 2, 3.2, 0.8);
  const beamMat = new THREE.MeshBasicMaterial({ map: boardTex });
  const beam = new THREE.Mesh(beamGeom, beamMat);
  beam.position.set(0, 10.2, 0);
  archGroup.add(beam);

  // Top Neon Frame Bar
  const topBar = new THREE.Mesh(
    new THREE.BoxGeometry((ROAD_HALF_WIDTH + 2.4) * 2, 0.35, 1.1),
    new THREE.MeshBasicMaterial({ color: zone.archColor })
  );
  topBar.position.set(0, 12.0, 0);
  archGroup.add(topBar);

  // Floating rotating beacon crystal above arch
  const crystalGeom = new THREE.OctahedronGeometry(1.6, 0);
  const crystalMat = new THREE.MeshBasicMaterial({ color: zone.archColor, wireframe: true });
  const crystal = new THREE.Mesh(crystalGeom, crystalMat);
  crystal.position.set(0, 14.5, 0);
  archGroup.add(crystal);

  scene.add(archGroup);
  checkpointMeshes.push({ crystal, zone, position: pt });
});

// Build Cyberpunk 2077 Night City Megabuildings, Skyscrapers, Streetlights & Holograms
const winTexCyan = createCyberWindowTexture("#00f0ff", "#fcee0a");
const winTexMagenta = createCyberWindowTexture("#ff0055", "#00f0ff");
const winTexYellow = createCyberWindowTexture("#fcee0a", "#ff0055");
const winTextures = [winTexCyan, winTexMagenta, winTexYellow];

const BILLBOARD_ADS = [
  ["PYAEFOLIO 2077", "MERN & LARAVEL CYBERWARE", "ナイトシティ // 開発者", "#080318", "#fcee0a", "#00f0ff"],
  ["CAREERHUB CORP", "REAL-TIME JOB MATRIX", "キャリアハブ // 採用", "#16041e", "#ff0055", "#fcee0a"],
  ["ARASAKA BACKEND", "JAVA RMI & SPRING BOOT", "分散システム // 高速", "#041421", "#00f0ff", "#ff0055"],
  ["OPEN PATH // NC", "FLUTTER & PRISMA ORM", "オープンパス // 未来", "#120904", "#fcee0a", "#10b981"],
  ["TECH BREEZE LTD", "E-COMMERCE ARCHITECTURE", "テックブリーズ // 商業", "#0b0420", "#a855f7", "#00f0ff"],
  ["BRAINWAVE DATA", "NEURAL SOFTWARE ENG", "ブレインウェーブ // AI", "#041818", "#00f0ff", "#fcee0a"]
];
const billboardTextures = BILLBOARD_ADS.map(ad => createHoloBillboardTexture(...ad));

const towerGeom = new THREE.BoxGeometry(1, 1, 1);
const neonColors = [0x00f0ff, 0xff0055, 0xfcee0a, 0xa855f7, 0x10b981];
const holoRings = [];

for (let i = 0; i < 130; i++) {
  const t = (i / 130);
  const pt = trackCurve.getPointAt(t);
  const tangent = trackCurve.getTangentAt(t).normalize();
  const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

  // Inner and outer Night City megabuilding rows
  const rowOffset = (i % 3 === 0) ? (22 + (i * 11) % 25) : (48 + (i * 23) % 85);
  const side = (i % 2 === 0 ? 1 : -1) * rowOffset;
  const pos = pt.clone().addScaledVector(normal, side);

  const h = 18 + (i * 19) % 78;
  const w = 5 + (i % 7) * 1.6;
  const d = 5 + ((i + 3) % 6) * 1.6;
  const neonCol = neonColors[i % neonColors.length];

  const towerMat = new THREE.MeshStandardMaterial({
    color: 0x0b071a,
    map: winTextures[i % winTextures.length],
    emissive: neonCol,
    emissiveIntensity: 0.14,
    roughness: 0.25,
    metalness: 0.82
  });

  const bldgGroup = new THREE.Group();
  bldgGroup.position.set(pos.x, 0, pos.z);
  bldgGroup.rotation.y = Math.atan2(tangent.x, tangent.z);

  // Main Skyscraper Core
  const tower = new THREE.Mesh(towerGeom, towerMat);
  tower.scale.set(w, h, d);
  tower.position.set(0, h / 2, 0);
  bldgGroup.add(tower);

  // Upper Megabuilding Tier + Neon Crown Trim
  if (h > 36) {
    const tierH = h * 0.28;
    const tier = new THREE.Mesh(towerGeom, towerMat);
    tier.scale.set(w * 0.68, tierH, d * 0.68);
    tier.position.set(0, h + tierH / 2, 0);
    bldgGroup.add(tier);

    const crown = new THREE.Mesh(
      towerGeom,
      new THREE.MeshBasicMaterial({ color: neonCol })
    );
    crown.scale.set(w * 1.04, 0.45, d * 1.04);
    crown.position.set(0, h, 0);
    bldgGroup.add(crown);

    // Rooftop Spire & Aviation Beacon
    const spire = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.2, 9, 6),
      new THREE.MeshBasicMaterial({ color: neonCol })
    );
    spire.position.set(0, h + tierH + 4.5, 0);
    bldgGroup.add(spire);
  }

  // Attach Giant Glowing Holographic Billboards facing the street on select buildings
  if (i % 3 === 0) {
    const signW = Math.min(w * 1.35, 13);
    const signH = signW * 0.52;
    const signMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(signW, signH),
      new THREE.MeshBasicMaterial({
        map: billboardTextures[i % billboardTextures.length],
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.94
      })
    );
    const faceDir = side > 0 ? -1 : 1;
    signMesh.position.set(faceDir * (w / 2 + 0.35), Math.min(h * 0.55, 22), 0);
    signMesh.rotation.y = Math.PI / 2;
    bldgGroup.add(signMesh);
  }

  // Occasional Vertical Night City Sky Laser Beams (like Afterlife / Corpo Plaza)
  if (i % 16 === 0) {
    const beamCone = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 2.2, 260, 12, 1, true),
      new THREE.MeshBasicMaterial({
        color: neonCol,
        transparent: true,
        opacity: 0.16,
        side: THREE.DoubleSide
      })
    );
    beamCone.position.set(0, 130, 0);
    bldgGroup.add(beamCone);
  }

  scene.add(bldgGroup);
}

// Trackside Cyberpunk Cantilever Neon Streetlamps & Rotating Holo-Rings
for (let i = 0; i < 60; i++) {
  const t = i / 60;
  const pt = trackCurve.getPointAt(t);
  const tangent = trackCurve.getTangentAt(t).normalize();
  const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
  const sideSign = i % 2 === 0 ? 1 : -1;
  const lampPos = pt.clone().addScaledVector(normal, sideSign * (ROAD_HALF_WIDTH + 2.4));

  const lampGroup = new THREE.Group();
  lampGroup.position.copy(lampPos);
  lampGroup.rotation.y = Math.atan2(tangent.x, tangent.z);

  const poleMat = new THREE.MeshStandardMaterial({ color: 0x110926, metalness: 0.8, roughness: 0.2 });
  const pole = new THREE.Mesh(new THREE.BoxGeometry(0.28, 7.2, 0.28), poleMat);
  pole.position.set(0, 3.6, 0);
  lampGroup.add(pole);

  const arm = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.2, 0.24), poleMat);
  arm.position.set(-sideSign * 1.2, 7.1, 0);
  lampGroup.add(arm);

  const bulbCol = i % 3 === 0 ? 0x00f0ff : (i % 3 === 1 ? 0xff0055 : 0xfcee0a);
  const neonTube = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 0.14, 0.35),
    new THREE.MeshBasicMaterial({ color: bulbCol })
  );
  neonTube.position.set(-sideSign * 1.3, 6.95, 0);
  lampGroup.add(neonTube);

  scene.add(lampGroup);

  // Every 6th lamp, add a giant elevated Neon Cyber Tunnel Ring over the road
  if (i % 6 === 0) {
    const ringMesh = new THREE.Mesh(
      new THREE.TorusGeometry(ROAD_HALF_WIDTH + 3.2, 0.18, 8, 48, Math.PI),
      new THREE.MeshBasicMaterial({ color: bulbCol })
    );
    ringMesh.position.copy(pt);
    ringMesh.rotation.y = Math.atan2(tangent.x, tangent.z);
    scene.add(ringMesh);
    holoRings.push(ringMesh);
  }
}

// Flying Cyberpunk 2077 AV-4 Aerodynes / Trauma Team / Spinner Vehicles in the Sky
const flyingCars = [];
for (let i = 0; i < 18; i++) {
  const avGroup = new THREE.Group();
  const bodyCol = i % 2 === 0 ? 0x00f0ff : 0xff0055;
  const fuselage = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 0.65, 4.2),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.15 })
  );
  avGroup.add(fuselage);

  const thrusterL = new THREE.Mesh(
    new THREE.BoxGeometry(0.45, 0.25, 4.4),
    new THREE.MeshBasicMaterial({ color: bodyCol })
  );
  thrusterL.position.set(-1.0, -0.1, 0);
  avGroup.add(thrusterL);

  const thrusterR = thrusterL.clone();
  thrusterR.position.x = 1.0;
  avGroup.add(thrusterR);

  const tailBeacon = new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xfcee0a })
  );
  tailBeacon.position.set(0, 0.2, 2.2);
  avGroup.add(tailBeacon);

  const orbitRadius = 90 + (i * 19) % 190;
  const altitude = 24 + (i * 7) % 52;
  const speed = (i % 2 === 0 ? 1 : -1) * (0.0025 + (i % 5) * 0.0008);
  const angle = (i / 18) * Math.PI * 2;

  scene.add(avGroup);
  flyingCars.push({ mesh: avGroup, orbitRadius, altitude, speed, angle });
}

// Cyberpunk Neon Rain / Acid Downpour Particle System
const RAIN_COUNT = 1800;
const rainPositions = new Float32Array(RAIN_COUNT * 3);
for (let i = 0; i < RAIN_COUNT; i++) {
  rainPositions[i * 3] = (Math.random() - 0.5) * 520;
  rainPositions[i * 3 + 1] = Math.random() * 120;
  rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 520;
}
const rainGeom = new THREE.BufferGeometry();
rainGeom.setAttribute("position", new THREE.BufferAttribute(rainPositions, 3));
const rainMat = new THREE.PointsMaterial({
  color: 0x00f0ff,
  size: 0.48,
  transparent: true,
  opacity: 0.65
});
const rainSystem = new THREE.Points(rainGeom, rainMat);
scene.add(rainSystem);

let weatherMode = 0; // 0: Neon Rain, 1: Acid Fog (Yellow/Magenta), 2: Clear Synth Night
const WEATHER_MODES = [
  { label: "Neon Rain", fogColor: 0x0b041c, fogDensity: 0.0024, rainVisible: true, rainColor: 0x00f0ff },
  { label: "Acid Smog", fogColor: 0x1a0826, fogDensity: 0.0042, rainVisible: true, rainColor: 0xfcee0a },
  { label: "Clear 2077", fogColor: 0x05020f, fogDensity: 0.0014, rainVisible: false, rainColor: 0xff0055 }
];

// Build Procedural Top-Tier Racing Supercar Mesh
const carGroup = new THREE.Group();
let carBodyMat, carAccentMat, underglowLight, leftFlame, rightFlame;
const wheelMeshes = [];

function buildSupercarModel(spec) {
  while (carGroup.children.length > 0) {
    carGroup.remove(carGroup.children[0]);
  }
  wheelMeshes.length = 0;

  carBodyMat = new THREE.MeshStandardMaterial({
    color: spec.bodyColor,
    metalness: 0.82,
    roughness: 0.18
  });
  const carbonMat = new THREE.MeshStandardMaterial({
    color: 0x111827,
    metalness: 0.5,
    roughness: 0.4
  });
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x020617,
    metalness: 0.95,
    roughness: 0.05
  });
  carAccentMat = new THREE.MeshBasicMaterial({
    color: spec.accentColor
  });

  // Lower Aerodynamic Carbon Splitter & Floor
  const floorMesh = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.22, 4.9), carbonMat);
  floorMesh.position.set(0, 0.28, 0);
  carGroup.add(floorMesh);

  // Main Sculpted Supercar Fuselage
  const chassisMesh = new THREE.Mesh(new THREE.BoxGeometry(2.15, 0.52, 4.55), carBodyMat);
  chassisMesh.position.set(0, 0.58, 0);
  carGroup.add(chassisMesh);

  // Nose Cone Slope
  const noseMesh = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.35, 1.15), carBodyMat);
  noseMesh.position.set(0, 0.46, -2.15);
  noseMesh.rotation.x = 0.18;
  carGroup.add(noseMesh);

  // Teardrop Cockpit Canopy
  const canopyMesh = new THREE.Mesh(new THREE.BoxGeometry(1.52, 0.46, 2.05), glassMat);
  canopyMesh.position.set(0, 0.98, -0.15);
  carGroup.add(canopyMesh);

  // Roof Air Scoop (LMP / Hypercar Fin)
  const scoopMesh = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.32, 1.4), carBodyMat);
  scoopMesh.position.set(0, 1.22, 0.55);
  carGroup.add(scoopMesh);

  const sharkFin = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, 1.35), carbonMat);
  sharkFin.position.set(0, 1.24, 1.35);
  carGroup.add(sharkFin);

  // Swan-Neck GT Rear Wing
  const wingBlade = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.1, 0.52), carbonMat);
  wingBlade.position.set(0, 1.36, 2.08);
  wingBlade.rotation.x = -0.15;
  carGroup.add(wingBlade);

  const wingEndL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.38, 0.62), carBodyMat);
  wingEndL.position.set(-1.18, 1.34, 2.08);
  carGroup.add(wingEndL);

  const wingEndR = wingEndL.clone();
  wingEndR.position.x = 1.18;
  carGroup.add(wingEndR);

  const strutL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.55, 0.18), carbonMat);
  strutL.position.set(-0.55, 1.08, 1.98);
  carGroup.add(strutL);

  const strutR = strutL.clone();
  strutR.position.x = 0.55;
  carGroup.add(strutR);

  // Glowing Racing Accent Stripes
  const stripeMesh = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.54, 4.58), carAccentMat);
  stripeMesh.position.set(0, 0.59, 0);
  carGroup.add(stripeMesh);

  // LED Laser Headlights
  const headLightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const hlL = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.09, 0.12), headLightMat);
  hlL.position.set(-0.72, 0.56, -2.68);
  carGroup.add(hlL);
  const hlR = hlL.clone();
  hlR.position.x = 0.72;
  carGroup.add(hlR);

  // Full-Width Cyber LED Taillight Bar
  const tailMat = new THREE.MeshBasicMaterial({ color: 0xff1e42 });
  const tailBar = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.14, 0.1), tailMat);
  tailBar.position.set(0, 0.68, 2.3);
  carGroup.add(tailBar);

  // Dual Twin-Turbo Exhausts + NOS Afterburner Cones
  const flameGeom = new THREE.ConeGeometry(0.18, 0.9, 12);
  const flameMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.0 });
  leftFlame = new THREE.Mesh(flameGeom, flameMat);
  leftFlame.rotation.x = Math.PI / 2;
  leftFlame.position.set(-0.42, 0.42, 2.75);
  carGroup.add(leftFlame);

  rightFlame = leftFlame.clone();
  rightFlame.position.x = 0.42;
  carGroup.add(rightFlame);

  // 4 Center-Lock Forged Racing Wheels
  const wheelGeom = new THREE.CylinderGeometry(0.46, 0.46, 0.38, 24);
  wheelGeom.rotateZ(Math.PI / 2);
  const tireMat = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.7 });
  const rimMat = new THREE.MeshBasicMaterial({ color: spec.accentColor, wireframe: true });
  const rimGeom = new THREE.CylinderGeometry(0.31, 0.31, 0.4, 12);
  rimGeom.rotateZ(Math.PI / 2);

  const wheelCoords = [
    [-1.12, 0.46, -1.48],
    [1.12, 0.46, -1.48],
    [-1.15, 0.48, 1.45],
    [1.15, 0.48, 1.45]
  ];
  wheelCoords.forEach(([wx, wy, wz]) => {
    const wGroup = new THREE.Group();
    wGroup.position.set(wx, wy, wz);
    wGroup.add(new THREE.Mesh(wheelGeom, tireMat));
    wGroup.add(new THREE.Mesh(rimGeom, rimMat));
    carGroup.add(wGroup);
    wheelMeshes.push(wGroup);
  });

  // Underglow Neon PointLight
  underglowLight = new THREE.PointLight(spec.bodyColor, 2.5, 14);
  underglowLight.position.set(0, 0.35, 0);
  carGroup.add(underglowLight);
}

let currentCarIndex = 0;
buildSupercarModel(SUPERCARS[currentCarIndex]);
scene.add(carGroup);

