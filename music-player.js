(() => {
  const tracks = Array.isArray(window.BEIAI_MUSIC_TRACKS) ? window.BEIAI_MUSIC_TRACKS : [];
  const petApi = window.BEIAI_PET;
  const SHARED_STATE_KEY = "beiaiGlobalMusicState";
  const audio = document.querySelector("[data-audio]");
  const playlist = document.querySelector("[data-playlist]");
  const cover = document.querySelector("[data-cover]");
  const title = document.querySelector("[data-track-title]");
  const artist = document.querySelector("[data-track-artist]");
  const playerStatus = document.querySelector("[data-player-status]");
  const lyricsBox = document.querySelector("[data-lyrics]");
  const lyricsState = document.querySelector("[data-lyrics-state]");
  const playButton = document.querySelector("[data-play]");
  const previousButton = document.querySelector("[data-prev]");
  const nextButton = document.querySelector("[data-next]");
  const feedCurrentButton = document.querySelector("[data-feed-current]");
  const muteButton = document.querySelector("[data-mute]");
  const seekSlider = document.querySelector("[data-seek]");
  const volumeSlider = document.querySelector("[data-volume]");
  const currentTimeLabel = document.querySelector("[data-current-time]");
  const durationLabel = document.querySelector("[data-duration]");
  const marquee = document.querySelector("[data-now-playing]");
  const canvas = document.querySelector("[data-visualizer]");

  if (!tracks.length || !audio || !playlist || !canvas) return;

  const canvasContext = canvas.getContext("2d");
  let currentIndex = 0;
  let currentLyrics = [];
  let activeLyricIndex = -1;
  let audioContext = null;
  let analyser = null;
  let analyserSource = null;
  let analyserSink = null;
  let capturedStream = null;
  let frequencyData = null;
  let spectrumMode = "pending";
  let lastSharedStateSave = 0;
  let allTracksConsumed = false;
  let pendingStartTime = 0;
  let visualizerAnimationFrame = 0;
  let lastVisualizerPaint = 0;
  const mobileVisualizerQuery = window.matchMedia?.("(max-width: 768px)");

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

  function loadSharedState() {
    try {
      const saved = JSON.parse(localStorage.getItem(SHARED_STATE_KEY));
      return saved && typeof saved === "object" ? saved : null;
    } catch (error) {
      return null;
    }
  }

  function saveSharedState(wasPlaying = !audio.paused) {
    const previous = loadSharedState();

    try {
      localStorage.setItem(SHARED_STATE_KEY, JSON.stringify({
        ...previous,
        trackIndex: currentIndex,
        currentTime: audio.hasAttribute("src") && Number.isFinite(audio.currentTime)
          ? audio.currentTime
          : pendingStartTime,
        volume: audio.volume,
        wasPlaying,
        updatedAt: Date.now()
      }));
    } catch (error) {
      // The full player still works if storage is unavailable.
    }
  }

  function parseLrc(rawLyrics) {
    if (!rawLyrics) return [];

    const parsed = [];
    const timestampPattern = /\[(\d{1,2}):(\d{2}(?:\.\d{1,3})?)\]/g;

    rawLyrics.split(/\r?\n/).forEach((line) => {
      const timestamps = Array.from(line.matchAll(timestampPattern));
      if (!timestamps.length) return;

      const text = line.replace(timestampPattern, "").trim();
      if (!text) return;

      timestamps.forEach((match) => {
        parsed.push({
          time: Number(match[1]) * 60 + Number(match[2]),
          text
        });
      });
    });

    return parsed.sort((a, b) => a.time - b.time);
  }

  function renderPlaylist() {
    const fragment = document.createDocumentFragment();

    tracks.forEach((track, index) => {
      const item = document.createElement("li");
      const button = document.createElement("button");
      const feedButton = document.createElement("button");
      const number = document.createElement("span");
      const details = document.createElement("span");
      const trackName = document.createElement("strong");
      const trackArtist = document.createElement("small");

      const consumed = isConsumed(index);
      const displayTrack = consumed && petApi ? petApi.garbleTrack(track) : track;

      item.className = consumed ? "playlist-item consumed" : "playlist-item";
      button.type = "button";
      button.className = "playlist-track-button";
      button.dataset.trackIndex = String(index);
      button.title = consumed ? "这首音乐已经被宠物消化" : `播放 ${track.title}`;
      button.disabled = consumed;
      feedButton.type = "button";
      feedButton.className = "playlist-feed-button";
      feedButton.dataset.feedIndex = String(index);
      feedButton.textContent = consumed ? "EATEN" : "FEED";
      feedButton.title = consumed ? "已被宠物消化" : `把 ${track.title} 投喂给宠物`;
      feedButton.disabled = consumed;
      number.className = "playlist-number";
      details.className = "playlist-details";
      number.textContent = String(index + 1).padStart(2, "0");
      trackName.textContent = displayTrack.title;
      trackArtist.textContent = displayTrack.artist;
      details.append(trackName, trackArtist);
      button.append(number, details);
      item.append(button, feedButton);
      fragment.appendChild(item);
    });

    playlist.replaceChildren(fragment);
  }

  function updatePlaylistSelection() {
    playlist.querySelectorAll("[data-track-index]").forEach((button) => {
      const selected = Number(button.dataset.trackIndex) === currentIndex && !allTracksConsumed;
      button.classList.toggle("active", selected);
      button.setAttribute("aria-current", selected ? "true" : "false");
    });
    if (feedCurrentButton) feedCurrentButton.disabled = allTracksConsumed || isConsumed(currentIndex);
  }

  function renderLyrics(track) {
    currentLyrics = parseLrc(track.lyrics);
    activeLyricIndex = -1;
    lyricsBox.replaceChildren();

    if (!currentLyrics.length) {
      const message = document.createElement("p");
      message.className = "no-lyrics-message";
      message.textContent = `${track.title} 正在被你聆听`;
      lyricsState.textContent = "NO LRC FILE";
      lyricsBox.classList.add("no-lyrics");
      lyricsBox.appendChild(message);
      return;
    }

    lyricsBox.classList.remove("no-lyrics");
    lyricsState.textContent = "LRC SYNC ON";
    const fragment = document.createDocumentFragment();

    currentLyrics.forEach((line, index) => {
      const lyricButton = document.createElement("button");
      lyricButton.type = "button";
      lyricButton.className = "lyric-line";
      lyricButton.dataset.lyricIndex = String(index);
      lyricButton.title = `跳转到 ${formatTime(line.time)}`;
      lyricButton.textContent = line.text;
      fragment.appendChild(lyricButton);
    });

    lyricsBox.appendChild(fragment);
    lyricsBox.scrollTop = 0;
  }

  function syncLyrics() {
    if (!currentLyrics.length) return;

    let nextIndex = -1;
    const playbackTime = audio.currentTime + 0.12;
    for (let index = 0; index < currentLyrics.length; index += 1) {
      if (currentLyrics[index].time > playbackTime) break;
      nextIndex = index;
    }

    if (nextIndex === activeLyricIndex) return;

    const previousLine = lyricsBox.querySelector(".lyric-line.active");
    if (previousLine) previousLine.classList.remove("active");
    activeLyricIndex = nextIndex;

    if (nextIndex < 0) return;
    const activeLine = lyricsBox.querySelector(`[data-lyric-index="${nextIndex}"]`);
    if (!activeLine) return;

    activeLine.classList.add("active");
    const targetTop = activeLine.offsetTop - lyricsBox.clientHeight / 2 + activeLine.offsetHeight / 2;
    lyricsBox.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });
  }

  function updateMediaSession(track) {
    if (!("mediaSession" in navigator) || typeof MediaMetadata === "undefined") return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artist,
      album: "北艾 MUSIC ROOM",
      artwork: [{ src: new URL(track.cover, document.baseURI).href }]
    });
  }

  function setPageCover(active) {
    const coverUrl = active ? new URL(tracks[currentIndex].cover, document.baseURI).href : null;
    if (typeof window.setMusicPageCover === "function") window.setMusicPageCover(coverUrl);
  }

  function showAllTracksConsumed() {
    allTracksConsumed = true;
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
    title.textContent = "▓▒░ AUDIO ARCHIVE CONSUMED ░▒▓";
    artist.textContent = "38 / 38 · PET IS FULL";
    marquee.textContent = "※ 所有音乐均已被消化 ※ UNKNOWN ARCHIVE OPEN ※";
    playerStatus.textContent = "播放器中已没有可用音频";
    lyricsState.textContent = "DATA LOST";
    lyricsBox.classList.add("no-lyrics");
    lyricsBox.textContent = "锟斤拷▓▒░ 音频组织已经转移到宠物体内 ░▒▓锟斤拷";
    playButton.disabled = true;
    previousButton.disabled = true;
    nextButton.disabled = true;
    if (feedCurrentButton) feedCurrentButton.disabled = true;
    setPageCover(false);
    updatePlaylistSelection();
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
    currentIndex = playableIndex;
    const track = tracks[currentIndex];

    audio.pause();
    cover.src = track.cover;
    cover.alt = `${track.artist} - ${track.title} 封面`;
    title.textContent = track.title;
    artist.textContent = track.artist;
    currentTimeLabel.textContent = "00:00";
    durationLabel.textContent = "00:00";
    seekSlider.value = "0";
    marquee.textContent = `♪ Now Playing: ${track.artist} - ${track.title} ♪`;
    pendingStartTime = Math.max(0, Number(startTime) || 0);

    renderLyrics(track);
    updatePlaylistSelection();
    updateMediaSession(track);

    if (deferAudio) {
      audio.removeAttribute("src");
      seekSlider.disabled = true;
      playerStatus.textContent = pendingStartTime > 0
        ? `点击播放继续 ${track.title}`
        : `已选择 ${track.title}，点击播放后加载`;
      return;
    }

    audio.src = track.src;
    audio.load();
    seekSlider.disabled = false;
    playerStatus.textContent = `正在载入 ${track.title}`;

    if (autoplay || startTime > 0) {
      audio.addEventListener("loadedmetadata", () => {
        if (Number.isFinite(audio.duration) && audio.duration > 0) {
          if (startTime >= audio.duration) {
            loadTrack(currentIndex + direction, autoplay, 0, direction);
            return;
          }
          audio.currentTime = Math.max(0, Math.min(startTime, audio.duration - 0.1));
        }

        pendingStartTime = 0;
        if (autoplay) playCurrent();
      }, { once: true });
    }
  }

  function ensureAudioGraph() {
    if (audioContext) return;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      playerStatus.textContent = "当前浏览器不支持实时音频频谱";
      return;
    }

    audioContext = new AudioContextClass();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.42;
    frequencyData = new Uint8Array(analyser.frequencyBinCount);
  }

  function connectAnalyser() {
    if (!audioContext || !analyser || analyserSource) return;

    if (window.location.protocol === "file:") {
      const captureStream = audio.captureStream || audio.mozCaptureStream;

      try {
        if (typeof captureStream !== "function") throw new Error("captureStream unavailable");
        if (!capturedStream) capturedStream = captureStream.call(audio);
        if (!capturedStream.getAudioTracks().length) throw new Error("audio track not ready");

        analyserSource = audioContext.createMediaStreamSource(capturedStream);
        analyserSink = audioContext.createGain();
        analyserSink.gain.value = 0;
        analyserSource.connect(analyser);
        analyser.connect(analyserSink);
        analyserSink.connect(audioContext.destination);
        spectrumMode = "active";
        playerStatus.textContent = `正在播放 ${tracks[currentIndex].title}`;
      } catch (error) {
        spectrumMode = "unavailable";
        playerStatus.textContent = `正在播放 ${tracks[currentIndex].title}，当前浏览器的本地文件模式不支持频谱`;
      }
      return;
    }

    try {
      analyserSource = audioContext.createMediaElementSource(audio);
      analyserSource.connect(analyser);
      analyser.connect(audioContext.destination);
      spectrumMode = "active";
    } catch (error) {
      spectrumMode = "unavailable";
    }
  }

  async function playCurrent() {
    if (allTracksConsumed || isConsumed(currentIndex)) return;

    if (!audio.hasAttribute("src")) {
      loadTrack(currentIndex, true, pendingStartTime);
      return;
    }

    ensureAudioGraph();

    try {
      if (audioContext && audioContext.state === "suspended") await audioContext.resume();
      await audio.play();
      connectAnalyser();
    } catch (error) {
      playerStatus.textContent = "浏览器阻止了播放，请再点一次播放键";
    }
  }

  function togglePlayback() {
    if (audio.paused) {
      playCurrent();
    } else {
      audio.pause();
    }
  }

  function resizeCanvas() {
    const bounds = canvas.getBoundingClientRect();
    const pixelRatio = mobileVisualizerQuery?.matches ? 1 : Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.floor(bounds.width * pixelRatio));
    canvas.height = Math.max(1, Math.floor(bounds.height * pixelRatio));
    canvasContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  }

  function drawVisualizer(timestamp = performance.now()) {
    visualizerAnimationFrame = 0;
    const shouldContinue = !audio.paused && !document.hidden;
    const minimumFrameInterval = mobileVisualizerQuery?.matches ? 50 : 0;

    if (shouldContinue && timestamp - lastVisualizerPaint < minimumFrameInterval) {
      visualizerAnimationFrame = requestAnimationFrame(drawVisualizer);
      return;
    }

    lastVisualizerPaint = timestamp;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvasContext.clearRect(0, 0, width, height);
    canvasContext.fillStyle = "#020736";
    canvasContext.fillRect(0, 0, width, height);

    const maximumBars = mobileVisualizerQuery?.matches ? 32 : 64;
    const barCount = Math.max(18, Math.min(maximumBars, Math.floor(width / 7)));
    const gap = 2;
    const barWidth = Math.max(2, (width - gap * (barCount - 1)) / barCount);
    const gradient = canvasContext.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(0.32, "#72ffff");
    gradient.addColorStop(0.7, "#38a7ff");
    gradient.addColorStop(1, "#ff48c7");
    canvasContext.fillStyle = gradient;

    if (analyser && frequencyData) {
      analyser.getByteFrequencyData(frequencyData);
      if (!audio.paused && typeof window.reportMusicFrequencyData === "function") {
        window.reportMusicFrequencyData(frequencyData, audioContext.sampleRate, analyser.fftSize);
      }
    }

    for (let index = 0; index < barCount; index += 1) {
      const sampleIndex = frequencyData
        ? Math.floor((index / barCount) * frequencyData.length * 0.72)
        : 0;
      const strength = frequencyData ? frequencyData[sampleIndex] / 255 : 0;
      const barHeight = Math.max(2, strength * (height - 6));
      const x = index * (barWidth + gap);
      canvasContext.fillRect(x, height - barHeight, barWidth, barHeight);
    }

    if (shouldContinue) visualizerAnimationFrame = requestAnimationFrame(drawVisualizer);
  }

  function startVisualizer() {
    if (visualizerAnimationFrame || document.hidden) return;
    visualizerAnimationFrame = requestAnimationFrame(drawVisualizer);
  }

  function stopVisualizer() {
    if (visualizerAnimationFrame) cancelAnimationFrame(visualizerAnimationFrame);
    visualizerAnimationFrame = 0;
  }

  async function feedTrack(index) {
    if (!petApi || isConsumed(index)) return;
    const track = tracks[index];
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
    const wasPlaying = !audio.paused;
    renderPlaylist();
    if (allTracksConsumed) {
      loadTrack(currentIndex, false);
      return;
    }
    if (isConsumed(currentIndex)) {
      loadTrack(currentIndex + 1, wasPlaying);
    } else {
      updatePlaylistSelection();
    }
  }

  playlist.addEventListener("click", (event) => {
    const feedButton = event.target.closest("[data-feed-index]");
    if (feedButton) {
      feedTrack(Number(feedButton.dataset.feedIndex));
      return;
    }
    const button = event.target.closest("[data-track-index]");
    if (!button) return;
    loadTrack(Number(button.dataset.trackIndex), true);
  });

  lyricsBox.addEventListener("click", (event) => {
    const line = event.target.closest("[data-lyric-index]");
    if (!line) return;
    const targetTime = currentLyrics[Number(line.dataset.lyricIndex)].time;
    if (audio.hasAttribute("src")) {
      audio.currentTime = targetTime;
    } else {
      pendingStartTime = targetTime;
    }
    playCurrent();
  });

  playButton.addEventListener("click", togglePlayback);
  previousButton.addEventListener("click", () => loadTrack(currentIndex - 1, true, 0, -1));
  nextButton.addEventListener("click", () => loadTrack(currentIndex + 1, true));
  feedCurrentButton?.addEventListener("click", () => feedTrack(currentIndex));

  seekSlider.addEventListener("input", () => {
    if (!Number.isFinite(audio.duration)) return;
    audio.currentTime = (Number(seekSlider.value) / 1000) * audio.duration;
    saveSharedState();
  });

  volumeSlider.addEventListener("input", () => {
    audio.volume = Number(volumeSlider.value);
    audio.muted = audio.volume === 0;
  });

  muteButton.addEventListener("click", () => {
    audio.muted = !audio.muted;
  });

  audio.addEventListener("loadedmetadata", () => {
    durationLabel.textContent = formatTime(audio.duration);
  });

  audio.addEventListener("timeupdate", () => {
    currentTimeLabel.textContent = formatTime(audio.currentTime);
    if (Number.isFinite(audio.duration)) {
      seekSlider.value = String(Math.round((audio.currentTime / audio.duration) * 1000));
    }
    syncLyrics();

    if (Date.now() - lastSharedStateSave > 1000) {
      lastSharedStateSave = Date.now();
      saveSharedState();
    }
  });

  audio.addEventListener("play", () => {
    playButton.textContent = "Ⅱ";
    playButton.setAttribute("aria-label", "暂停");
    playButton.title = "暂停";
    playerStatus.textContent = `正在播放 ${tracks[currentIndex].title}`;
    updatePlaylistSelection();
    setPageCover(true);
    saveSharedState(true);
    startVisualizer();

    setTimeout(() => {
      connectAnalyser();
      if (spectrumMode === "unavailable") {
        playerStatus.textContent = `正在播放 ${tracks[currentIndex].title}，当前浏览器的本地文件模式不支持频谱`;
      }
    }, 0);

    setTimeout(connectAnalyser, 250);
  });

  audio.addEventListener("pause", () => {
    playButton.textContent = "▶";
    playButton.setAttribute("aria-label", "播放");
    playButton.title = "播放";
    if (!audio.ended) playerStatus.textContent = `已暂停 ${tracks[currentIndex].title}`;
    stopVisualizer();
    setPageCover(false);
    saveSharedState(false);
  });

  audio.addEventListener("volumechange", () => {
    muteButton.textContent = audio.muted || audio.volume === 0 ? "🔇" : "🔊";
    muteButton.setAttribute("aria-label", audio.muted ? "取消静音" : "静音");
    muteButton.title = audio.muted ? "取消静音" : "静音";
    saveSharedState();
  });

  audio.addEventListener("ended", () => loadTrack(currentIndex + 1, true));
  audio.addEventListener("error", () => {
    playerStatus.textContent = "音频加载失败，请检查 music 文件夹中的文件";
    setPageCover(false);
  });

  cover.addEventListener("error", () => {
    cover.src = "assets/hero-glass-garden.png";
  });

  window.addEventListener("pagehide", () => saveSharedState(!audio.paused));
  document.addEventListener("visibilitychange", () => {
    if (document.hidden || audio.paused) {
      stopVisualizer();
    } else {
      startVisualizer();
    }
  });
  window.addEventListener("storage", (event) => {
    if (event.key === petApi?.keys.consumedTracks) refreshConsumedTracks();
  });
  window.addEventListener("beiai:pet-change", (event) => {
    if (event.detail?.type === "consumed" || event.detail?.type === "debug-reset") refreshConsumedTracks();
  });

  if ("mediaSession" in navigator) {
    const mediaActions = {
      play: playCurrent,
      pause: () => audio.pause(),
      previoustrack: () => loadTrack(currentIndex - 1, true, 0, -1),
      nexttrack: () => loadTrack(currentIndex + 1, true)
    };

    Object.entries(mediaActions).forEach(([action, handler]) => {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch (error) {
        // Some browsers expose Media Session but omit individual actions.
      }
    });
  }

  const sharedState = loadSharedState();
  const sharedIndex = Number.isInteger(sharedState?.trackIndex) ? sharedState.trackIndex : 0;
  const sharedVolume = Number.isFinite(sharedState?.volume)
    ? Math.max(0, Math.min(sharedState.volume, 1))
    : Number(volumeSlider.value);
  const resumeTime = Math.max(0, Number(sharedState?.currentTime) || 0);

  audio.volume = sharedVolume;
  volumeSlider.value = String(sharedVolume);
  renderPlaylist();
  loadTrack(sharedIndex, false, resumeTime, 1, true);
  resizeCanvas();
  drawVisualizer();

  if (typeof ResizeObserver !== "undefined") {
    new ResizeObserver(resizeCanvas).observe(canvas);
  } else {
    window.addEventListener("resize", resizeCanvas);
  }
})();
