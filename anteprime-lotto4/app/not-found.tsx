import Link from 'next/link';

export default function NotFound() {
    return (
        <main className="container py-24">
            <h1 className="h-section">Anteprima non trovata</h1>
            <Link href="/" className="mt-6 inline-block text-accent underline underline-offset-4">
                Torna all’elenco delle anteprime
            </Link>
        </main>
    );
}
