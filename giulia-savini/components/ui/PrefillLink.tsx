'use client';

import type { ComponentProps } from 'react';
import { ButtonLink } from './Button';

export type ContactMode = 'studio' | 'online';
export const PREFILL_EVENT = 'contact:prefill';

/** CTA che porta al form contatti preselezionando la modalità (studio/online). */
export function PrefillLink({ mode, ...props }: { mode: ContactMode } & Omit<ComponentProps<typeof ButtonLink>, 'href'>) {
    return (
        <ButtonLink
            {...props}
            href={`/?modalita=${mode}#contatti`}
            onClick={() => {
                window.dispatchEvent(new CustomEvent<ContactMode>(PREFILL_EVENT, { detail: mode }));
            }}
        />
    );
}
