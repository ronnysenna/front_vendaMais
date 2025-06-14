// Este arquivo detecta automaticamente quando uma nova versão da aplicação está disponível
// e força um recarregamento da página se o usuário estiver usando uma versão desatualizada

'use client';

import { useEffect, useState } from 'react';

const BUILD_ID = process.env.NEXT_PUBLIC_BUILD_ID || Date.now().toString();

export default function VersionChecker() {
    const [shouldRefresh, setShouldRefresh] = useState(false);

    useEffect(() => {
        // Armazena o ID de build atual quando a página carrega
        if (typeof window !== 'undefined') {
            const storedBuildId = localStorage.getItem('appBuildId');

            // Se não houver ID armazenado, armazena o atual
            if (!storedBuildId) {
                localStorage.setItem('appBuildId', BUILD_ID);
            }
            // Se o ID armazenado for diferente do atual, é uma nova versão
            else if (storedBuildId !== BUILD_ID) {
                console.log('Nova versão detectada, recarregando...');
                localStorage.setItem('appBuildId', BUILD_ID);
                setShouldRefresh(true);
            }
        }

        // Verifica periodicamente se há uma nova versão
        const checkInterval = setInterval(() => {
            fetch('/_next/static/BUILD_ID?v=' + Date.now())
                .then(response => response.text())
                .then(latestBuildId => {
                    if (latestBuildId && latestBuildId !== BUILD_ID) {
                        console.log('Nova versão disponível, solicita reload');
                        setShouldRefresh(true);
                    }
                })
                .catch(err => console.log('Erro ao verificar versão:', err));
        }, 5 * 60 * 1000); // Verifica a cada 5 minutos

        return () => clearInterval(checkInterval);
    }, []);

    // Se detectou uma nova versão, mostra uma mensagem e oferece recarregar
    if (shouldRefresh) {
        return (
            <div
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    background: '#ffffff',
                    border: '1px solid #10b981',
                    borderRadius: '8px',
                    padding: '16px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    zIndex: 9999,
                    maxWidth: '300px'
                }}
            >
                <p style={{ margin: '0 0 12px 0' }}>
                    Uma nova versão está disponível. Atualize para a versão mais recente.
                </p>
                <button
                    onClick={() => window.location.reload()}
                    style={{
                        background: '#10b981',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    Atualizar agora
                </button>
            </div>
        );
    }

    return null;
}
