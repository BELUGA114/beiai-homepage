(() => {
  const counter = document.getElementById("visitorCounter");
  if (!counter) return;

  const COUNTER_ENDPOINT = "https://beiaichat-api.kathleenjacksonskjshsh.workers.dev/counter";

  async function loadVisitorCount() {
    try {
      const response = await fetch(COUNTER_ENDPOINT, {
        method: "GET",
        headers: {
          Accept: "application/json"
        },
        cache: "no-store"
      });
      const data = await response.json();

      if (!response.ok || data?.ok !== true || !Number.isFinite(data.count) || data.count < 0) {
        throw new Error("Invalid visitor counter response");
      }

      const count = Math.trunc(data.count);
      counter.textContent = String(count).padStart(6, "0");
    } catch (error) {
      counter.textContent = "ERROR";
      console.error("Visitor counter request failed:", error);
    }
  }

  loadVisitorCount();
})();
