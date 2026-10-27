'use client';

import { Input } from '@/components/ui/input';
import { BRANDS } from '@/lib/domain/constants';

/** Free-text brand input with suggestions from the reference brand list. */
export function BrandInput({
  id,
  value,
  onChange,
  placeholder = 'es. Nike',
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <>
      <Input
        id={id}
        list={`${id}-brands`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        maxLength={60}
      />
      <datalist id={`${id}-brands`}>
        {BRANDS.map((b) => (
          <option key={b.name} value={b.name} />
        ))}
      </datalist>
    </>
  );
}
