import type { Config } from 'tailwindcss';

const config: Config = {
    content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './data/**/*.ts', './lib/**/*.ts'],
    theme: {
        container: {
            center: true,
            padding: { DEFAULT: '1.25rem', sm: '1.5rem', lg: '2.5rem' },
            screens: { '2xl': '1320px' }
        },
        extend: {
            colors: {
                cream: '#F7F4EF',
                sand: { DEFAULT: '#EEE8DF', deep: '#E4DCD0' },
                ink: { DEFAULT: '#292A27', soft: '#55574F' },
                sage: { DEFAULT: '#788879', light: '#C5CEC3', pale: '#DDE3DA' },
                forest: { DEFAULT: '#44564B', deep: '#37463D' },
                clay: { DEFAULT: '#B89D83', dark: '#7D6049', light: '#E3D5C6' }
            },
            fontFamily: {
                serif: ['var(--font-serif)', 'Georgia', 'serif'],
                sans: ['var(--font-sans)', 'system-ui', 'sans-serif']
            },
            fontSize: {
                eyebrow: ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.18em' }]
            },
            maxWidth: {
                prose: '36rem'
            },
            transitionTimingFunction: {
                gentle: 'cubic-bezier(0.22, 1, 0.36, 1)'
            },
            keyframes: {
                rise: {
                    from: { transform: 'translateY(12px)' },
                    to: { transform: 'translateY(0)' }
                },
                'fade-up': {
                    from: { opacity: '0', transform: 'translateY(14px)' },
                    to: { opacity: '1', transform: 'translateY(0)' }
                }
            },
            animation: {
                'fade-up': 'fade-up 600ms cubic-bezier(0.22, 1, 0.36, 1) both',
                rise: 'rise 700ms cubic-bezier(0.22, 1, 0.36, 1) both'
            }
        }
    },
    plugins: []
};

export default config;
