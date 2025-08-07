/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "rgba(226, 232, 240, 0.5)",
        input: "rgba(226, 232, 240, 0.5)",
        ring: "rgba(226, 232, 240, 0.5)",
        background: "rgb(255, 255, 255)",
        foreground: "rgb(15, 23, 42)",
        primary: {
          DEFAULT: "rgb(45, 212, 191)",
          foreground: "rgb(255, 255, 255)",
        },
        secondary: {
          DEFAULT: "rgb(99, 102, 241)",
          foreground: "rgb(255, 255, 255)",
        },
        muted: {
          DEFAULT: "rgb(100, 116, 139)",
          foreground: "rgb(148, 163, 184)",
        },
        accent: {
          DEFAULT: "rgb(244, 244, 245)",
          foreground: "rgb(15, 23, 42)",
        },
      },
      borderRadius: {
        lg: "var(--radius-lg)",
        md: "var(--radius-md)",
        sm: "var(--radius-sm)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        spotlight: {
          "0%": {
            opacity: 0,
            transform: "translate(-72%, -62%) scale(0.5)",
          },
          "100%": {
            opacity: 1,
            transform: "translate(-50%,-40%) scale(1)",
          },
        },
        shimmer: {
          from: { backgroundPosition: '200% 0' },
          to: { backgroundPosition: '-200% 0' },
        },
        scale: {
          from: { transform: 'scale(0.95)', opacity: 0 },
          to: { transform: 'scale(1)', opacity: 1 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        spotlight: "spotlight 2s ease .75s 1 forwards",
        float: "float 3s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
        scale: "scale 0.2s ease-out",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        'gradient-primary': 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
        'gradient-primary-light': 'linear-gradient(135deg, var(--primary-light) 0%, var(--secondary-light) 100%)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} 