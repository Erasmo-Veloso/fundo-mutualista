import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          50: "#E1F5EE",
          400: "#1D9E75",
          600: "#0F6E56",
          800: "#085041",
        },
        accent: {
          50: "#FAEEDA",
          400: "#EF9F27",
          600: "#BA7517",
          800: "#633806",
        },
        purple: {
          50: "#EEEDFE",
          400: "#7F77DD",
          600: "#534AB7",
          800: "#3C3489",
        },
        gray: {
          50: "#F1EFE8",
          400: "#888780",
          600: "#5F5E5A",
          800: "#444441",
        },
      },
    },
  },
  plugins: [],
};
export default config;
