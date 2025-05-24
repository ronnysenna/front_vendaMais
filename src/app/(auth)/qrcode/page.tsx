'use client'

import { useState, useEffect, useRef, useCallback } from 'react'; // Adicionado useCallback
import Image from "next/image";
import { Loader2 } from "lucide-react"; // Para o ícone de loading

export default function QRCodePage() {
  const [instanceName, setInstanceName] = useState('');
  const [qrCodeSrc, setQrCodeSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const N8N_BASE_URL = 'https://n8n.ronnysenna.com.br/webhook';
  const LOCAL_STORAGE_KEY = 'evolutionInstanceStatus';

  // Função para salvar o estado no localStorage
  const saveStatusToLocalStorage = useCallback((name: string, connected: boolean) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ instanceName: name, isConnected: connected }));
  }, []);

  // Função para carregar o estado do localStorage
  const loadStatusFromLocalStorage = useCallback(() => {
    const storedStatus = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedStatus) {
      try {
        const { instanceName: storedName, isConnected: storedConnected } = JSON.parse(storedStatus);
        if (storedConnected && storedName) {
          setInstanceName(storedName);
          setIsConnected(true);
          setQrCodeSrc(null); // Não mostra QR code se já está conectado
          setTimer(null); // Para o timer
          return true;
        }
      } catch (e) {
        console.error("Erro ao parsear status do localStorage", e);
        localStorage.removeItem(LOCAL_STORAGE_KEY); // Limpa cache inválido
      }
    }
    return false;
  }, []);

  // Limpa o estado no localStorage e reinicia a página
  const resetInstance = useCallback(() => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setInstanceName('');
    setQrCodeSrc(null);
    setLoading(false);
    setTimer(null);
    setIsConnected(false);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
  }, []);


  const fetchAndDisplayQRCode = async (name: string, isInitial: boolean = false) => {
    setLoading(true);
    setQrCodeSrc(null);
    setIsConnected(false); // Assume que não está conectado ao gerar um novo QR

    try {
      const endpoint = isInitial
        ? `${N8N_BASE_URL}/criar-instancia-evolution`
        : `${N8N_BASE_URL}/atualizar-qr-code`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instanceName: name }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro na resposta do servidor: ${response.status} - ${errorText || response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      let imgSrc: string;

      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (data.qrCodeBase64) {
          imgSrc = `data:image/png;base64,${data.qrCodeBase64}`;
        } else {
          throw new Error('QR Code Base64 não encontrado na resposta.');
        }
      } else {
        const blob = await response.blob();
        imgSrc = URL.createObjectURL(blob);
      }

      setQrCodeSrc(imgSrc);
    } catch (error) {
      console.error('Erro ao gerar QR code:', error);
      alert(`Erro ao gerar QR code. Por favor, tente novamente. Detalhes: ${error instanceof Error ? error.message : String(error)}`);
      resetInstance(); // Reseta se houver erro grave na criação/atualização
    } finally {
      setLoading(false);
    }
  };

  const checkIfConnected = async (name: string): Promise<boolean> => {
    if (!name) return false; // Não verifica se o nome da instância está vazio
    try {
      const response = await fetch(`${N8N_BASE_URL}/verificar-status-instancia`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instanceName: name }),
      });

      if (!response.ok) {
        console.error("Erro ao verificar status (resposta não OK):", response.status);
        return false;
      }

      const data = await response.json();

      if (data.status === 'conectado') {
        setIsConnected(true);
        saveStatusToLocalStorage(name, true); // Salva no localStorage
        return true;
      }
    } catch (err) {
      console.error('Erro ao verificar status:', err);
    }
    return false;
  };

  const startTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    setTimer(10); // Reinicia o timer para 10 segundos

    timerIntervalRef.current = setInterval(async () => {
      setTimer(prevTime => {
        if (prevTime === null) return null;
        if (prevTime <= 1) {
          if (instanceName) {
            checkIfConnected(instanceName).then(connected => {
              if (!connected) {
                fetchAndDisplayQRCode(instanceName);
                setTimer(10); // Reinicia o timer
              } else {
                if (timerIntervalRef.current) {
                  clearInterval(timerIntervalRef.current);
                }
                setTimer(null); // Para o timer
              }
            });
          }
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  const handleGenerateQRCode = async () => {
    if (!instanceName.trim()) {
      alert('Por favor, insira o nome da instância.');
      return;
    }
    await fetchAndDisplayQRCode(instanceName, true);
    startTimer();
  };

  // Carrega o estado do localStorage quando o componente monta
  useEffect(() => {
    const loaded = loadStatusFromLocalStorage();
    // Se não carregou um estado conectado do localStorage, inicia uma verificação periódica
    // para o caso de a instância se conectar enquanto o usuário está na página.
    // Isso é importante para instâncias que já existem mas ainda não estão "conectadas" no seu localstorage.
    if (!loaded && instanceName) {
      // Se já tem um nome de instância (ex: veio de um formulário ou outra fonte),
      // pode-se iniciar a verificação de status.
      // Ou simplificar e só verificar após o primeiro QR Code ser gerado.
    }
  }, [loadStatusFromLocalStorage, instanceName]); // Adicionado instanceName à dependência

  // Limpa o intervalo quando o componente é desmontado
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className="max-w-xl mx-auto mt-10 text-white">
      <div className="flex flex-col items-center p-8 bg-gray-800 rounded-xl shadow-lg text-center">

        <h3 className="text-3xl font-bold mb-6 text-[#fba931]">Gerador de QR Code</h3>

        {isConnected ? (
          // Estado CONECTADO
          <div className="w-full">
            <Image
              src="/images/conectado.png" // Caminho para a imagem de certo
              alt="Instância Conectada"
              width={100}
              height={100}
              className="mx-auto mb-4"
            />
            <p className="text-green-500 font-bold text-xl mb-2">Instância "{instanceName}" conectada com sucesso! 🎉</p>
            <p className="text-gray-400 text-sm mb-4">Você pode fechar esta página.</p>
            <button
              className="w-full py-3 px-6 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={resetInstance}
            >
              Criar Nova Instância
            </button>
          </div>
        ) : (
          // Estado NÃO CONECTADO (ou esperando QR Code)
          <>
            <div className="w-full mb-4">
              <label htmlFor="instanceName" className="block text-left mb-1 text-[#fba931] font-medium">Nome da Instância</label>
              <input
                type="text"
                id="instanceName"
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#fba931] focus:border-transparent placeholder:text-gray-400"
                placeholder="Nome da sua instância (ex: MinhaEmpresa)"
                value={instanceName}
                onChange={(e) => setInstanceName(e.target.value)}
                disabled={loading} // Apenas desabilita enquanto carrega
              />
            </div>

            <button
              id="generateButton"
              className="w-full py-3 px-6 mb-4 bg-[#fba931] text-gray-900 font-bold rounded-lg shadow-md hover:bg-[#e09a2d] focus:outline-none focus:ring-2 focus:ring-[#fba931] focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleGenerateQRCode}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin inline-block mr-2" />
                  Gerando...
                </>
              ) : (
                "Gerar QR Code"
              )}
            </button>

            {loading && (
              <div className="loader border-t-4 border-[#fba931] border-solid rounded-full w-10 h-10 animate-spin mx-auto my-4"></div>
            )}

            {qrCodeSrc && ( // Mostra QR Code se tiver um src e não estiver conectado
              <div id="qrcode" className="mt-4 flex justify-center">
                <Image
                  src={qrCodeSrc}
                  alt="QR Code"
                  width={200}
                  height={200}
                  className="max-w-full h-auto rounded-lg shadow-sm border-2 border-yellow-500"
                />
              </div>
            )}

            {timer !== null && timer > 0 && ( // Mostra timer se estiver ativo
                <div id="timer" className="text-gray-400 mt-3 text-sm font-medium">
                    Novo QR Code em: {timer}s
                </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}