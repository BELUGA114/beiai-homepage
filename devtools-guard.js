(() => {
  const params = new URLSearchParams(window.location.search);
  const root = document.documentElement;

  if (params.get("debug") === "1") return;
  if (root.classList.contains("compact-pet") || root.classList.contains("compact-slot")) return;

  const LOCK_SCREEN_ID = "devtoolsLockScreen";
  const WINDOW_GAP_THRESHOLD = 180;
  let locked = false;

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;"
    })[character]);
  }

  function pauseMedia() {
    document.querySelectorAll("audio, video").forEach((media) => {
      try {
        media.pause();
      } catch (error) {
        // A failed media pause must not prevent the lock screen.
      }
    });
  }

  function lockPage(reason = "DEVTOOLS PANEL DETECTED") {
    if (locked || document.getElementById(LOCK_SCREEN_ID)) return;
    const currentPage = window.location.pathname.split("/").pop().toLowerCase();
    if (["diary.html", "talk.html", "notice.html", "aichat.html"].includes(currentPage)) {
      window.BEIAI_ACHIEVEMENTS?.unlock(60);
    }
    locked = true;
    root.classList.add("devtools-locked");
    pauseMedia();

    const overlay = document.createElement("section");
    overlay.id = LOCK_SCREEN_ID;
    overlay.setAttribute("role", "alertdialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-labelledby", "devtoolsLockTitle");
    overlay.innerHTML = `
      <div class="devtools-lock-window">
        <div class="devtools-lock-bar">ACCESS VIOLATION // beiai.exe</div>
        <div class="devtools-lock-body">
          <p class="devtools-lock-code">ERROR 0xF12 // OBSERVER TRACE FOUND</p>
          <h1 id="devtoolsLockTitle">页面已锁定</h1>
          <p>检测到异常观察行为。</p>
          <p class="devtools-lock-reason">REASON: ${escapeHtml(reason)}</p>
          <p>请关闭开发者工具并刷新页面。</p>
          <strong>▓▒░ archive sealed ░▒▓</strong>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    overlay.focus({ preventScroll: true });
  }

  function isBlockedShortcut(event) {
    const key = String(event.key || "").toLowerCase();
    const commandKey = event.ctrlKey || event.metaKey;

    if (event.key === "F12") return true;
    if (commandKey && event.shiftKey && ["i", "j", "c"].includes(key)) return true;
    return commandKey && !event.shiftKey && ["u", "s"].includes(key);
  }

  function handleKeydown(event) {
    if (!isBlockedShortcut(event)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    lockPage("DEVTOOLS PANEL DETECTED");
  }

  function isTouchContextMenu(event) {
    return Boolean(
      event.sourceCapabilities?.firesTouchEvents
      || window.matchMedia?.("(pointer: coarse)").matches
    );
  }

  function handleContextMenu(event) {
    if (isTouchContextMenu(event)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    lockPage("CONTEXT MENU ACCESS DETECTED");
  }

  function hasSuspiciousWindowGap() {
    if (locked || document.hidden) return false;
    if (window.matchMedia?.("(max-width: 767px), (pointer: coarse)").matches) return false;

    const outerWidth = Number(window.outerWidth);
    const outerHeight = Number(window.outerHeight);
    const innerWidth = Number(window.innerWidth);
    const innerHeight = Number(window.innerHeight);
    if (![outerWidth, outerHeight, innerWidth, innerHeight].every((value) => Number.isFinite(value) && value > 0)) {
      return false;
    }

    const widthGap = Math.max(0, outerWidth - innerWidth);
    const heightGap = Math.max(0, outerHeight - innerHeight);
    return widthGap > WINDOW_GAP_THRESHOLD || heightGap > WINDOW_GAP_THRESHOLD;
  }

  function checkWindowGap() {
    if (hasSuspiciousWindowGap()) lockPage("DEVTOOLS PANEL DETECTED");
  }

  document.addEventListener("keydown", handleKeydown, true);
  document.addEventListener("contextmenu", handleContextMenu, true);
  document.addEventListener("play", (event) => {
    if (locked && typeof event.target?.pause === "function") event.target.pause();
  }, true);

  window.setInterval(checkWindowGap, 800);
})();
