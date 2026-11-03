'use client';

import { parseLabelText, type LabelReading } from '@/lib/marketplace/normalize';

/**
 * Reads the text of a clothing label photo in the browser (Tesseract.js, open source OCR).
 * The library and the language data are loaded on demand only when the user taps "Leggi etichetta":
 * no API key, and the photo never leaves the device.
 */
export async function readLabel(
  image: Blob | string,
  timeoutMs = 60_000,
): Promise<LabelReading & { text: string }> {
  const { createWorker } = await import('tesseract.js');
  const worker = await createWorker(['eng', 'ita']);
  try {
    const result = await Promise.race([
      worker.recognize(image),
      new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error('Lettura etichetta troppo lenta, riprova con una foto più nitida.')),
          timeoutMs,
        ),
      ),
    ]);
    const text = result.data.text ?? '';
    return { ...parseLabelText(text), text };
  } finally {
    void worker.terminate();
  }
}
