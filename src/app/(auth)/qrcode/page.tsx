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

  const N8N_BASE_URL = 'https://n8n.ronnysenna.com.br/webhook'
  const LOCAL_STORAGE_KEY = 'evolutionInstanceStatus'

  const checkIfConnected = useCallback(async (name: string): Promise<boolean> => {
    if (!name) return false
    try {
      const response = await fetch(`${N8N_BASE_URL}/verificar-status-instancia`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instanceName: name }),
      })

      if (!response.ok) {
        console.error("Erro ao verificar status (resposta não OK):", response.status)
        return false
      }

      const data: QRCodeResponse = await response.json()

      if (data.status === 'conectado') {
        setIsConnected(true)
        saveStatusToLocalStorage(name, true)
        return true
      }
    } catch (err) {
      console.error('Erro ao verificar status:', err)
    }
    return false
  }, [N8N_BASE_URL])

  const updateInstanceHistory = useCallback((name: string, connected: boolean) => {
    setHistory(prev => {
      const updatedHistory = prev.find(h => h.name === name)
        ? prev.map(h => h.name === name
          ? {
            ...h,
            lastConnected: new Date().toISOString(),
            status: connected ? ('connected' as const) : ('disconnected' as const)
          }
          : h)
        : [...prev, {
          name,
          lastConnected: new Date().toISOString(),
          status: connected ? ('connected' as const) : ('disconnected' as const)
        }]

      localStorage.setItem('instanceHistory', JSON.stringify(updatedHistory))
      return updatedHistory
    })
  }, [])

  const saveStatusToLocalStorage = useCallback((name: string, connected: boolean) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
      instanceName: name,
      isConnected: connected,
      lastConnected: new Date().toISOString()
    }))
    updateInstanceHistory(name, connected)
  }, [updateInstanceHistory])

  const loadStatusFromLocalStorage = useCallback(() => {
    setError(null)
    const storedStatus = localStorage.getItem(LOCAL_STORAGE_KEY)
    const historyData = localStorage.getItem('instanceHistory')

    if (historyData) {
      try {
        const parsedHistory = JSON.parse(historyData)
        if (Array.isArray(parsedHistory)) {
          setHistory(parsedHistory)
        }
      } catch (e) {
        console.error("Erro ao carregar histórico", e)
        localStorage.removeItem('instanceHistory')
      }
    }

    if (storedStatus) {
      try {
        const { instanceName: storedName, isConnected: storedConnected } = JSON.parse(storedStatus)
        if (storedConnected && storedName) {
          setInstanceName(storedName)
          setIsConnected(true)
          setQrCodeSrc(null)
          setTimer(null)
          return true
        }
      } catch (e) {
        console.error("Erro ao carregar status da instância", e)
        setError("Erro ao carregar status da última sessão")
        localStorage.removeItem(LOCAL_STORAGE_KEY)
      }
    }
    return false
  }, [])

  const resetInstance = useCallback(() => {
    if (confirm('Tem certeza que deseja desconectar esta instância?')) {
      localStorage.removeItem(LOCAL_STORAGE_KEY)
      updateInstanceHistory(instanceName, false)
      setInstanceName('')
      setQrCodeSrc(null)
      setLoading(false)
      setTimer(null)
      setIsConnected(false)
      setError(null)
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
    }
  }, [instanceName, updateInstanceHistory])

  const handleHistoryItemClick = useCallback((item: InstanceHistory) => {
    setInstanceName(item.name)
    void checkIfConnected(item.name)
    setShowHistory(false)
  }, [checkIfConnected])

  const clearHistory = useCallback(() => {
    if (confirm('Tem certeza que deseja limpar o histórico?')) {
      setHistory([])
      localStorage.removeItem('instanceHistory')
    }
  }, [])

  const fetchAndDisplayQRCode = useCallback(async (name: string, isInitial: boolean = false) => {
    setLoading(true)
    setQrCodeSrc(null)
    setIsConnected(false)
    setError(null)

    try {
      const endpoint = isInitial
        ? `${N8N_BASE_URL}/criar-instancia-evolution`
        : `${N8N_BASE_URL}/atualizar-qr-code`

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instanceName: name }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Erro na resposta do servidor: ${response.status} - ${errorText || response.statusText}`)
      }

      const contentType = response.headers.get('content-type')
      let imgSrc: string

      if (contentType?.includes('application/json')) {
        const data: QRCodeResponse = await response.json()
        if (data.qrCodeBase64) {
          imgSrc = `data:image/png;base64,${data.qrCodeBase64}`
        } else {
          throw new Error('QR Code Base64 não encontrado na resposta.')
        }
      } else {
        const blob = await response.blob()
        imgSrc = URL.createObjectURL(blob)
      }

      setQrCodeSrc(imgSrc)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error('Erro ao gerar QR code:', error)
      setError(errorMessage)
      resetInstance()
    } finally {
      setLoading(false)
    }
  }, [N8N_BASE_URL, resetInstance])

  const startTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
    }
    setTimer(10)

    timerIntervalRef.current = setInterval(() => {
      setTimer(prevTime => {
        if (prevTime === null) return null
        if (prevTime <= 1) {
          if (instanceName) {
            void checkIfConnected(instanceName).then(connected => {
              if (!connected) {
                void fetchAndDisplayQRCode(instanceName)
                setTimer(10)
              } else {
                if (timerIntervalRef.current) {
                  clearInterval(timerIntervalRef.current)
                }
                setTimer(null)
              }
            })
          }
          return 0
        }
        return prevTime - 1
      })
    }, 1000)
  }, [instanceName, checkIfConnected, fetchAndDisplayQRCode])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!instanceName.trim()) return

    setError(null)
    setLoading(true)

    try {
      const response = await fetch(`${N8N_BASE_URL}/gerar-qrcode`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ instanceName: instanceName.trim() }),
      })

      if (!response.ok) {
        throw new Error('Erro ao gerar QR Code')
      }

      const data: QRCodeResponse = await response.json()
      if (data.qrcode) {
        setQrCodeSrc(data.qrcode)
        startTimer()
      } else if (data.error) {
        throw new Error(data.error)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao gerar QR Code'
      console.error('Erro:', error)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [instanceName, N8N_BASE_URL, startTimer])

  useEffect(() => {
    const loaded = loadStatusFromLocalStorage()
    if (!loaded && instanceName) {
      void checkIfConnected(instanceName)
    }
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
    }
  }, [loadStatusFromLocalStorage, instanceName, checkIfConnected])

  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="h3 mb-0">Configuração do WhatsApp</h1>
                {history.length > 0 && (
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="btn btn-outline-primary d-flex align-items-center gap-2"
                  >
                    <History size={18} />
                    <span>Histórico</span>
                  </button>
                )}
              </div>

              {/* Mensagem de Erro */}
              {error && (
                <div className="alert alert-danger d-flex align-items-center gap-2 mb-4" role="alert">
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              {/* Histórico de Instâncias */}
              {showHistory && (
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="mb-0">Instâncias Recentes</h6>
                    <button
                      onClick={clearHistory}
                      className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                    >
                      <Trash2 size={14} />
                      <span>Limpar</span>
                    </button>
                  </div>
                  <div className="list-group">
                    {history.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => handleHistoryItemClick(item)}
                        className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                      >
                        <div>
                          <h6 className="mb-1">{item.name}</h6>
                          <small className="text-muted">
                            Última conexão: {new Date(item.lastConnected).toLocaleString()}
                          </small>
                        </div>
                        <span className={`badge bg-${item.status === 'connected' ? 'success' : 'secondary'}`}>
                          {item.status === 'connected' ? 'Conectado' : 'Desconectado'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!isConnected ? (
                <>
                  {/* Formulário de Nova Instância */}
                  {!qrCodeSrc && (
                    <div className="text-center mb-4">
                      <div className="bg-light p-4 rounded-3 mb-4">
                        <QrCodeIcon size={48} className="text-primary mb-3" />
                        <p className="text-muted mb-0">
                          Para começar, informe um nome para sua instância do WhatsApp
                        </p>
                      </div>
                      <form onSubmit={handleSubmit}>
                        <div className="input-group mb-3">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Nome da instância"
                            value={instanceName}
                            onChange={(e) => setInstanceName(e.target.value)}
                            disabled={loading}
                          />
                          <button
                            type="submit"
                            className="btn btn-primary d-flex align-items-center gap-2"
                            disabled={loading || !instanceName.trim()}
                          >
                            {loading ? (
                              <>
                                <Loader2 size={18} className="animate-spin" />
                                <span>Gerando...</span>
                              </>
                            ) : (
                              <>
                                <QrCodeIcon size={18} />
                                <span>Gerar QR Code</span>
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* QR Code */}
                  {qrCodeSrc && (
                    <div className="text-center">
                      <div className="d-inline-block p-4 bg-light rounded-3 mb-4">
                        <Image
                          src={qrCodeSrc}
                          alt="QR Code WhatsApp"
                          width={250}
                          height={250}
                          className="img-fluid"
                        />
                      </div>
                      {timer !== null && (
                        <div className="alert alert-warning d-flex align-items-center gap-2" role="alert">
                          <AlertCircle size={18} />
                          <div>
                            <p className="mb-1">QR Code expira em: {timer} segundos</p>
                            <small>Escaneie o código QR com seu WhatsApp para conectar</small>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                /* Status Conectado */
                <div className="text-center">
                  <div className="d-inline-block p-4 bg-success bg-opacity-10 rounded-circle mb-4">
                    <Image
                      src="/images/conectado.png"
                      alt="Conectado"
                      width={120}
                      height={120}
                      className="img-fluid"
                    />
                  </div>
                  <h4 className="text-success mb-3">WhatsApp Conectado!</h4>
                  <p className="text-muted mb-4">
                    Instância <strong>{instanceName}</strong> está ativa e pronta para uso.
                  </p>
                  <button
                    onClick={resetInstance}
                    className="btn btn-outline-danger d-flex align-items-center gap-2 mx-auto"
                  >
                    <Trash2 size={18} />
                    <span>Desconectar WhatsApp</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}