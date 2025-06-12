'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from "next/image"
import { Loader2, QrCode as QrCodeIcon, Trash2, History, AlertCircle } from "lucide-react"

interface QRCodeResponse {
  qrcode?: string
  qrCodeBase64?: string
  status?: string
  error?: string
}

interface InstanceHistory {
  name: string
  lastConnected: string
  status: 'connected' | 'disconnected'
}

export default function QRCodePage() {
  const [instanceName, setInstanceName] = useState('')
  const [qrCodeSrc, setQrCodeSrc] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [timer, setTimer] = useState<number | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<InstanceHistory[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Adicionado para o novo useEffect
  const isMounted = useRef(false);

  const WEBHOOK_URLS = {
    criar: 'https://n8n.ronnysenna.com.br/webhook/criar-instancia-evolution',
    atualizar: 'https://n8n.ronnysenna.com.br/webhook/atualizar-qr-code',
    status: 'https://n8n.ronnysenna.com.br/webhook/verificar-status-instancia'
  }

  const LOCAL_STORAGE_KEY = 'evolutionInstanceStatus'

  const fetchAndDisplayQRCode = useCallback(async (name: string) => {
    setLoading(true)
    setQrCodeSrc(null)
    setIsConnected(false)
    setError(null)

    try {
      // Primeiro, criar a instância
      const response = await fetch(WEBHOOK_URLS.criar, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instanceName: name }),
      })

      let data: QRCodeResponse;
      const contentType = response.headers.get('content-type');

      try {
        if (contentType?.includes('image/png')) {
          // Se for uma imagem PNG, converte o buffer para base64
          const arrayBuffer = await response.arrayBuffer();
          const base64 = Buffer.from(arrayBuffer).toString('base64');
          data = { qrCodeBase64: `data:image/png;base64,${base64}` };
        } else {
          // Se não for imagem, tenta processar como JSON ou base64
          const responseText = await response.text();

          // Tenta detectar se já é base64
          if (responseText.match(/^data:image\/(png|jpeg|jpg|gif);base64,/)) {
            data = { qrCodeBase64: responseText };
          } else {
            try {
              data = JSON.parse(responseText);
            } catch {
              throw new Error('Formato de resposta inválido');
            }
          }
        }
      } catch (parseError: unknown) {
        const errorMessage = parseError instanceof Error ? parseError.message : 'Erro desconhecido';
        throw new Error(`Erro ao processar resposta do servidor: ${errorMessage}`);
      }

      if (!response.ok) {
        throw new Error(`Erro na resposta do servidor: ${response.status} - ${data.error || response.statusText}`);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.qrcode || data.qrCodeBase64) {
        const qrSource = data.qrcode || data.qrCodeBase64;
        if (!qrSource) {
          throw new Error('QR Code recebido é inválido');
        }

        // Garante que a string do QR code é uma URL válida ou base64
        if (!qrSource.startsWith('data:image/') && !qrSource.startsWith('http')) {
          // Se for apenas base64, adiciona o prefixo necessário
          setQrCodeSrc(`data:image/png;base64,${qrSource}`);
        } else {
          setQrCodeSrc(qrSource);
        }

        startStatusCheck(name);
      } else if (data.status === 'connected') {
        setIsConnected(true)
        updateInstanceHistory(name, true)
        resetInstance()
      } else {
        throw new Error('Resposta inválida do servidor')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error('Erro ao gerar QR code:', error)
      setError(errorMessage)
      resetInstance()
    } finally {
      setLoading(false)
    }
  }, [])

  const resetInstance = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }
    setTimer(null)
    setQrCodeSrc(null)
    setIsConnected(false)
    setError(null)
  }, [])

  const startStatusCheck = useCallback((name: string) => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
    }

    const checkStatus = async () => {
      try {
        // Primeiro verifica o status
        const response = await fetch(WEBHOOK_URLS.status, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ instanceName: name }),
        });

        if (!response.ok) {
          throw new Error(`Erro ao verificar status: ${response.status}`);
        }

        // Tenta ler o corpo da resposta primeiro como texto
        const responseText = await response.text();
        console.log('Resposta bruta do status:', responseText);

        // Se a resposta estiver vazia, considera como não conectado
        if (!responseText || !responseText.trim()) {
          console.log('Resposta de status vazia');
          return;
        }

        let statusData;
        try {
          statusData = JSON.parse(responseText);
          console.log('Dados de status recebidos:', statusData); // Log para ver o objeto statusData completo
        } catch (e) {
          console.error('Erro ao fazer parse do status:', e);
          return;
        }

        // Se estiver conectado
        if (statusData.status && statusData.status.trim().toLowerCase() === 'conectado') {
          console.log('WhatsApp conectado! Exibindo imagem de confirmação.');
          setIsConnected(true);
          setQrCodeSrc('/images/conectado.png'); // <--- Define a imagem de conectado
          updateInstanceHistory(name, true);

          // Para o loop de verificação
          if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
          }
          return;
        }

        console.log('Status diferente de connected. Status atual:', statusData.status, 'Dados completos de status:', statusData);

        // Se chegou aqui, não está conectado. Tenta atualizar o QR code
        console.log('Atualizando QR code...');
        const updateResponse = await fetch(WEBHOOK_URLS.atualizar, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ instanceName: name }),
        });

        if (!updateResponse.ok) {
          throw new Error(`Erro ao atualizar QR code: ${updateResponse.status}`);
        }

        const contentType = updateResponse.headers.get('content-type');
        console.log('Content-Type da resposta de atualização:', contentType);

        // Se for uma imagem PNG
        if (contentType?.includes('image/png')) {
          const arrayBuffer = await updateResponse.arrayBuffer();
          const base64 = Buffer.from(arrayBuffer).toString('base64');
          setQrCodeSrc(`data:image/png;base64,${base64}`);
          console.log('QR code atualizado (imagem PNG)');
          return;
        }

        // Se não for imagem, tenta ler como texto
        const updateText = await updateResponse.text();
        console.log('Resposta de atualização:', updateText);

        // Se a resposta estiver vazia, mantém o QR code atual
        if (!updateText || !updateText.trim()) {
          console.log('Resposta de atualização vazia');
          return;
        }

        // Se já for um base64 com prefixo
        if (updateText.match(/^data:image\/(png|jpeg|jpg|gif);base64,/)) {
          setQrCodeSrc(updateText);
          console.log('QR code atualizado (base64 direto)');
          return;
        }

        try {
          // Tenta fazer parse como JSON
          const updateData = JSON.parse(updateText);
          const qrSource = updateData.qrcode || updateData.qrCodeBase64;

          if (qrSource) {
            if (!qrSource.startsWith('data:image/') && !qrSource.startsWith('http')) {
              setQrCodeSrc(`data:image/png;base64,${qrSource}`);
              console.log('QR code atualizado (base64 do JSON)');
            } else {
              setQrCodeSrc(qrSource);
              console.log('QR code atualizado (URL ou base64 do JSON)');
            }
          }
        } catch (error) {
          console.error('Erro ao processar resposta de atualização:', error);
        }
      } catch (error) {
        console.error('Erro na verificação de status:', error);
      }
    };

    // Inicia o loop de verificação
    checkStatus(); // Primeira verificação imediata
    timerIntervalRef.current = setInterval(checkStatus, 5000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [])

  const updateInstanceHistory = useCallback((name: string, connected: boolean) => {
    const currentDate = new Date().toISOString()
    setHistory(prev => {
      const newHistory = prev.filter(h => h.name !== name)
      const newEntry: InstanceHistory = {
        name,
        lastConnected: currentDate,
        status: connected ? 'connected' : 'disconnected'
      }
      return [newEntry, ...newHistory].slice(0, 5)
    })
  }, [])

  // Efeito para carregar o histórico e verificar a última instância conectada ao montar
  useEffect(() => {
    const initializePage = async () => {
      // 1. Carregar histórico do localStorage
      const savedHistoryString = localStorage.getItem(LOCAL_STORAGE_KEY);
      let initialHistory: InstanceHistory[] = [];
      if (savedHistoryString) {
        try {
          initialHistory = JSON.parse(savedHistoryString);
          setHistory(initialHistory); // Atualiza o estado do histórico
        } catch (e) {
          console.error('Erro ao carregar histórico do localStorage:', e);
        }
      }

      // 2. Se houver histórico, iterar e verificar o status de cada instância até encontrar uma conectada
      if (initialHistory.length > 0) {
        setLoading(true); // Feedback visual geral para a verificação inicial
        setError(null);
        let foundConnectedInstance = false;

        for (const instanceEntry of initialHistory) {
          if (!instanceEntry.name || typeof instanceEntry.name !== 'string') {
            console.warn('Entrada de histórico inválida (sem nome):', instanceEntry);
            continue; // Pula entradas inválidas
          }

          console.log(`Verificando status inicial para: ${instanceEntry.name}`);
          try {
            const response = await fetch(WEBHOOK_URLS.status, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ instanceName: instanceEntry.name }),
            });

            if (response.ok) {
              const statusText = await response.text();
              if (statusText && statusText.trim()) {
                const statusData = JSON.parse(statusText);
                if (statusData.status && statusData.status.trim().toLowerCase() === 'conectado') {
                  console.log(`Instância '${instanceEntry.name}' confirmada como conectada.`);
                  setInstanceName(instanceEntry.name); // Preenche o nome da instância
                  setIsConnected(true);                 // Define como conectada
                  setQrCodeSrc('/images/conectado.png'); // Mostra a imagem de conectado
                  foundConnectedInstance = true;
                  break; // Para a iteração, pois já encontramos uma conectada
                } else {
                  console.log(`Instância '${instanceEntry.name}' não está conectada (status: ${statusData.status}).`);
                }
              } else {
                console.log(`Resposta de status vazia para '${instanceEntry.name}'.`);
              }
            } else {
              console.warn(`Falha ao verificar status inicial para '${instanceEntry.name}': ${response.status}`);
            }
          } catch (e) {
            console.error(`Erro na verificação de status inicial para '${instanceEntry.name}':`, e);
          }
        }
        // Se nenhuma instância conectada foi encontrada no histórico, garantir que a UI esteja limpa.
        if (!foundConnectedInstance) {
          // O resetInstance() pode ser muito agressivo aqui se o usuário já digitou algo.
          // Apenas garantimos que isConnected e qrCodeSrc estejam no estado "não conectado".
          // instanceName permanecerá como está (se o usuário digitou algo) ou '' (inicial).
          setIsConnected(false);
          setQrCodeSrc(null); // Limpa qualquer QR code ou imagem de conectado anterior
        }
        setLoading(false);
      }
    };

    initializePage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Array de dependências vazio para executar apenas na montagem

  useEffect(() => {
    // Salva o histórico no localStorage sempre que ele mudar
    // Apenas executa se não for a montagem inicial para evitar sobrescrever o estado inicial antes de ser totalmente processado
    if (isMounted.current) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(history));
    } else {
      isMounted.current = true;
    }
  }, [history]);

  return (
    <div className="container">
      <div className="card mb-4">
        <div className="card-body">
          <h1 className="display-6 fw-bold mb-4">Gerador de QR Code</h1>

          {error && (
            <div className="alert alert-danger d-flex align-items-center mb-4">
              <AlertCircle className="me-2" />
              {error}
            </div>
          )}

          {isConnected && (
            <div className="alert alert-success d-flex align-items-center mb-4">
              <span className="me-2">✓</span>
              WhatsApp conectado com sucesso!
            </div>
          )}

          <div className="mb-4">
            <label className="form-label">
              Nome da Instância
            </label>
            <input
              type="text"
              value={instanceName}
              onChange={(e) => setInstanceName(e.target.value)}
              className="form-control product-form-input"
              placeholder="Digite o nome da instância"
            />
          </div>

          <div className="d-flex gap-3">
            <button
              onClick={() => fetchAndDisplayQRCode(instanceName)}
              className="btn btn-primary flex-grow-1 d-flex align-items-center justify-content-center gap-2 py-2 hover-scale"
              disabled={loading || !instanceName}
            >
              {loading ? (
                <>
                  <div className="spinner-border spinner-border-sm" role="status">
                    <span className="visually-hidden">Carregando...</span>
                  </div>
                  <span>Gerando...</span>
                </>
              ) : (
                <>
                  <QrCodeIcon size={18} />
                  <span>Gerar QR Code</span>
                </>
              )}
            </button>

            <button
              onClick={resetInstance}
              className="btn btn-light flex-grow-1 d-flex align-items-center justify-content-center gap-2 py-2 hover-scale"
            >
              <Trash2 size={18} />
              <span>Limpar</span>
            </button>
          </div>

          {/*
            Renderiza a imagem (QR Code ou imagem de "Conectado") se qrCodeSrc existir.
            A imagem correta é determinada pelo valor de qrCodeSrc,
            que é atualizado no callback de startStatusCheck.
          */}
          {qrCodeSrc && (
            <div className={`mt-4 qr-code-wrapper text-center p-4 ${isConnected ? 'connected' : ''}`}>
              <Image
                key={isConnected ? "connected-image" : qrCodeSrc} // Chave diferente para forçar re-renderização
                src={qrCodeSrc}
                alt={isConnected ? "WhatsApp Conectado" : "QR Code"}
                width={256}
                height={256}
                className="img-fluid rounded animate-slide-in"
                priority
              />
            </div>
          )}
        </div>
      </div>

      {history.length > 0 && (
        <div className="card animate-slide-in">
          <div className="card-body">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="btn btn-success w-100 d-flex align-items-center justify-content-center gap-2 py-2 hover-scale mb-3"
            >
              <History size={18} />
              {showHistory ? 'Ocultar Histórico' : 'Mostrar Histórico'}
            </button>

            {showHistory && (
              <div className="animate-fade-in">
                <h5 className="gradient-number mb-3">Histórico de Conexões</h5>
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead>
                      <tr>
                        <th>Nome da Instância</th>
                        <th>Data</th>
                        <th className="text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((item, index) => (
                        <tr key={index}>
                          <td>{item.name}</td>
                          <td>{new Date(item.lastConnected).toLocaleString()}</td>
                          <td className="text-center">
                            <span
                              className={`badge ${item.status === 'connected' ? 'bg-success' : 'bg-danger'}`}
                            >
                              {item.status === 'connected' ? 'Conectado' : 'Desconectado'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
