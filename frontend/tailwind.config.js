/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'app-bg': '#0B0E14',
                'sidebar-bg': '#111625',
                'card-bg': '#161b2e',
                'hover-bg': '#1e253d',
                'input-bg': '#0f141f',
                'primary': '#135bec',
                'primary-hover': '#1d65f0',
                'border-subtle': '#1f2937',
            },
            fontFamily: {
                'sans': ['Manrope', 'system-ui', 'sans-serif'],
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
            animation: {
                fadeIn: 'fadeIn 0.4s ease-out forwards',
            },
        },
    },
    plugins: [],
}
