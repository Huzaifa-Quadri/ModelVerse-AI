const awakeAndChill = (hours, mins, secs) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>ModelVerse API</title>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          background: #0a0a0f;
          color: #00ff88;
          font-family: 'JetBrains Mono', monospace;
          display: flex; align-items: center; justify-content: center;
          min-height: 100vh;
          overflow: hidden;
        }
        .container {
          text-align: center;
          z-index: 2;
          position: relative;
        }
        .logo {
          font-size: 3rem;
          font-weight: 700;
          background: linear-gradient(135deg, #00ff88, #00d4ff, #7c3aed);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: glow 3s ease-in-out infinite alternate;
          margin-bottom: 1rem;
        }
        @keyframes glow {
          from { filter: drop-shadow(0 0 8px rgba(0, 255, 136, 0.4)); }
          to { filter: drop-shadow(0 0 20px rgba(0, 212, 255, 0.6)); }
        }
        .status {
          display: inline-block;
          padding: 0.5rem 1.5rem;
          border: 1px solid #00ff88;
          border-radius: 50px;
          font-size: 0.9rem;
          animation: pulse 2s infinite;
          margin-bottom: 2rem;
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 5px rgba(0,255,136,0.3); }
          50% { box-shadow: 0 0 20px rgba(0,255,136,0.6); }
        }
        .ascii-box {
          background: rgba(0,255,136,0.05);
          border: 1px solid rgba(0,255,136,0.15);
          border-radius: 12px;
          padding: 1.5rem 2rem;
          margin: 1.5rem auto;
          max-width: 500px;
          text-align: left;
          font-size: 0.8rem;
          line-height: 1.6;
        }
        .ascii-box .line { opacity: 0; animation: typeIn 0.4s forwards; }
        .ascii-box .line:nth-child(1) { animation-delay: 0.2s; }
        .ascii-box .line:nth-child(2) { animation-delay: 0.5s; }
        .ascii-box .line:nth-child(3) { animation-delay: 0.8s; }
        .ascii-box .line:nth-child(4) { animation-delay: 1.1s; }
        .ascii-box .line:nth-child(5) { animation-delay: 1.4s; }
        .ascii-box .line:nth-child(6) { animation-delay: 1.7s; }
        @keyframes typeIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .snark {
          margin-top: 2rem;
          font-size: 0.85rem;
          color: #7c3aed;
          font-style: italic;
          opacity: 0;
          animation: fadeIn 1s 2.2s forwards;
        }
        @keyframes fadeIn { to { opacity: 0.8; } }
        .val { color: #00d4ff; }
        .key { color: #ff6b9d; }
        canvas {
          position: fixed; top: 0; left: 0;
          width: 100vw; height: 100vh;
          z-index: 1; opacity: 0.15;
        }
      </style>
    </head>
    <body>
      <canvas id="matrix"></canvas>
      <div class="container">
        <div class="logo">⚡ ModelVerse AI</div>
        <div class="status">🟢 SYSTEMS OPERATIONAL</div>
        <div class="ascii-box">
          <div class="line"><span class="key">server</span>    → <span class="val">awake & dangerous</span></div>
          <div class="line"><span class="key">mood</span>      → <span class="val">caffeinated ☕</span></div>
          <div class="line"><span class="key">uptime</span>    → <span class="val">${hours}h ${mins}m ${secs}s</span></div>
          <div class="line"><span class="key">threats</span>   → <span class="val">0 (for now 😈)</span></div>
          <div class="line"><span class="key">api</span>       → <span class="val">/api/*</span></div>
          <div class="line"><span class="key">vibes</span>     → <span class="val">immaculate ✨</span></div>
        </div>
        <div class="snark" id="snark"></div>
      </div>
      <script>
        const snarks = [
          "You found the API. Now what? 🤔",
          "Nothing to see here... or is there? 👀",
          "I'm not saying I'm sentient, but I did choose this color scheme myself.",
          "Error 200: Everything is suspiciously fine.",
          "The server is alive. The server is always alive.",
          "Plot twist: the real API was the friends we made along the way.",
          "Fun fact: I've been awake for ${hours}h ${mins}m. Send coffee.",
          "You've reached the backend. Congrats, you're officially a hacker. 🕶️",
        ];
        document.getElementById("snark").textContent =
          snarks[Math.floor(Math.random() * snarks.length)];

        // Mini matrix rain
        const c = document.getElementById("matrix");
        const ctx = c.getContext("2d");
        c.width = window.innerWidth;
        c.height = window.innerHeight;
        const cols = Math.floor(c.width / 16);
        const drops = Array(cols).fill(1);
        function draw() {
          ctx.fillStyle = "rgba(10,10,15,0.05)";
          ctx.fillRect(0, 0, c.width, c.height);
          ctx.fillStyle = "#00ff8830";
          ctx.font = "14px monospace";
          for (let i = 0; i < drops.length; i++) {
            const t = String.fromCharCode(0x30A0 + Math.random() * 96);
            ctx.fillText(t, i * 16, drops[i] * 16);
            if (drops[i] * 16 > c.height && Math.random() > 0.975) drops[i] = 0;
            drops[i]++;
          }
        }
        setInterval(draw, 50);
      </script>
    </body>
    </html>
  `;
};

export default awakeAndChill;
