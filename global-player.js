(() => {
  if (document.querySelector("[data-audio]")) return;

  const tracks = Array.isArray(window.BEIAI_MUSIC_TRACKS) ? window.BEIAI_MUSIC_TRACKS : [];
  const petApi = window.BEIAI_PET;
  if (!tracks.length) return;

  const STATE_KEY = "beiaiGlobalMusicState";
  const player = document.createElement("section");
  player.className = "global-music-player";
  player.setAttribute("aria-label", "悬浮音乐播放器");
  player.innerHTML = `
    <div class="global-player-head">
      <span class="global-player-note" aria-hidden="true">♪</span>
      <div class="global-player-heading">
        <strong data-global-title>BEIAI MUSIC</strong>
        <small data-global-artist>音乐播放器</small>
      </div>
      <button type="button" data-global-collapse aria-label="折叠播放器" title="折叠播放器">−</button>
    </div>
    <div class="global-player-body">
      <img data-global-cover src="assets/hero-glass-garden.png" alt="当前歌曲封面" loading="lazy" decoding="async" />
      <div class="global-player-main">
        <div class="global-player-controls">
          <button type="button" data-global-prev aria-label="上一首" title="上一首">⏮</button>
          <button type="button" data-global-play aria-label="播放" title="播放">▶</button>
          <button type="button" data-global-next aria-label="下一首" title="下一首">⏭</button>
          <button type="button" data-global-feed aria-label="把当前音乐投喂给宠物" title="把当前音乐投喂给宠物">PET</button>
          <button type="button" data-music-motion-toggle aria-label="关闭页面抖动" title="关闭页面抖动" aria-pressed="true">震</button>
          <span data-global-status>READY</span>
        </div>
        <input data-global-seek type="range" min="0" max="1000" value="0" aria-label="播放进度" />
        <div class="global-player-footer">
          <span data-global-time>00:00 / 00:00</span>
          <span aria-hidden="true">VOL</span>
          <input data-global-volume type="range" min="0" max="1" step="0.01" value="0.5" aria-label="音量" />
        </div>
        <label class="global-motion-strength" title="页面抖动幅度">
          <span>AMP <output data-music-motion-strength-value>100%</output></span>
          <input data-music-motion-strength type="range" min="0.25" max="2" step="0.05" value="1" aria-label="页面抖动幅度" />
        </label>
      </div>
    </div>
    <audio data-global-audio preload="none"></audio>
  `;
  document.body.appendChild(player);
  window.syncMusicMotionButtons?.();

  const audio = player.querySelector("[data-global-audio]");
  const cover = player.querySelector("[data-global-cover]");
  const title = player.querySelector("[data-global-title]");
  const artist = player.querySelector("[data-global-artist]");
  const status = player.querySelector("[data-global-status]");
  const playButton = player.querySelector("[data-global-play]");
  const previousButton = player.querySelector("[data-global-prev]");
  const nextButton = player.querySelector("[data-global-next]");
  const feedButton = player.querySelector("[data-global-feed]");
  const collapseButton = player.querySelector("[data-global-collapse]");
  const seekSlider = player.querySelector("[data-global-seek]");
  const volumeSlider = player.querySelector("[data-global-volume]");
  const timeLabel = player.querySelector("[data-global-time]");

  let currentIndex = 0;
  let lastStateSave = 0;
  let beatAudioContext = null;
  let beatAnalyser = null;
  let beatSource = null;
  let beatSink = null;
  let beatCapturedStream = null;
  let beatFrequencyData = null;
  let beatAnimationFrame = 0;
  let allTracksConsumed = false;
  let pendingStartTime = 0;
  const mobilePlayerQuery = window.matchMedia?.("(max-width: 768px)");
  const reducedMotionPlayerQuery = window.matchMedia?.("(prefers-reduced-motion: reduce)");

  function shouldDisableBeatSampling() {
    return Boolean(mobilePlayerQuery?.matches || reducedMotionPlayerQuery?.matches);
  }

  function isConsumed(index) {
    return Boolean(petApi?.isTrackConsumed(tracks[index]));
  }

  function findPlayableIndex(startIndex, direction = 1) {
    for (let offset = 0; offset < tracks.length; offset += 1) {
      const index = (startIndex + offset * direction + tracks.length * 2) % tracks.length;
      if (!isConsumed(index)) return index;
    }
    return -1;
  }

  function formatTime(seconds) {
    if (!Number.isFinite(seconds)) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainder = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
  }

  function ensureBeatAudioGraph() {
    if (beatAudioContext) return;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    beatAudioContext = new AudioContextClass();
    beatAnalyser = beatAudioContext.createAnalyser();
    beatAnalyser.fftSize = 512;
    beatAnalyser.smoothingTimeConstant = 0.42;
    beatFrequencyData = new Uint8Array(beatAnalyser.frequencyBinCount);
  }

  function connectBeatAnalyser() {
    if (!beatAudioContext || !beatAnalyser || beatSource) return;

    if (window.location.protocol === "file:") {
      const captureStream = audio.captureStream || audio.mozCaptureStream;

      try {
        if (typeof captureStream !== "function") return;
        if (!beatCapturedStream) beatCapturedStream = captureStream.call(audio);
        if (!beatCapturedStream.getAudioTracks().length) return;

        const source = beatAudioContext.createMediaStreamSource(beatCapturedStream);
        beatSink = beatAudioContext.createGain();
        beatSink.gain.value = 0;
        source.connect(beatAnalyser);
        beatAnalyser.connect(beatSink);
        beatSink.connect(beatAudioContext.destination);
        beatSource = source;
      } catch (error) {
        // Local file playback continues even when beat analysis is unavailable.
      }
      return;
    }

    try {
      const source = beatAudioContext.createMediaElementSource(audio);
      source.connect(beatAnalyser);
      beatAnalyser.connect(beatAudioContext.destination);
      beatSource = source;
    } catch (error) {
      // Playback remains usable if the browser rejects Web Audio routing.
    }
  }

  function startBeatSampling() {
    if (shouldDisableBeatSampling()) return;
    if (beatAnimationFrame) window.cancelAnimationFrame(beatAnimationFrame);

    function sampleBeat() {
      if (audio.paused) {
        beatAnimationFrame = 0;
        return;
      }

      if (beatAnalyser && beatFrequencyData && beatAudioContext) {
        beatAnalyser.getByteFrequencyData(beatFrequencyData);
        if (typeof window.reportMusicFrequencyData === "function") {
          window.reportMusicFrequencyData(
            beatFrequencyData,
            beatAudioContext.sampleRate,
            beatAnalyser.fftSize
          );
        }
      }

      beatAnimationFrame = window.requestAnimationFrame(sampleBeat);
    }

    beatAnimationFrame = window.requestAnimationFrame(sampleBeat);
  }

  function stopBeatSampling() {
    if (beatAnimationFrame) window.cancelAnimationFrame(beatAnimationFrame);
    beatAnimationFrame = 0;
    if (typeof window.resetMusicBeatPulse === "function") window.resetMusicBeatPulse();
  }

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STATE_KEY));
      if (!saved || typeof saved !== "object") return null;
      return saved;
    } catch (error) {
      return null;
    }
  }

  function saveState(wasPlaying = !audio.paused) {
    const previous = loadState();
    const state = {
      trackIndex: currentIndex,
      currentTime: audio.hasAttribute("src") && Number.isFinite(audio.currentTime)
        ? audio.currentTime
        : pendingStartTime,
      volume: audio.volume,
      wasPlaying,
      updatedAt: Date.now(),
      collapsed: player.classList.contains("collapsed")
    };

    try {
      localStorage.setItem(STATE_KEY, JSON.stringify({ ...previous, ...state }));
    } catch (error) {
      // Playback still works if storage is unavailable.
    }
  }

  function updateTrackDisplay() {
    const track = tracks[currentIndex];
    title.textContent = track.title;
    artist.textContent = track.artist;
    cover.src = track.cover;
    cover.alt = `${track.artist} - ${track.title} 封面`;
  }

  function setPageCover(active) {
    const coverUrl = active ? new URL(tracks[currentIndex].cover, document.baseURI).href : null;
    if (typeof window.setMusicPageCover === "function") window.setMusicPageCover(coverUrl);
  }

  async function playCurrent() {
    if (allTracksConsumed || isConsumed(currentIndex)) return;

    if (!audio.hasAttribute("src")) {
      loadTrack(currentIndex, true, pendingStartTime);
      return;
    }

    if (!shouldDisableBeatSampling()) ensureBeatAudioGraph();

    try {
      if (beatAudioContext?.state === "suspended") await beatAudioContext.resume();
      await audio.play();
      if (!shouldDisableBeatSampling()) connectBeatAnalyser();
      player.classList.remove("needs-play");
    } catch (error) {
      status.textContent = "点击继续";
      player.classList.add("needs-play");
      saveState(false);
    }
  }

  function showAllTracksConsumed() {
    allTracksConsumed = true;
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
    title.textContent = "▓▒░ DATA LOST ░▒▓";
    artist.textContent = "PET MUSIC ORGAN 38 / 38";
    status.textContent = "PET FULL";
    playButton.disabled = true;
    previousButton.disabled = true;
    nextButton.disabled = true;
    feedButton.disabled = true;
    seekSlider.disabled = true;
    setPageCover(false);
  }

  function loadTrack(index, autoplay = false, startTime = 0, direction = 1, deferAudio = false) {
    const playableIndex = findPlayableIndex(index, direction);
    if (playableIndex < 0) {
      showAllTracksConsumed();
      return;
    }

    allTracksConsumed = false;
    playButton.disabled = false;
    previousButton.disabled = false;
    nextButton.disabled = false;
    feedButton.disabled = false;
    seekSlider.disabled = false;
    currentIndex = playableIndex;
    const track = tracks[currentIndex];

    audio.pause();
    seekSlider.value = "0";
    timeLabel.textContent = "00:00 / 00:00";
    updateTrackDisplay();
    pendingStartTime = Math.max(0, Number(startTime) || 0);

    if (deferAudio) {
      audio.removeAttribute("src");
      status.textContent = pendingStartTime > 0 ? "PLAY TO RESUME" : "READY";
      return;
    }

    audio.src = track.src;
    audio.load();
    status.textContent = "LOADING";

    audio.addEventListener("loadedmetadata", () => {
      if (Number.isFinite(audio.duration)) {
        if (startTime >= audio.duration) {
          loadTrack(currentIndex + direction, autoplay, 0, direction);
          return;
        }
        audio.currentTime = Math.max(0, Math.min(startTime, audio.duration - 0.1));
      }

      pendingStartTime = 0;
      status.textContent = autoplay ? "RESUME" : "READY";
      if (autoplay) playCurrent();
    }, { once: true });
  }

  function togglePlayback() {
    if (audio.paused) {
      playCurrent();
    } else {
      audio.pause();
    }
  }

  async function feedCurrentTrack() {
    if (!petApi || allTracksConsumed || isConsumed(currentIndex)) return;
    const track = tracks[currentIndex];
    if (track.petFeedable === false) {
      petApi.consumeTrack(track);
      status.textContent = "无法消化";
      return;
    }
    const requestConfirmation = typeof window.requestPetMusicFeed === "function"
      ? window.requestPetMusicFeed(track)
      : Promise.resolve(window.confirm(`确定把《${track.title}》投喂给宠物吗？此操作不可逆。`));
    const confirmed = await requestConfirmation;
    if (!confirmed) return;

    const result = petApi.consumeTrack(track);
    if (result.complete) {
      window.setTimeout(() => {
        window.location.href = "archive-recovery.html";
      }, 900);
    }
  }

  function refreshConsumedTracks() {
    if (allTracksConsumed) {
      loadTrack(currentIndex, false);
      return;
    }
    if (!isConsumed(currentIndex)) return;
    loadTrack(currentIndex + 1, !audio.paused);
  }

  playButton.addEventListener("click", togglePlayback);
  previousButton.addEventListener("click", () => loadTrack(currentIndex - 1, true, 0, -1));
  nextButton.addEventListener("click", () => loadTrack(currentIndex + 1, true));
  feedButton.addEventListener("click", feedCurrentTrack);

  collapseButton.addEventListener("click", () => {
    const collapsed = player.classList.toggle("collapsed");
    collapseButton.textContent = collapsed ? "+" : "−";
    collapseButton.setAttribute("aria-label", collapsed ? "展开播放器" : "折叠播放器");
    collapseButton.title = collapsed ? "展开播放器" : "折叠播放器";
    saveState();
  });

  seekSlider.addEventListener("input", () => {
    if (!Number.isFinite(audio.duration)) return;
    audio.currentTime = (Number(seekSlider.value) / 1000) * audio.duration;
    saveState();
  });

  volumeSlider.addEventListener("input", () => {
    audio.volume = Number(volumeSlider.value);
    saveState();
  });

  audio.addEventListener("loadedmetadata", () => {
    timeLabel.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
  });

  audio.addEventListener("timeupdate", () => {
    if (Number.isFinite(audio.duration)) {
      seekSlider.value = String(Math.round((audio.currentTime / audio.duration) * 1000));
      timeLabel.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
    }

    if (Date.now() - lastStateSave > 1000) {
      lastStateSave = Date.now();
      saveState();
    }
  });

  audio.addEventListener("play", () => {
    playButton.textContent = "Ⅱ";
    playButton.setAttribute("aria-label", "暂停");
    playButton.title = "暂停";
    status.textContent = "PLAYING";
    if (!shouldDisableBeatSampling()) {
      ensureBeatAudioGraph();
      if (beatAudioContext?.state === "suspended") beatAudioContext.resume().catch(() => {});
      connectBeatAnalyser();
      window.setTimeout(connectBeatAnalyser, 250);
    }
    startBeatSampling();
    setPageCover(true);
    saveState(true);
  });

  audio.addEventListener("pause", () => {
    playButton.textContent = "▶";
    playButton.setAttribute("aria-label", "播放");
    playButton.title = "播放";
    if (!audio.ended) status.textContent = "PAUSED";
    stopBeatSampling();
    setPageCover(false);
    saveState(false);
  });

  audio.addEventListener("ended", () => loadTrack(currentIndex + 1, true));
  audio.addEventListener("error", () => {
    status.textContent = "LOAD ERROR";
    stopBeatSampling();
    setPageCover(false);
  });

  cover.addEventListener("error", () => {
    cover.src = "assets/hero-glass-garden.png";
  });

  window.addEventListener("pagehide", () => saveState(!audio.paused));
  window.addEventListener("storage", (event) => {
    if (event.key === petApi?.keys.consumedTracks) refreshConsumedTracks();
  });
  window.addEventListener("beiai:pet-change", (event) => {
    if (event.detail?.type === "consumed" || event.detail?.type === "debug-reset") refreshConsumedTracks();
  });

  const savedState = loadState();
  const savedIndex = Number.isInteger(savedState?.trackIndex) ? savedState.trackIndex : 0;
  const savedVolume = Number.isFinite(savedState?.volume) ? savedState.volume : 0.5;
  const stateAge = Number.isFinite(savedState?.updatedAt) ? Date.now() - savedState.updatedAt : Infinity;
  const shouldResume = savedState?.wasPlaying === true && stateAge >= 0 && stateAge < 30000;
  const navigationDelay = shouldResume ? Math.min(stateAge / 1000, 10) : 0;
  const resumeTime = Math.max(0, Number(savedState?.currentTime) || 0) + navigationDelay;

  audio.volume = Math.max(0, Math.min(savedVolume, 1));
  volumeSlider.value = String(audio.volume);
  const shouldCollapse = Boolean(mobilePlayerQuery?.matches || savedState?.collapsed);
  player.classList.toggle("collapsed", shouldCollapse);
  collapseButton.textContent = shouldCollapse ? "+" : "−";
  collapseButton.setAttribute("aria-label", shouldCollapse ? "展开播放器" : "折叠播放器");
  collapseButton.title = shouldCollapse ? "展开播放器" : "折叠播放器";
  loadTrack(savedIndex, shouldResume, resumeTime, 1, !shouldResume);
})();
