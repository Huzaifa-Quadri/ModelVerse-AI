import React from "react";

/**
 * LoadingScreen — Full-screen animated loading indicator
 *
 * Features a glowing infinity-loop helix animation that winds and
 * unwinds, inspired by flowing energy coils. Used as a splash screen
 * while the app checks authentication state on first load.
 */
const LoadingScreen = () => {
  return (
    <div style={styles.container}>
      {/* Background ambient glow */}
      <div style={styles.ambientGlow} />

      {/* Main helix animation */}
      <div style={styles.helixWrapper}>
        <svg
          viewBox="0 0 200 280"
          width="160"
          height="220"
          style={styles.svg}
        >
          <defs>
            <linearGradient id="helixGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00ffcc" />
              <stop offset="50%" stopColor="#00aaff" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
            <linearGradient id="helixGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#7c3aed" />
              <stop offset="50%" stopColor="#00aaff" />
              <stop offset="100%" stopColor="#00ffcc" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="softGlow">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Strand 1 — winds down */}
          <path
            d="M 40,30 C 160,30 160,70 40,70 C -80,70 160,110 40,110 C -80,110 160,150 40,150 C -80,150 160,190 40,190 C -80,190 160,230 40,230 C -80,230 160,270 40,270"
            fill="none"
            stroke="url(#helixGrad1)"
            strokeWidth="4"
            strokeLinecap="round"
            filter="url(#softGlow)"
            style={{
              strokeDasharray: "1200",
              strokeDashoffset: "0",
              animation: "windStrand1 3s ease-in-out infinite alternate",
            }}
          />

          {/* Strand 2 — winds opposite */}
          <path
            d="M 160,30 C 40,30 40,70 160,70 C 280,70 40,110 160,110 C 280,110 40,150 160,150 C 280,150 40,190 160,190 C 280,190 40,230 160,230 C 280,230 40,270 160,270"
            fill="none"
            stroke="url(#helixGrad2)"
            strokeWidth="4"
            strokeLinecap="round"
            filter="url(#softGlow)"
            style={{
              strokeDasharray: "1200",
              strokeDashoffset: "0",
              animation: "windStrand2 3s ease-in-out infinite alternate",
            }}
          />

          {/* Glowing orbs at intersections */}
          {[50, 110, 170, 230].map((cy, i) => (
            <circle
              key={i}
              cx="100"
              cy={cy}
              r="5"
              fill="#00ddff"
              filter="url(#glow)"
              style={{
                animation: `orbPulse 2s ease-in-out ${i * 0.3}s infinite`,
              }}
            />
          ))}
        </svg>
      </div>

      {/* Brand text */}
      <div style={styles.brandText}>ModelVerse</div>
      <div style={styles.subText}>Initializing AI systems...</div>

      {/* Animated dots */}
      <div style={styles.dotsContainer}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              ...styles.dot,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>

      {/* Injected CSS animations */}
      <style>{`
        @keyframes windStrand1 {
          0% {
            stroke-dashoffset: 0;
            opacity: 0.6;
          }
          50% {
            stroke-dashoffset: 400;
            opacity: 1;
          }
          100% {
            stroke-dashoffset: 800;
            opacity: 0.6;
          }
        }

        @keyframes windStrand2 {
          0% {
            stroke-dashoffset: 800;
            opacity: 0.6;
          }
          50% {
            stroke-dashoffset: 400;
            opacity: 1;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 0.6;
          }
        }

        @keyframes orbPulse {
          0%, 100% {
            r: 3;
            opacity: 0.4;
          }
          50% {
            r: 7;
            opacity: 1;
          }
        }

        @keyframes dotBounce {
          0%, 80%, 100% {
            transform: scale(0.6);
            opacity: 0.3;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes ambientPulse {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.15;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 0.25;
          }
        }

        @keyframes helixSpin {
          from { transform: rotateY(0deg); }
          to { transform: rotateY(360deg); }
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    position: "fixed",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "#0a0a0f",
    zIndex: 9999,
    overflow: "hidden",
  },
  ambientGlow: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: "400px",
    height: "400px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(0,170,255,0.2) 0%, rgba(124,58,237,0.1) 40%, transparent 70%)",
    animation: "ambientPulse 4s ease-in-out infinite",
    transform: "translate(-50%, -50%)",
    pointerEvents: "none",
  },
  helixWrapper: {
    perspective: "600px",
    animation: "helixSpin 8s linear infinite",
    marginBottom: "2rem",
  },
  svg: {
    display: "block",
  },
  brandText: {
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    fontSize: "1.8rem",
    fontWeight: 700,
    background: "linear-gradient(135deg, #00ffcc, #00aaff, #7c3aed)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    letterSpacing: "0.05em",
    animation: "fadeInUp 0.8s ease-out",
    marginBottom: "0.5rem",
  },
  subText: {
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    fontSize: "0.85rem",
    color: "rgba(255,255,255,0.35)",
    letterSpacing: "0.1em",
    animation: "fadeInUp 0.8s 0.3s ease-out both",
    marginBottom: "1.5rem",
  },
  dotsContainer: {
    display: "flex",
    gap: "8px",
    animation: "fadeInUp 0.8s 0.5s ease-out both",
  },
  dot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#00aaff",
    animation: "dotBounce 1.4s ease-in-out infinite",
  },
};

export default LoadingScreen;
