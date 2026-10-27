// =========================================================================
// 7. MAIN 60FPS GAME & TELEMETRY LOOP
// =========================================================================
function formatLapTime(sec) {
  const mins = Math.floor(sec / 60);
  const rem = (sec % 60).toFixed(1);
  return `${String(mins).padStart(2, "0")}:${rem.padStart(4, "0")}`;
}

let showroomOrbitAngle = 0;

function animate(now) {
  requestAnimationFrame(animate);

  const spec = SUPERCARS[currentCarIndex];

  // Rotate floating checkpoint crystals, Night City orbital halo, flying AV-4 traffic, and neon rain
  checkpointMeshes.forEach((item) => {
    item.crystal.rotation.y += 0.025;
    item.crystal.rotation.x += 0.01;
  });

  cyberHalo.rotation.z += 0.003;

  flyingCars.forEach((av) => {
    av.angle += av.speed;
    const nextAngle = av.angle + av.speed * 10;
    const x = Math.cos(av.angle) * av.orbitRadius;
    const z = Math.sin(av.angle) * av.orbitRadius;
    const nx = Math.cos(nextAngle) * av.orbitRadius;
    const nz = Math.sin(nextAngle) * av.orbitRadius;
    av.mesh.position.set(x, av.altitude + Math.sin(now * 0.002 + av.orbitRadius) * 1.2, z);
    av.mesh.lookAt(nx, av.mesh.position.y, nz);
  });

  if (rainSystem.visible) {
    const posAttr = rainGeom.getAttribute("position");
    const arr = posAttr.array;
    for (let i = 0; i < RAIN_COUNT; i++) {
      arr[i * 3 + 1] -= 1.65;
      if (arr[i * 3 + 1] < 0) {
        arr[i * 3 + 1] = 115;
        arr[i * 3] = carPos.x + (Math.random() - 0.5) * 260;
        arr[i * 3 + 2] = carPos.z + (Math.random() - 0.5) * 260;
      }
    }
    posAttr.needsUpdate = true;
  }

  if (appMode === "garage") {
    // Turntable Showroom Camera
    showroomOrbitAngle += 0.008;
    const radius = 6.8;
    camera.position.set(
      carPos.x + Math.sin(showroomOrbitAngle) * radius,
      carPos.y + 2.5,
      carPos.z + Math.cos(showroomOrbitAngle) * radius
    );
    camera.lookAt(carPos.x, carPos.y + 0.7, carPos.z);
    wheelMeshes.forEach(w => { w.rotation.x += 0.03; });
    renderer.render(scene, camera);
    return;
  }

  // Manual Input vs AI Autopilot
  const manualInput = keys.up || keys.down || keys.left || keys.right;
  if (manualInput && autopilot) {
    autopilot = false;
    document.getElementById("autopilot-state").textContent = "OFF";
  }

  const isBoosting = keys.boost && nitroAmount > 2;
  if (isBoosting) {
    nitroAmount = Math.max(0, nitroAmount - 0.55);
  } else {
    nitroAmount = Math.min(100, nitroAmount + 0.18);
  }

  if (autopilot) {
    // Smoothly follow spline curve
    lastTrackT = (lastTrackT + 0.00145) % 1;
    const pt = trackCurve.getPointAt(lastTrackT);
    const lookPt = trackCurve.getPointAt((lastTrackT + 0.012) % 1);
    carPos.set(pt.x, 0, pt.z);
    carHeading = Math.atan2(-(lookPt.x - pt.x), -(lookPt.z - pt.z));
    carSpeed = spec.maxSpeed * 0.78;
  } else {
    // Arcade Racing Physics
    const effectiveMax = isBoosting ? spec.maxSpeed * 1.32 : spec.maxSpeed;
    const effectiveAccel = isBoosting ? spec.accel * 1.55 : spec.accel;

    if (keys.up) {
      carSpeed = Math.min(effectiveMax, carSpeed + effectiveAccel);
    } else if (keys.down) {
      carSpeed = Math.max(-spec.maxSpeed * 0.45, carSpeed - spec.accel * 1.3);
    } else {
      carSpeed *= 0.975;
      if (Math.abs(carSpeed) < 0.004) carSpeed = 0;
    }

    if (Math.abs(carSpeed) > 0.01) {
      const dirSign = carSpeed >= 0 ? 1 : -1;
      if (keys.left) carHeading += spec.handling * dirSign;
      if (keys.right) carHeading -= spec.handling * dirSign;
    }

    carPos.x -= Math.sin(carHeading) * carSpeed;
    carPos.z -= Math.cos(carHeading) * carSpeed;

    // Soft Track Boundary Containment (keeps car near asphalt ribbon)
    const sample = getClosestTrackSample(carPos);
    lastTrackT = sample.t;
    if (sample.dist > ROAD_HALF_WIDTH + 1.8) {
      const trackPt = trackCurve.getPointAt(sample.t);
      carPos.x = THREE.MathUtils.lerp(carPos.x, trackPt.x, 0.14);
      carPos.z = THREE.MathUtils.lerp(carPos.z, trackPt.z, 0.14);
      carSpeed *= 0.93;
    }
  }

  // Update Car 3D Transform & Exhaust Flames
  carGroup.position.copy(carPos);
  carGroup.rotation.y = carHeading;

  wheelMeshes.forEach(w => {
    w.rotation.x -= carSpeed * 0.85;
  });

  if (leftFlame && rightFlame) {
    const flameAlpha = isBoosting ? 0.88 : (keys.up && carSpeed > 0.5 ? 0.28 : 0.0);
    leftFlame.material.opacity = flameAlpha;
    rightFlame.material.opacity = flameAlpha;
    const scaleZ = isBoosting ? 1.45 + Math.random() * 0.4 : 0.7;
    leftFlame.scale.set(1, scaleZ, 1);
    rightFlame.scale.set(1, scaleZ, 1);
  }

  // Camera Modes
  const forwardX = -Math.sin(carHeading);
  const forwardZ = -Math.cos(carHeading);

  if (cameraMode === 0) {
    // Dynamic Chase Cam
    const camDist = isBoosting ? 9.6 : 8.4;
    const targetCamX = carPos.x - forwardX * camDist;
    const targetCamZ = carPos.z - forwardZ * camDist;
    camera.position.lerp(new THREE.Vector3(targetCamX, carPos.y + 3.6, targetCamZ), 0.14);
    camera.lookAt(carPos.x + forwardX * 6, carPos.y + 0.9, carPos.z + forwardZ * 6);
  } else if (cameraMode === 1) {
    // Hood / Cockpit Cam
    camera.position.set(carPos.x + forwardX * 0.4, carPos.y + 1.35, carPos.z + forwardZ * 0.4);
    camera.lookAt(carPos.x + forwardX * 20, carPos.y + 1.1, carPos.z + forwardZ * 20);
  } else {
    // Helicopter Overhead Cam
    camera.position.lerp(new THREE.Vector3(carPos.x, carPos.y + 38, carPos.z + 18), 0.1);
    camera.lookAt(carPos.x, carPos.y, carPos.z);
  }

  // Lap Timing Logic
  if (lastTrackT > 0.45 && lastTrackT < 0.6) {
    passedHalfway = true;
  }
  if (passedHalfway && lastTrackT < 0.08) {
    passedHalfway = false;
    const lapSec = (now - lapStartTime) / 1000;
    lapStartTime = now;
    if (!bestLapSeconds || lapSec < bestLapSeconds) {
      bestLapSeconds = lapSec;
      document.getElementById("best-lap").textContent = formatLapTime(bestLapSeconds);
      showToast(`NEW FASTEST LAP: ${formatLapTime(bestLapSeconds)}!`);
    }
  }
  document.getElementById("lap-timer").textContent = formatLapTime((now - lapStartTime) / 1000);

  // Nearest Portfolio Checkpoint Detection
  let closestZone = 0;
  let minZoneDist = Infinity;
  checkpointMeshes.forEach((item, idx) => {
    const d = carPos.distanceTo(item.position);
    if (d < minZoneDist) {
      minZoneDist = d;
      closestZone = idx;
    }
  });

  if (closestZone !== activeZoneIndex || Math.floor(now) % 12 === 0) {
    activeZoneIndex = closestZone;
    updateLiveZoneHUD(activeZoneIndex, Math.round(minZoneDist));
  }

  // Digital Speedometer, Gear, RPM & Audio Telemetry
  const speedRatio = Math.min(1, Math.abs(carSpeed) / spec.maxSpeed);
  const kmh = Math.round(speedRatio * spec.displayMaxKmh * (isBoosting ? 1.15 : 1));
  document.getElementById("hud-speed").textContent = String(kmh).padStart(3, "0");

  let gear = "N";
  if (carSpeed < -0.05) gear = "R";
  else if (kmh > 0 && kmh < 55) gear = "1";
  else if (kmh >= 55 && kmh < 110) gear = "2";
  else if (kmh >= 110 && kmh < 175) gear = "3";
  else if (kmh >= 175 && kmh < 240) gear = "4";
  else if (kmh >= 240 && kmh < 305) gear = "5";
  else if (kmh >= 305) gear = "6";
  document.getElementById("hud-gear").textContent = gear;

  const rpmPct = Math.min(100, Math.round(15 + (speedRatio * 85) + (isBoosting ? 12 : 0)));
  document.getElementById("rpm-bar").style.width = `${rpmPct}%`;
  const rpmNumber = Math.round(1200 + (rpmPct / 100) * 8600);
  document.getElementById("rpm-readout").textContent = `${rpmNumber.toLocaleString()} RPM`;
  document.getElementById("hud-nitro").style.width = `${Math.round(nitroAmount)}%`;

  updateEngineAudio(speedRatio, isBoosting);

  renderer.render(scene, camera);
}

window.onload = () => {
  renderProjectsGrid("all");
  renderSkillsGrid();
  requestAnimationFrame(animate);
};
