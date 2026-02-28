/* =========================
   AUDIO BANK
========================= */

const audioBank = [
  {
    id: "AomorikenHirakawashi_Senkotsu_202556",
    file: "audio/AomorikenHirakawashi_Senkotsu_202556.mp3"
  },
  {
    id: "OsakaNakatsu_weather_zekkotsu_20250427",
    file: "audio/OsakaNakatsu_weather_zekkotsu_20250427.mp3"
  },
  {
    id: "TokyoKitakuAkabanekita_Nozomu_Rokkotu_20250427",
    file: "audio/TokyoKitakuAkabanekita_Nozomu_Rokkotu_20250427.mp3"
  }
];


/* =========================
   ASSIGNMENT STATE
========================= */

const boneAssignments = {
  "bone-1": null,
  "bone-2": null,
  "bone-3": null,
  "bone-4": null,
  "bone-5": null,
  "bone-6": null,
  "bone-7": null
};


/* =========================
   GLOBAL STATE
========================= */

let selectedBone = null;

let previewAudio = null;
let previewTimer = null;

let playingAudios = [];
let playbackTimer = null;
let isPlaying = false;


/* =========================
   INIT : BONE CLICK
========================= */

document.querySelectorAll(".bone").forEach(bone => {
  bone.addEventListener("click", () => {
    if (isPlaying) return;
    if (bone.id === "bone-8") return;

    selectedBone = bone.id;
    openAudioPanel();
  });
});


/* =========================
   AUDIO PANEL
========================= */

function openAudioPanel() {
  const panel = document.getElementById("audio-panel");
  const list = document.getElementById("audio-list");
  const title = document.getElementById("audio-panel-title");

  title.textContent = `SELECT AUDIO (${selectedBone})`;
  list.innerHTML = "";

  audioBank.forEach(audio => {
    const li = document.createElement("li");

    const label = document.createElement("span");
    label.textContent = audio.id;

    const previewBtn = document.createElement("button");
    previewBtn.textContent = "▶ preview";
    previewBtn.onclick = () => playPreview(audio);

    const assignBtn = document.createElement("button");
    assignBtn.textContent = "✔ assign";
    assignBtn.onclick = () => assignAudioToBone(selectedBone, audio);

    li.append(label, previewBtn, assignBtn);
    list.appendChild(li);
  });

  panel.classList.remove("hidden");
}

function closeAudioPanel() {
  document.getElementById("audio-panel").classList.add("hidden");
  selectedBone = null;
}


/* =========================
   PREVIEW
========================= */

function playPreview(audio) {
  stopPreview();

  previewAudio = new Audio(audio.file);
  previewAudio.play().catch(() => {});
  previewTimer = setTimeout(stopPreview, 10000);
}

function stopPreview() {
  if (!previewAudio) return;
  previewAudio.pause();
  previewAudio = null;
  clearTimeout(previewTimer);
}


/* =========================
   ASSIGN
========================= */

function assignAudioToBone(boneId, audio) {
  if (!boneId) return;

  boneAssignments[boneId] = audio;
  document.getElementById(boneId)?.classList.add("assigned");

  updateProgress();
  checkPlaybackReady();
  closeAudioPanel();
}


/* =========================
   PROGRESS
========================= */

function updateProgress() {
  ensureProgressWrapper();

  const assigned = Object.values(boneAssignments).filter(Boolean).length;
  const percent = Math.round((assigned / 7) * 100);

  document.getElementById("progress-bar").style.width = `${percent}%`;
  document.getElementById("progress-text").textContent =
    `${assigned} / 7 (${percent}%)`;
}

function ensureProgressWrapper() {
  if (document.getElementById("progress-wrapper")) return;

  const div = document.createElement("div");
  div.id = "progress-wrapper";
  div.innerHTML = `
    <div id="progress-bar-bg">
      <div id="progress-bar"></div>
    </div>
    <div id="progress-text">0 / 7 (0%)</div>
  `;
  document.body.appendChild(div);
}


/* =========================
   READY CHECK
========================= */

function checkPlaybackReady() {
  if (!Object.values(boneAssignments).every(Boolean)) return;

  const playBtn = document.getElementById("play-button");
  playBtn.classList.remove("hidden");
  playBtn.classList.add("ready");
  playBtn.disabled = false;
  playBtn.textContent = "▶ 再生を開始";

  showReadyMessage();
}

function showReadyMessage() {
  let msg = document.getElementById("ready-message");
  if (msg) return;

  msg = document.createElement("div");
  msg.id = "ready-message";
  msg.textContent = "準備完了・再生をタップしてください";
  document.body.appendChild(msg);
}


/* =========================
   PLAYBACK
========================= */

document.getElementById("play-button")
  .addEventListener("click", startPlayback);

function startPlayback() {
  if (isPlaying) return;
  isPlaying = true;

  stopPreview();
  closeAudioPanel();

  const overlay = document.getElementById("loading-overlay");
  const loadingText = document.getElementById("loading-progress");

  overlay.classList.remove("hidden");

  playingAudios = [];
  let loaded = 0;

  Object.values(boneAssignments).forEach(audio => {
    const a = new Audio(audio.file);
    a.preload = "auto";

    a.addEventListener("canplaythrough", () => {
      loaded++;
      loadingText.textContent = `${loaded} / 7`;

      if (loaded === 7) {
        overlay.classList.add("hidden");
        actuallyPlayAll();
      }
    }, { once: true });

    playingAudios.push(a);
  });
}

function actuallyPlayAll() {
  const playBtn = document.getElementById("play-button");
  playBtn.disabled = true;
  playBtn.classList.remove("ready");
  playBtn.textContent = "再生中…";

  playingAudios.forEach(a => a.play().catch(() => {}));
  playbackTimer = setTimeout(stopPlayback, 300000);
}

function stopPlayback() {
  playingAudios.forEach(a => a.pause());
  isPlaying = false;
}
