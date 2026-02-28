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
    if (isPlaying) return;        // 再生中はロック
    if (bone.id === "bone-8") return;

    selectedBone = bone.id;
    openAudioPanel();
  });
});


/* =========================
   AUDIO PANEL UI
========================= */

function openAudioPanel() {
  const panel = document.getElementById("audio-panel");
  const list = document.getElementById("audio-list");
  const title = document.getElementById("audio-panel-title");

  title.textContent = `SELECT AUDIO（${selectedBone}）`;
  list.innerHTML = "";

  audioBank.forEach(audio => {
    const li = document.createElement("li");

    const label = document.createElement("span");
    label.className = "audio-id";
    label.textContent = audio.id;

    const controls = document.createElement("div");
    controls.className = "audio-controls";

    const previewBtn = document.createElement("button");
    previewBtn.textContent = "▶︎ preview";
    previewBtn.onclick = () => playPreview(audio);

    const assignBtn = document.createElement("button");
    assignBtn.textContent = "✔ assign";
    assignBtn.onclick = () => assignAudioToBone(selectedBone, audio);

    controls.appendChild(previewBtn);
    controls.appendChild(assignBtn);

    li.appendChild(label);
    li.appendChild(controls);
    list.appendChild(li);
  });

  panel.classList.remove("hidden");
}


/* =========================
   PREVIEW (10 seconds)
========================= */

function playPreview(audio) {
  stopPreview();

  previewAudio = new Audio(audio.file);
  previewAudio.currentTime = 0;
  previewAudio.play().catch(err => {
    console.warn("プレビュー再生失敗:", err);
  });

  previewTimer = setTimeout(() => {
    stopPreview();
  }, 10000);
}

function stopPreview() {
  if (previewAudio) {
    previewAudio.pause();
    previewAudio.currentTime = 0;
    previewAudio = null;
  }
  if (previewTimer) {
    clearTimeout(previewTimer);
    previewTimer = null;
  }
}


/* =========================
   ASSIGN AUDIO TO BONE
========================= */

function assignAudioToBone(boneId, audio) {
  if (!boneId) return;

  boneAssignments[boneId] = audio;

  const boneEl = document.getElementById(boneId);
  boneEl.classList.add("assigned");

  checkPlaybackReady();
}


/* =========================
   PLAYBACK READY CHECK
========================= */

function allBonesAssigned() {
  return Object.values(boneAssignments).every(a => a !== null);
}

function checkPlaybackReady() {
  const playBtn = document.getElementById("play-button");

  if (allBonesAssigned()) {
    playBtn.classList.remove("hidden");
  }
}


/* =========================
   PLAYBACK CONTROL
========================= */

document
  .getElementById("play-button")
  .addEventListener("click", startPlayback);


function startPlayback() {
  if (isPlaying) return;

  isPlaying = true;
  stopPreview();

  const playBtn = document.getElementById("play-button");
  playBtn.disabled = true;
  playBtn.textContent = "再生中…";

  playingAudios = [];

  Object.values(boneAssignments).forEach(audio => {
    const a = new Audio(audio.file);
    a.currentTime = 0;
    a.play().catch(err => {
      console.warn("再生失敗:", err);
    });
    playingAudios.push(a);
  });

  // 5分（300秒）で停止
  playbackTimer = setTimeout(stopPlayback, 300000);
}


function stopPlayback() {
  playingAudios.forEach(a => {
    a.pause();
    a.currentTime = 0;
  });

  playingAudios = [];

  if (playbackTimer) {
    clearTimeout(playbackTimer);
    playbackTimer = null;
  }

  isPlaying = false;

  const playBtn = document.getElementById("play-button");
  playBtn.disabled = false;
  playBtn.textContent = "▶︎ 再生";

  console.log("再生終了（5分）");
}
