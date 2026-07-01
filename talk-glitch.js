(() => {
  const root = document.querySelector(".site");
  if (!root) return;

  if (window.BEIAI_PET?.isTalkRestored()) {
    document.body.classList.remove("talk-corruption");
    document.body.classList.add("talk-restored");
    root.classList.add("talk-restore-reveal");
    window.setTimeout(() => root.classList.remove("talk-restore-reveal"), 1400);
    return;
  }

  const latinNoise = "01ABCDEF#$%?/\\[]{}<>_-+=*";
  const hanNoise = "锟斤拷烫屯汞咣铪钴铯锕锘尢屮丌乇仝彳忄礻糸譁縺蜿髫隕亂碼";
  const symbolNoise = "※▓▒░◆◇◎●◌⌁⌇⌗╳┼┤├┬┴�";
  const textNodes = [];

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      const parent = node.parentElement;
      if (!parent || parent.closest("script, style, noscript")) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    }
  });

  while (walker.nextNode()) {
    textNodes.push({ node: walker.currentNode, value: walker.currentNode.nodeValue });
  }

  const pick = (pool) => pool[Math.floor(Math.random() * pool.length)];

  function corruptCharacter(character) {
    if (/\s/.test(character)) return character;
    if (/[\u3400-\u9fff]/.test(character)) return pick(hanNoise);
    if (/[a-z0-9]/i.test(character)) {
      return Math.random() < 0.35 ? pick(hanNoise) : pick(latinNoise);
    }
    return pick(symbolNoise);
  }

  function corruptText(value) {
    return Array.from(value, corruptCharacter).join("");
  }

  function updateNoise() {
    for (const item of textNodes) {
      item.node.nodeValue = corruptText(item.value);
    }
    root.style.setProperty("--talk-shift", `${Math.floor(Math.random() * 5) - 2}px`);
  }

  updateNoise();
  window.setInterval(updateNoise, 110);

  const originalTitle = document.title;
  window.setInterval(() => {
    document.title = corruptText(originalTitle);
  }, 280);
})();
