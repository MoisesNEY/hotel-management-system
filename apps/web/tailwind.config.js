/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}"
    ],
    theme: {
        extend: {
            colors: {
                gold: {
                    DEFAULT: '#d4af37',
                    light: '#e5c158',
                    dark: '#b39226',
                },
                navy: {
                    DEFAULT: '#0a143c',
                    light: '#1a296b',
                    dark: '#050a1f',
                },
                dark: '#2c3e50',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                serif: ['Playfair Display', 'serif'],
            }
        },
    },
    plugins: [],
}