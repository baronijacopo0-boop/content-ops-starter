import type { CSSProperties } from 'react';
import type { ThemeName } from './types';

/**
 * Palette per anteprima. I valori sono terne RGB, lette da Tailwind come
 * rgb(var(--…) / alpha). Tutti gli accenti superano 4.5:1 su `paper`.
 */
type Palette = {
    paper: string;
    sand: string;
    ink: string;
    inkSoft: string;
    accent: string;
    accentDeep: string;
    accentPale: string;
    warm: string;
};

export const themes: Record<ThemeName, Palette> = {
    salvia: {
        paper: '247 244 239',
        sand: '238 232 223',
        ink: '41 42 39',
        inkSoft: '85 87 79',
        accent: '68 86 75',
        accentDeep: '55 70 61',
        accentPale: '221 227 218',
        warm: '184 157 131'
    },
    argilla: {
        paper: '249 244 238',
        sand: '242 230 218',
        ink: '46 37 32',
        inkSoft: '94 79 70',
        accent: '139 74 48',
        accentDeep: '110 57 36',
        accentPale: '240 222 208',
        warm: '201 160 120'
    },
    notte: {
        paper: '245 245 242',
        sand: '232 233 230',
        ink: '30 34 42',
        inkSoft: '78 84 96',
        accent: '44 62 92',
        accentDeep: '31 45 69',
        accentPale: '219 225 236',
        warm: '176 150 110'
    },
    lavanda: {
        paper: '248 246 247',
        sand: '237 233 238',
        ink: '40 36 46',
        inkSoft: '88 82 98',
        accent: '92 74 120',
        accentDeep: '72 57 96',
        accentPale: '230 224 238',
        warm: '196 160 150'
    },
    mare: {
        paper: '244 247 246',
        sand: '229 237 235',
        ink: '28 40 42',
        inkSoft: '74 90 92',
        accent: '30 96 104',
        accentDeep: '22 74 81',
        accentPale: '212 232 231',
        warm: '199 168 120'
    }
};

export function themeStyle(name: ThemeName): CSSProperties {
    const t = themes[name];
    return {
        '--paper': t.paper,
        '--sand': t.sand,
        '--ink': t.ink,
        '--ink-soft': t.inkSoft,
        '--accent': t.accent,
        '--accent-deep': t.accentDeep,
        '--accent-pale': t.accentPale,
        '--warm': t.warm
    } as CSSProperties;
}
