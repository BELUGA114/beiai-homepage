(() => {
  const petApi = window.BEIAI_PET;
  const SLOT_COST = 5;
  const slotIcons = ["☆", "♥", "7", "●", "★", "♦"];
  const reels = Array.from(document.querySelectorAll("[data-slot-reel]"));
  const slotButton = document.querySelector("[data-slot-start]");
  const slotResult = document.querySelector("[data-slot-result]");
  const coinsValue = document.querySelector("[data-slot-coins]");

  if (!petApi || reels.length !== 3 || !slotButton) return;

  let state = petApi.getPetState();
  let spinning = false;

  function randomItem(items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  function render() {
    coinsValue.textContent = String(state.coins);
  }

  function save(message) {
    if (message) state.message = message;
    state = petApi.savePetState(state);
    render();
  }

  function finishSlot(results) {
    const uniqueCount = new Set(results).size;
    let reward = 0;

    if (uniqueCount === 1) {
      reward = 30;
      slotResult.textContent = "JACKPOT! 三个相同，奖励 30 coins!";
      state.message = "JACKPOT!!! 今天的网络运气很好！";
    } else if (uniqueCount === 2) {
      reward = 8;
      slotResult.textContent = "PAIR! 两个相同，奖励 8 coins!";
      state.message = "中了两个一样的，有一点点幸运。";
    } else {
      slotResult.textContent = "MISS... 本次消耗 5 coins。";
      state.message = "这次没有中奖，再来一次吗？";
    }

    state.coins += reward;
    spinning = false;
    slotButton.disabled = false;
    save();
  }

  function startSlot() {
    if (spinning) return;
    state = petApi.getPetState();
    if (state.coins < SLOT_COST) {
      slotResult.textContent = "需要至少 5 coins 才能启动。";
      state.message = "金币不足，老虎机拒绝启动。";
      save();
      return;
    }

    spinning = true;
    state.coins -= SLOT_COST;
    state.message = "SLOT MINI GAME 正在高速运转...";
    save();
    slotButton.disabled = true;
    slotResult.textContent = "ROLLING... ☆ ♥ 7 ● ★ ♦";

    const results = reels.map(() => randomItem(slotIcons));
    const stopTimes = [800, 1200, 1600];

    reels.forEach((reel, index) => {
      reel.classList.add("rolling");
      const interval = window.setInterval(() => {
        reel.textContent = randomItem(slotIcons);
      }, 70 + index * 9);

      window.setTimeout(() => {
        window.clearInterval(interval);
        reel.textContent = results[index];
        reel.classList.remove("rolling");
        if (index === reels.length - 1) finishSlot(results);
      }, stopTimes[index]);
    });
  }

  slotButton.addEventListener("click", startSlot);
  window.addEventListener("storage", (event) => {
    if (event.key !== petApi.keys.petState) return;
    state = petApi.getPetState();
    render();
  });
  window.addEventListener("beiai:pet-change", (event) => {
    if (event.detail?.type !== "state" || spinning) return;
    state = petApi.getPetState();
    render();
  });

  render();
})();
