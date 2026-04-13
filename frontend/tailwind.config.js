/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        agentDark: "#0B0C10",
        agentGray: "#1F2833",
        agentLight: "#C5C6C7",
        agentCyan: "#66FCF1",
        agentTeal: "#45A29E"
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
