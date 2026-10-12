import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ImageResponse } from 'next/og';
import { profile } from '@/data/profile';

export const alt = `${profile.fullName} – ${profile.professionalTitle} a ${profile.address.city} e online`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpengraphImage() {
    const [regular, italic] = await Promise.all([
        readFile(path.join(process.cwd(), 'assets/CormorantGaramond-Medium.ttf')),
        readFile(path.join(process.cwd(), 'assets/CormorantGaramond-MediumItalic.ttf'))
    ]);

    return new ImageResponse(
        <div style={{ width: '100%', height: '100%', display: 'flex', background: '#F7F4EF', position: 'relative', fontFamily: 'Cormorant' }}>
            <div
                style={{
                    position: 'absolute',
                    right: -160,
                    top: -120,
                    width: 760,
                    height: 760,
                    borderRadius: 9999,
                    border: '1.5px solid rgba(184,157,131,0.45)',
                    display: 'flex'
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    right: -40,
                    top: 0,
                    width: 520,
                    height: 520,
                    borderRadius: 9999,
                    border: '1.5px solid rgba(184,157,131,0.45)',
                    display: 'flex'
                }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '72px 80px', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 18, color: '#44564B', fontSize: 26, letterSpacing: 5 }}>
                    <div style={{ width: 48, height: 2, background: '#B89D83', display: 'flex' }} />
                    PSICOLOGA · SESSUOLOGA CLINICA
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: 108, lineHeight: 1, color: '#292A27' }}>{profile.fullName}</div>
                    <div style={{ fontSize: 56, lineHeight: 1.2, marginTop: 24, color: '#44564B', fontStyle: 'italic' }}>
                        Uno spazio per ascoltarti, comprenderti e ritrovarti.
                    </div>
                </div>
                <div style={{ display: 'flex', fontSize: 30, color: '#55574F' }}>{profile.address.city} · Consulenze online</div>
            </div>
        </div>,
        {
            ...size,
            fonts: [
                { name: 'Cormorant', data: regular, style: 'normal', weight: 500 },
                { name: 'Cormorant', data: italic, style: 'italic', weight: 500 }
            ]
        }
    );
}
