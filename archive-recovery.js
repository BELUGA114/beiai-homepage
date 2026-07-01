(() => {
  const petApi = window.BEIAI_PET;
  const meter = document.querySelector("[data-archive-meter]");
  const bar = document.querySelector("[data-archive-bar]");
  const count = document.querySelector("[data-archive-count]");
  const status = document.querySelector("[data-archive-status]");
  const restoreButton = document.querySelector("[data-archive-restore]");
  const enterLink = document.querySelector("[data-archive-enter]");
  const online = document.querySelector("[data-archive-online]");

  if (!petApi || !meter || !restoreButton) return;

  const progress = petApi.getMusicProgress();
  const complete = petApi.isEndingUnlocked() && progress.complete;
  const restored = petApi.isTalkRestored();
  const percentage = progress.total ? (progress.consumed / progress.total) * 100 : 0;

  meter.setAttribute("aria-valuemax", String(progress.total));
  meter.setAttribute("aria-valuenow", String(progress.consumed));
  bar.style.width = `${percentage}%`;
  count.textContent = `${progress.consumed} / ${progress.total}`;
  online.textContent = complete ? "ACCESS GRANTED" : "ACCESS DENIED";

  if (!complete) {
    status.textContent = "档案不完整。宠物仍然缺少音乐组织。";
    return;
  }

  restoreButton.disabled = restored;
  if (restored) {
    status.textContent = "杂谈页文字层已经复原。";
    restoreButton.textContent = "RESTORED";
    enterLink.hidden = false;
  } else {
    status.textContent = "检测到完整的 38 / 38 音乐组织。可以执行复原。";
  }

  restoreButton.addEventListener("click", () => {
    if (!petApi.restoreTalk()) {
      status.textContent = "写入失败：浏览器阻止了 localStorage。";
      return;
    }

    restoreButton.disabled = true;
    restoreButton.textContent = "RESTORING...";
    document.body.classList.add("archive-restoring");
    status.textContent = "正在从噪声中提取原始文字...";

    window.setTimeout(() => {
      restoreButton.textContent = "RESTORED";
      status.textContent = "杂谈页文字层已经复原。";
      enterLink.hidden = false;
      enterLink.focus();
    }, 1500);
  });
})();
