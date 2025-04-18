import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['"Varela Round"', "sans-serif"],
            },
            screens: {
                'xs': '640px',
                'desktop': '1024px',
            },
        },
    },
    plugins: [forms],
};