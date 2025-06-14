'use client';

import dynamic from 'next/dynamic';

// Importar o componente de verificação de versão dinamicamente para evitar problemas com SSR
const VersionChecker = dynamic(
    () => import('@/components/version-checker'),
    { ssr: false }
);

export default function VersionCheckerWrapper() {
    return <VersionChecker />;
}
