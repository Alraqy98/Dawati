import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["system-ui", "sans-serif"]
      },
      colors: {
        primary: {
          DEFAULT: "#0f766e"
        }
      }
    }
  },
  plugins: []
};

export default config;

