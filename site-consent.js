(() => {
  const STORAGE_KEY = "beiaiSiteDisclosureAccepted";
  const REQUIRED_TEXT = "我同意";

  try {
    if (localStorage.getItem(STORAGE_KEY) === "1") return;
  } catch (error) {
    // The notice will appear again next visit if storage is unavailable.
  }

  document.documentElement.classList.add("consent-pending");

  function showConsentNotice() {
    if (document.querySelector(".site-consent-overlay")) return;

    const overlay = document.createElement("div");
    overlay.className = "site-consent-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-labelledby", "siteConsentTitle");
    overlay.innerHTML = `
      <div class="site-consent-dialog">
        <div class="site-consent-code">ACCESS NOTICE // CONFIDENTIAL EXPLORATION</div>
        <h1 id="siteConsentTitle">访问与保密告知</h1>
        <p class="site-consent-device-notice"><strong>⚠ 强烈建议使用电脑并开启 VPN 浏览本站</strong><span>电脑端可获得更完整的页面效果；部分外部资源在当前网络环境下可能无法正常访问。</span></p>
        <p>本网站包含需要访问者独立探索的谜题、解密流程及受保护内容。为维护每位访问者完整、公平的体验，请在进入网站前阅读并确认以下约定：</p>
        <ol class="site-consent-terms">
          <li>禁止在评论区、贴吧、论坛、社交媒体及其他任何公开平台披露、转述或暗示本站的解密过程、谜题答案与解锁后内容。</li>
          <li>禁止以截图、录屏、文字整理、答案汇总或其他形式公开传播可能破坏他人探索体验的信息。</li>
          <li>如需交流，请主动回避关键线索与答案，并尊重尚未完成探索的访问者。</li>
        </ol>
        <p class="site-consent-confirmation">继续访问即表示你已阅读、理解并同意遵守上述约定。请在下方输入“我同意”。</p>
        <form class="site-consent-form">
          <label for="siteConsentInput">确认文字</label>
          <div class="site-consent-controls">
            <input id="siteConsentInput" type="text" autocomplete="off" spellcheck="false" placeholder="请输入：我同意" />
            <button type="submit" disabled>确认并进入</button>
          </div>
          <p class="site-consent-error" aria-live="polite"></p>
        </form>
      </div>
    `;

    document.body.appendChild(overlay);

    const backgroundElements = Array.from(document.body.children).filter((element) => element !== overlay);
    backgroundElements.forEach((element) => {
      element.inert = true;
      element.dataset.consentInert = "true";
    });

    const form = overlay.querySelector(".site-consent-form");
    const input = overlay.querySelector("#siteConsentInput");
    const button = form.querySelector('button[type="submit"]');
    const errorMessage = overlay.querySelector(".site-consent-error");

    function isAcceptedText() {
      return input.value.trim() === REQUIRED_TEXT;
    }

    input.addEventListener("input", () => {
      button.disabled = !isAcceptedText();
      errorMessage.textContent = "";
      overlay.classList.remove("has-error");
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!isAcceptedText()) {
        errorMessage.textContent = "确认文字不匹配，请输入“我同意”。";
        overlay.classList.remove("has-error");
        void overlay.offsetWidth;
        overlay.classList.add("has-error");
        input.focus();
        return;
      }

      try {
        localStorage.setItem(STORAGE_KEY, "1");
      } catch (error) {
        // Continue into the site even if the browser blocks storage.
      }

      button.disabled = true;
      button.textContent = "正在进入";
      backgroundElements.forEach((element) => {
        if (element.dataset.consentInert === "true") {
          element.inert = false;
          delete element.dataset.consentInert;
        }
      });
      document.documentElement.classList.remove("consent-pending");
      overlay.classList.add("is-leaving");
      window.setTimeout(() => overlay.remove(), 620);
    });

    window.requestAnimationFrame(() => {
      overlay.classList.add("is-visible");
      input.focus({ preventScroll: true });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", showConsentNotice, { once: true });
  } else {
    showConsentNotice();
  }
})();
