// ============================================
// Keep-Alive Pinger
// ============================================

const INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

let intervalId = null;

export function startKeepAlive() {
  // Only enable in production — no need locally
  if (process.env.NODE_ENV !== "production") {
    console.log("⏭️  Keep-alive skipped (not production)");
    return;
  }

  const url = process.env.BACKEND_URL;

  if (!url) {
    console.log("⚠️ Keep-alive skipped: BACKEND_URL not set");
    return;
  }

  const pingUrl = `${url}/api/health`;

  console.log(`🏓 Keep-alive started → pinging ${pingUrl} every 5 minutes`);

  intervalId = setInterval(async () => {
    try {
      const res = await fetch(pingUrl);
      console.log(
        `🏓 Keep-alive ping: ${res.status} at ${new Date().toLocaleTimeString()}`,
      );
    } catch (err) {
      console.error("🏓 Keep-alive ping failed:", err.message);
    }
  }, INTERVAL_MS);
}

export function stopKeepAlive() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log("🏓 Keep-alive stopped");
  }
}
