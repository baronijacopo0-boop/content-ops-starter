'use client';

import { useRef, useState } from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { MAX_IMAGES } from '@/lib/config';
import { processImage, validateImageFile, type ProcessedImage } from '@/lib/image';
import { cn } from '@/lib/utils';

/**
 * Drag & drop / tap uploader with client-side validation (MIME + magic bytes + size),
 * resize & JPEG re-encoding (also strips EXIF/GPS) and preview grid.
 */
export function ImageUploader({
  images,
  onChange,
  max = MAX_IMAGES,
  compact = false,
}: {
  images: ProcessedImage[];
  onChange: (imgs: ProcessedImage[]) => void;
  max?: number;
  compact?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);

  async function handle(files: FileList | File[]) {
    const list = Array.from(files);
    const room = max - images.length;
    if (room <= 0) return toast.error(`Puoi caricare al massimo ${max} foto.`);
    if (list.length > room) toast.warning(`Solo le prime ${room} foto sono state aggiunte (max ${max}).`);
    setBusy(true);
    const added: ProcessedImage[] = [];
    for (const file of list.slice(0, room)) {
      const err = await validateImageFile(file);
      if (err) {
        toast.error(err);
        continue;
      }
      try {
        added.push(await processImage(file));
      } catch {
        toast.error(`${file.name}: impossibile elaborare l’immagine.`);
      }
    }
    setBusy(false);
    if (added.length) onChange([...images, ...added]);
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          void handle(e.dataTransfer.files);
        }}
        disabled={busy || images.length >= max}
        className={cn(
          'flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed bg-muted/20 px-4 text-center transition hover:border-primary/50 hover:bg-primary/5 disabled:opacity-60',
          compact ? 'py-5' : 'py-10',
          drag && 'border-primary bg-primary/10',
        )}
      >
        {busy ? (
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        ) : (
          <ImagePlus className="h-6 w-6 text-primary" />
        )}
        <span className="text-sm font-semibold">{busy ? 'Elaboro le foto…' : 'Carica foto'}</span>
        <span className="text-xs text-muted-foreground">
          JPG, PNG o WEBP · max 5 MB · {images.length}/{max} foto
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        data-testid="image-input"
        onChange={(e) => {
          if (e.target.files) void handle(e.target.files);
          e.target.value = '';
        }}
      />
      {images.length > 0 && (
        <ul className="grid grid-cols-4 gap-2 sm:grid-cols-8">
          {images.map((img, i) => (
            <li
              key={img.id}
              className="group relative aspect-square overflow-hidden rounded-xl border bg-muted"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.dataUrl} alt={`Foto ${i + 1}`} className="h-full w-full object-cover" />
              {i === 0 && (
                <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1 text-[9px] font-semibold">
                  COPERTINA
                </span>
              )}
              <button
                type="button"
                onClick={() => onChange(images.filter((x) => x.id !== img.id))}
                className="absolute right-1 top-1 rounded-full bg-black/70 p-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100"
                aria-label={`Rimuovi foto ${i + 1}`}
              >
                <X className="h-3 w-3" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
