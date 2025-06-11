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

  const handleCreateInstance = async () => {
    if (!instanceName.trim()) return

    setLoading(true)
    setError(null)
    setQrCodeSrc(null)

    try {
      const response = await fetch(`${N8N_BASE_URL}/criar-instancia`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instanceName }),
      })

      if (!response.ok) {
        throw new Error('Erro ao criar instância')
      }

      const data: QRCodeResponse = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      if (data.qrCodeBase64) {
        setQrCodeSrc(`data:image/png;base64,${data.qrCodeBase64}`)
        startConnectionCheck()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar instância')
    } finally {
      setLoading(false)
    }
  }

  const handleDisconnect = async () => {
    if (!instanceName) return

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`${N8N_BASE_URL}/deletar-instancia`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instanceName }),
      })

      if (!response.ok) {
        throw new Error('Erro ao desconectar instância')
      }

      setIsConnected(false)
      setQrCodeSrc(null)
      setInstanceName('')
      saveStatusToLocalStorage(instanceName, false)
      stopConnectionCheck()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao desconectar instância')
    } finally {
      setLoading(false)
    }
  }

  const startConnectionCheck = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
    }

    let timeLeft = 30
    setTimer(timeLeft)

    timerIntervalRef.current = setInterval(async () => {
      if (timeLeft <= 0) {
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current)
        }
        const isConnected = await checkIfConnected(instanceName)
        if (!isConnected) {
          setQrCodeSrc(null)
          handleCreateInstance()
        }
        return
      }
      setTimer(--timeLeft)
    }, 1000)
  }, [checkIfConnected, handleCreateInstance, instanceName])

  const stopConnectionCheck = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }
    setTimer(null)
  }, [])

  useEffect(() => {
    loadStatusFromLocalStorage()
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
    }
  }, [loadStatusFromLocalStorage])

  useEffect(() => {
    if (isConnected) {
      stopConnectionCheck()
    }
  }, [isConnected, stopConnectionCheck])

  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          {error && (
            <div className="profile-feedback error d-flex align-items-center gap-2">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          <div className="profile-card">
            <div className="card-body p-4">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                <div>
                  <h1 className="h3 mb-1 fw-bold gradient-number">WhatsApp Connect</h1>
                  <p className="text-muted mb-0">Conecte sua instância do WhatsApp</p>
                </div>
                <button
                  type="button"
                  className="btn btn-outline-primary d-flex align-items-center justify-content-center gap-2 hover-scale"
                  onClick={() => setShowHistory(!showHistory)}
                >
                  <History size={18} />
                  <span>{showHistory ? 'Voltar' : 'Histórico'}</span>
                </button>
              </div>

              {showHistory ? (
                <div className="animate-slide-in">
                  <div className="card-status-info p-3 rounded-3">
                    <h5 className="mb-3 d-flex align-items-center gap-2">
                      <History size={18} />
                      Histórico de Conexões
                    </h5>
                    {history.length === 0 ? (
                      <p className="text-muted mb-0">Nenhuma conexão registrada.</p>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-hover mb-0">
                          <thead>
                            <tr>
                              <th>Nome</th>
                              <th>Última Conexão</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {history.map((instance) => (
                              <tr key={instance.name}>
                                <td>{instance.name}</td>
                                <td>{new Date(instance.lastConnected).toLocaleString()}</td>
                                <td>
                                  <span className={`badge bg-${instance.status === 'connected' ? 'success' : 'danger'}`}>
                                    {instance.status === 'connected' ? 'Conectado' : 'Desconectado'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="animate-slide-in">
                  <div className="mb-4">
                    <div className="profile-form-group">
                      <label className="form-label">Nome da Instância</label>
                      <div className="input-group">
                        <input
                          type="text"
                          className="form-control profile-form-control"
                          placeholder="Digite o nome da instância"
                          value={instanceName}
                          onChange={(e) => setInstanceName(e.target.value)}
                          disabled={isConnected || loading}
                        />
                        {(isConnected || loading) && (
                          <button
                            className="btn btn-outline-danger hover-scale"
                            type="button"
                            onClick={handleDisconnect}
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </div>

                    {!isConnected && !loading && (
                      <button
                        className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2 py-2 hover-scale"
                        onClick={handleCreateInstance}
                        disabled={!instanceName.trim()}
                      >
                        <QrCodeIcon size={18} />
                        Gerar QR Code
                      </button>
                    )}
                  </div>

                  {loading && (
                    <div className="text-center p-4">
                      <div className="spinner-border text-primary mb-2" role="status">
                        <span className="visually-hidden">Carregando...</span>
                      </div>
                      <p className="text-muted mb-0">
                        {timer !== null ? `Reconectando em ${timer}s...` : 'Gerando QR Code...'}
                      </p>
                    </div>
                  )}

                  {isConnected && (
                    <div className="card-status-success p-4 rounded-4 text-center animate-slide-in">
                      <div className="icon-glass rounded-circle p-3 d-inline-flex mb-3">
                        <Image
                          src="/images/conectado.png"
                          alt="Conectado"
                          width={48}
                          height={48}
                        />
                      </div>
                      <h4 className="gradient-number mb-2">WhatsApp Conectado!</h4>
                      <p className="text-muted mb-0">
                        Sua instância está ativa e pronta para uso.
                      </p>
                    </div>
                  )}

                  {qrCodeSrc && !isConnected && !loading && (
                    <div className="text-center p-4 animate-fade-in">
                      <div className="qr-code-wrapper mb-3">
                        <Image
                          src={qrCodeSrc}
                          alt="QR Code"
                          width={256}
                          height={256}
                          className="img-fluid rounded-4"
                        />
                      </div>
                      <p className="text-muted mb-0">
                        Escaneie o QR Code com seu WhatsApp
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}