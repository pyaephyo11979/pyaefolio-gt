// =========================================================================
// 2. RENDER DOSSIER PROJECTS & SKILLS GRIDS
// =========================================================================
function renderProjectsGrid(filter = "all") {
  const grid = document.getElementById("projects-grid");
  if (!grid) return;
  const list = filter === "all"
    ? PORTFOLIO_PROJECTS
    : PORTFOLIO_PROJECTS.filter(p => p.category === filter);

  grid.innerHTML = list.map((p) => `
    <div class="bg-slate-900/90 rounded-xl p-4 border border-white/10 hover:border-red-500/50 transition-all flex flex-col justify-between">
      <div>
        <div class="flex items-center justify-between gap-2 mb-2">
          <span class="px-2 py-0.5 rounded text-[10px] font-racing font-bold uppercase bg-red-500/20 text-red-300 border border-red-500/30">${p.badge}</span>
          <button data-warp-project="${p.warpT}" class="text-[10px] font-racing text-cyan-300 hover:text-cyan-200 underline">Warp on Track 🏎️</button>
        </div>
        <h4 class="font-racing font-bold text-sm text-white mb-1.5">${p.title}</h4>
        <p class="text-xs text-slate-300 leading-relaxed mb-3">${p.desc}</p>
      </div>
      <div>
        <div class="flex flex-wrap gap-1 mb-3">
          ${p.tech.map(t => `<span class="px-1.5 py-0.5 text-[10px] rounded bg-white/5 text-slate-300 border border-white/10">${t}</span>`).join("")}
        </div>
        <div class="flex items-center gap-2 pt-2 border-t border-white/10">
          <a href="${p.liveUrl}" target="_blank" rel="noopener noreferrer" class="flex-1 text-center py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-racing text-[10px] font-bold uppercase">Live Demo ↗</a>
          <a href="${p.repoUrl}" target="_blank" rel="noopener noreferrer" class="flex-1 text-center py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 font-racing text-[10px] font-bold uppercase">GitHub ↗</a>
        </div>
      </div>
    </div>
  `).join("");

  grid.querySelectorAll("[data-warp-project]").forEach(btn => {
    btn.addEventListener("click", () => {
      const targetT = parseFloat(btn.getAttribute("data-warp-project"));
      closeDossierModal();
      setAppMode("track");
      warpToTrackProgress(targetT);
    });
  });
}

function renderSkillsGrid() {
  const grid = document.getElementById("skills-grid");
  if (!grid) return;
  grid.innerHTML = SKILL_CATEGORIES.map(cat => `
    <div class="bg-slate-900/90 rounded-xl p-4 border border-white/10">
      <div class="flex items-center justify-between mb-2">
        <h4 class="font-racing font-bold text-xs uppercase text-white">${cat.title}</h4>
        <span class="text-[10px] font-racing text-amber-400">${cat.rpm}</span>
      </div>
      <div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-3">
        <div class="h-full bg-gradient-to-r ${cat.color} w-11/12"></div>
      </div>
      <div class="flex flex-wrap gap-1.5">
        ${cat.items.map(item => `
          <span class="px-2.5 py-1 rounded-lg bg-slate-950 text-xs text-slate-200 border border-white/10">${item}</span>
        `).join("")}
      </div>
    </div>
  `).join("");
}

