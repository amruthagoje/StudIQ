/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        pixel: ['"Press Start 2P"', "monospace"],
        body: ['"DM Sans"', "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      colors: {
        bg: "#0d0d14",
        surface: "#13131f",
        card: "#1a1a2e",
        border: "#2a2a45",
        accent: "#7c3aed",
        accent2: "#06b6d4",
      },
      animation: {
        shimmer: "shimmer 2s linear infinite",
        bounce2: "bounce2 0.8s ease-in-out infinite",
        twinkle: "twinkle 2s ease-in-out infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        bounce2: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        twinkle: {
          "0%,100%": { opacity: 0.3, transform: "scale(0.8)" },
          "50%": { opacity: 1, transform: "scale(1.2)" },
        },
      },
    },
  },
  plugins: [],
};
