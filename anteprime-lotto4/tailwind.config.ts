import type { Config } from 'tailwindcss';

// I colori arrivano da variabili CSS impostate per ogni anteprima (data/themes.ts)
const v = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
    content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
    theme: {
        container: {
            center: true,
            padding: { DEFAULT: '1.25rem', sm: '1.5rem', lg: '2.5rem' },
            screens: { '2xl': '1240px' }
        },
        extend: {
            colors: {
                paper: v('paper'),
                sand: v('sand'),
                ink: { DEFAULT: v('ink'), soft: v('ink-soft') },
                accent: { DEFAULT: v('accent'), deep: v('accent-deep'), pale: v('accent-pale') },
                warm: v('warm')
            },
            fontFamily: {
                serif: ['var(--font-serif)', 'Georgia', 'serif'],
                sans: ['var(--font-sans)', 'system-ui', 'sans-serif']
            },
            fontSize: {
                eyebrow: ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.18em' }]
            },
            transitionTimingFunction: {
                gentle: 'cubic-bezier(0.22, 1, 0.36, 1)'
            },
            keyframes: {
                'fade-up': {
                    from: { opacity: '0', transform: 'translateY(14px)' },
                    to: { opacity: '1', transform: 'translateY(0)' }
                }
            },
            animation: {
                'fade-up': 'fade-up 600ms cubic-bezier(0.22, 1, 0.36, 1) both'
            }
        }
    },
    plugins: []
};

export default config;
