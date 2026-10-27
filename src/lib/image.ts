'use client';

import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES } from '@/lib/config';

export interface ProcessedImage {
  id: string;
  name: string;
  blob: Blob;
  /** Resized JPEG data URL – used for preview, local mode storage and AI analysis. */
  dataUrl: string;
  dominantColors: string[];
  width: number;
  height: number;
}

/** Checks the real file signature, not just the declared MIME type / extension. */
async function sniffMime(file: File): Promise<string | null> {
  const b = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg';
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return 'image/png';
  if (
    b[0] === 0x52 &&
    b[1] === 0x49 &&
    b[2] === 0x46 &&
    b[3] === 0x46 &&
    b[8] === 0x57 &&
    b[9] === 0x45 &&
    b[10] === 0x42 &&
    b[11] === 0x50
  )
    return 'image/webp';
  return null;
}

export async function validateImageFile(file: File): Promise<string | null> {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type))
    return `${file.name}: formato non supportato (usa JPG, PNG o WEBP).`;
  if (file.size > MAX_IMAGE_BYTES)
    return `${file.name}: file troppo grande (max ${MAX_IMAGE_BYTES / 1024 / 1024} MB).`;
  if (file.size === 0) return `${file.name}: file vuoto.`;
  const real = await sniffMime(file);
  if (!real || !ALLOWED_IMAGE_TYPES.includes(real))
    return `${file.name}: il contenuto non è un’immagine valida.`;
  return null;
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Immagine non leggibile'));
    img.src = src;
  });
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h *= 60;
  return { h, s, l };
}

/** Maps an RGB colour to an Italian colour name used in listings. */
export function colorName(r: number, g: number, b: number): string {
  const { h, s, l } = rgbToHsl(r, g, b);
  if (l < 0.13) return 'nero';
  if (l > 0.88 && s < 0.25) return 'bianco';
  if (s < 0.12) return l > 0.75 ? 'bianco' : 'grigio';
  if (h >= 20 && h < 55 && s < 0.5 && l > 0.6) return 'beige';
  if (h >= 12 && h < 45 && l < 0.42) return 'marrone';
  if (h < 12 || h >= 345) return l < 0.3 ? 'bordeaux' : 'rosso';
  if (h < 40) return 'arancione';
  if (h < 65) return 'giallo';
  if (h < 170) return 'verde';
  if (h < 200) return 'azzurro';
  if (h < 250) return l < 0.28 ? 'blu navy' : 'blu';
  if (h < 290) return 'viola';
  return 'rosa';
}

/** Dominant colour names from the central area of the photo (where the garment usually is). */
function dominantColors(ctx: CanvasRenderingContext2D, w: number, h: number): string[] {
  const x0 = Math.floor(w * 0.2);
  const y0 = Math.floor(h * 0.2);
  const data = ctx.getImageData(
    x0,
    y0,
    Math.max(1, Math.floor(w * 0.6)),
    Math.max(1, Math.floor(h * 0.6)),
  ).data;
  const counts = new Map<string, number>();
  const step = Math.max(4, Math.floor(data.length / 4 / 4000)) * 4;
  for (let i = 0; i < data.length; i += step) {
    const name = colorName(data[i], data[i + 1], data[i + 2]);
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  const total = [...counts.values()].reduce((a, b) => a + b, 0);
  return [...counts.entries()]
    .filter(([, c]) => c / total > 0.12)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([n]) => n);
}

/** Resizes to max `maxSide` px, re-encodes as JPEG (strips EXIF/GPS metadata) and extracts colours. */
export async function processImage(file: File, maxSide = 1280, quality = 0.82): Promise<ProcessedImage> {
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.round(img.naturalWidth * scale);
    const h = Math.round(img.naturalHeight * scale);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    const colors = dominantColors(ctx, w, h);
    const dataUrl = canvas.toDataURL('image/jpeg', quality);
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('Conversione fallita'))),
        'image/jpeg',
        quality,
      ),
    );
    return {
      id: crypto.randomUUID(),
      name: file.name.replace(/\.[^.]+$/, '') + '.jpg',
      blob,
      dataUrl,
      dominantColors: colors,
      width: w,
      height: h,
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}
