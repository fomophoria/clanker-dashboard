import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: "class", // ✅ must be a string, not an array
    content: [
        "./app/**/*.{ts,tsx}",
        "./components/**/*.{ts,tsx}",
    ],
    theme: {
        extend: {},
    },
    plugins: [
        require("tailwindcss-animate"),
    ],
};

export default config;
