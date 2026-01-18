/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./src/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./app/**/*.{js,ts,jsx,tsx}"
    ],
    theme: {
        extend: {},
    },
    plugins: [],
    safelist: [{
            pattern: /bg-\[var\(--.*?\)\]/,
        },
        {
            pattern: /text-\[var\(--.*?\)\]/,
        },
        {
            pattern: /border-\[var\(--.*?\)\]/,
        },
    ],
    future: {
        hoverOnlyWhenSupported: true,
    },
    experimental: {
        optimizeUniversalDefaults: true,
    },
};