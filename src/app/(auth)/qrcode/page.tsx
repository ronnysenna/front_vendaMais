'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react' // Adicionado React aqui
import Image from "next/image"
import { Loader2, QrCode as QrCodeIcon, Trash2, History, AlertCircle, ListChecks, CheckCircle2, XCircle, Info, RefreshCw, AlertTriangle, HelpCircle } from "lucide-react" // Adicionado ListChecks e outros ícones

interface QRCodeResponse {
  qrcode?: string
  qrCodeBase64?: string
  status?: string
  error?: string
  // Adicionado para compatibilidade com a resposta de status que pode vir com 'instance'
  instance?: {
    instanceName?: string;
    status?: string;
  };
}

interface InstanceHistory {
  name: string
  lastConnected: string
  status: 'connected' | 'disconnected' | 'error' // Adicionado 'error'
}

// Nova interface para detalhes da instância da lista
interface InstanceDetail {
  name: string;
  status: string;
  // Adicione quaisquer outros campos que o webhook listar-instancias possa retornar
}

// Mapeamento de status para UI
const STATUS_DISPLAY_INFO: Record<string, { text: string; color: string; icon: React.ElementType }> = {
  conectado: { text: 'Conectado', color: 'text-success', icon: CheckCircle2 },
  open: { text: 'Conectado', color: 'text-success', icon: CheckCircle2 },
  close: { text: 'Desconectado', color: 'text-danger', icon: XCircle },
  connecting: { text: 'Conectando...', color: 'text-warning', icon: Loader2 }, // Mantém Loader2 para connecting
  error: { text: 'Erro', color: 'text-danger', icon: AlertTriangle },
  unknown: { text: 'Desconhecido', color: 'text-muted', icon: HelpCircle },
};

const getInstanceDisplayInfo = (status?: string) => {
  const s = status?.trim().toLowerCase();
  if (s === 'open') {
    return STATUS_DISPLAY_INFO.conectado;
  }
  return STATUS_DISPLAY_INFO[s || 'unknown'] || STATUS_DISPLAY_INFO.unknown;
}


export default function QRCodePage() {
  const [instanceName, setInstanceName] = useState('')
  const [qrCodeSrc, setQrCodeSrc] = useState<string | null>(null)
  const [loadingQr, setLoadingQr] = useState(false) // Renomeado de 'loading'
  const [timer, setTimer] = useState<number | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null) // Pode ser refatorado/removido em favor de userMessage
  const [userMessage, setUserMessage] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null); // Novo estado para mensagens do usuário
  const [history, setHistory] = useState<InstanceHistory[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const isMounted = useRef(false);

  // Novos estados
  const [allInstances, setAllInstances] = useState<InstanceDetail[]>([]);
  const [loadingInstancesList, setLoadingInstancesList] = useState(false);
  const [loadingGlobal, setLoadingGlobal] = useState(true); // Para o carregamento inicial da página
  const [currentOperationInstanceName, setCurrentOperationInstanceName] = useState<string | null>(null);
  const [lastActiveInstanceName, setLastActiveInstanceName] = useState<string | null>(null);
  const [loadingDisconnectInstanceName, setLoadingDisconnectInstanceName] = useState<string | null>(null); // Novo estado para desconexão

  // Definição da função getListButtonText
  const getListButtonText = (status: string | undefined): string => {
    const s = status?.trim().toLowerCase();
    switch (s) {
      case 'conectado':
        return "Gerenciar";
      case 'open':
        return "Ver QR Code";
      case 'close':
      case 'error':
      case 'unknown':
        return "Conectar";
      case 'connecting':
        return "Verificando...";
      default:
        return "Aguarde...";
    }
  };

  const WEBHOOK_URLS = {
    criar: 'https://n8n.ronnysenna.com.br/webhook/criar-instancia-evolution',
    atualizar: 'https://n8n.ronnysenna.com.br/webhook/atualizar-qr-code',
    status: 'https://n8n.ronnysenna.com.br/webhook/verificar-status-instancia',
    listar: 'https://n8n.ronnysenna.com.br/webhook/listar-instancias', // Nova URL
    desconectar: 'https://n8n.ronnysenna.com.br/webhook/desconectar-instancia' // URL para desconectar
  }

  const INSTANCE_HISTORY_KEY = 'evolutionInstanceHistory' // Renomeado
  const ALL_INSTANCES_KEY = 'evolutionAllInstancesCache' // Nova chave para cache de allInstances
  const LAST_ACTIVE_INSTANCE_KEY = 'evolutionLastActiveInstance'; // Para lembrar a última instância ativa

  const fetchAllInstances = useCallback(async () => {
    setLoadingInstancesList(true);
    setError(null); // Limpa erros anteriores específicos desta função
    try {
      const response = await fetch(WEBHOOK_URLS.listar);
      if (!response.ok) {
        let errorBody = '';
        try {
          errorBody = await response.text();
        } catch { /* ignora */ }
        throw new Error(`Erro ao buscar instâncias: ${response.status} ${response.statusText}. ${errorBody}`);
      }

      const data = await response.json();

      // Define uma interface para o item bruto da API para melhor tipagem
      interface RawInstanceItem {
        instanceName?: string;
        name?: string;
        status?: string;
        // Adicione quaisquer outros campos que possam vir da API
      }

      let instancesFromResult: RawInstanceItem[] = [];
      if (Array.isArray(data) && data.length > 0 && data[0].result && Array.isArray(data[0].result)) {
        instancesFromResult = data[0].result;
      } else if (Array.isArray(data)) {
        instancesFromResult = data;
      } else if (data.instances && Array.isArray(data.instances)) {
        instancesFromResult = data.instances;
      } else {
        console.error("Resposta de listar-instancias em formato inesperado:", data);
        throw new Error("Formato inesperado da lista de instâncias.");
      }

      const validInstances: InstanceDetail[] = instancesFromResult
        .map((inst: RawInstanceItem) => ({
          name: inst.instanceName || inst.name || '', // Garante que name seja sempre string
          status: inst.status?.trim().toLowerCase() || 'unknown', // Garante que status seja sempre string e minúsculo
        }))
        .filter(inst => typeof inst.name === 'string' && inst.name !== '' && typeof inst.status === 'string');

      setAllInstances(validInstances);
      return validInstances;
    } catch (fetchError) {
      const errorMessage = fetchError instanceof Error ? fetchError.message : String(fetchError);
      console.error('Erro ao buscar todas as instâncias:', fetchError);
      setError(`Falha ao carregar lista de instâncias: ${errorMessage.substring(0, 200)}`);
      // Não limpa allInstances aqui para permitir que a UI use dados do cache em caso de falha de fetch.
      // setAllInstances([]); // Removido
      return []; // Sinaliza que o fetch falhou, initializePage usará o cache para seleção se disponível.
    } finally {
      setLoadingInstancesList(false);
    }
  }, [WEBHOOK_URLS.listar]);


  const handleDisconnect = async (nameToDisconnect: string) => {
    console.log(`[handleDisconnect] Iniciando desconexão para: ${nameToDisconnect}`);
    setLoadingDisconnectInstanceName(nameToDisconnect);
    setError(null); // Limpa erros anteriores
    setUserMessage(null); // Limpa mensagens anteriores
    try {
      console.log(`[handleDisconnect] Chamando webhook: ${WEBHOOK_URLS.desconectar}`);
      const response = await fetch(WEBHOOK_URLS.desconectar, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instanceName: nameToDisconnect }),
      });

      console.log(`[handleDisconnect] Resposta recebida. Status: ${response.status}, OK: ${response.ok}`);

      if (!response.ok) {
        let errorBody = 'Erro desconhecido ao tentar desconectar.';
        try {
          const errorData = await response.json();
          errorBody = errorData.error || errorData.message || `Erro ${response.status}`;
        } catch (e) {
          errorBody = response.statusText || `Erro ${response.status}`;
        }
        console.error(`[handleDisconnect] Erro na resposta do webhook: ${errorBody}`);
        throw new Error(errorBody);
      }

      const responseData = await response.json().catch(() => ({})); // Tenta parsear JSON, mas não falha se não for JSON
      console.log('[handleDisconnect] Dados da resposta do webhook:', responseData);

      // Sucesso na desconexão
      console.log('[handleDisconnect] Atualizando UI para desconectado.');
      setUserMessage({ type: 'success', message: `Instância ${nameToDisconnect} desconectada com sucesso.` });
      setAllInstances(prev =>
        prev.map(inst =>
          inst.name === nameToDisconnect ? { ...inst, status: 'close' } : inst
        )
      );
      updateInstanceHistory(nameToDisconnect, false, 'disconnected');

      // Se a instância desconectada era a ativa, limpa a UI principal
      if (instanceName === nameToDisconnect) {
        console.log('[handleDisconnect] Instância desconectada era a ativa, limpando UI principal.');
        resetMainUIDisplayAndPolling();
        setCurrentOperationInstanceName(null);
      }

      // Opcional: pode-se chamar fetchAllInstances() para reconfirmar todos os status do servidor.
      // await fetchAllInstances();

    } catch (disconnectError) {
      const errorMessage = disconnectError instanceof Error ? disconnectError.message : String(disconnectError);
      console.error(`[handleDisconnect] Erro ao desconectar ${nameToDisconnect}:`, disconnectError);
      // setError(`Falha ao desconectar ${nameToDisconnect}: ${errorMessage.substring(0, 200)}`); // Substituído por setUserMessage
      setUserMessage({ type: 'error', message: `Falha ao desconectar ${nameToDisconnect}: ${errorMessage.substring(0, 200)}` });
    } finally {
      console.log(`[handleDisconnect] Finalizando desconexão para: ${nameToDisconnect}`);
      setLoadingDisconnectInstanceName(null);
    }
  };

  const updateInstanceHistory = useCallback((name: string, connected: boolean, statusOverride?: InstanceHistory['status']) => {
    const currentDate = new Date().toISOString()
    setHistory(prev => {
      const newHistory = prev.filter(h => h.name !== name)
      const newEntry: InstanceHistory = {
        name,
        lastConnected: currentDate,
        status: statusOverride || (connected ? 'connected' : 'disconnected')
      }
      // Mantém o histórico com as 5 entradas mais recentes
      return [newEntry, ...newHistory].slice(0, 5)
    })
  }, [])

  const startStatusCheck = useCallback((name: string) => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
    }
    setCurrentOperationInstanceName(name); // Garante que a instância sendo verificada é a "em operação"
    // setUserMessage(null); // Limpa mensagens ao iniciar uma nova verificação para uma instância

    const checkStatus = async () => {
      // Se o nome da instância em verificação não for mais o nome da instância em operação, para o polling.
      // Isso pode acontecer se o usuário selecionar outra instância ou limpar o painel.
      if (name !== currentOperationInstanceName && currentOperationInstanceName !== null) {
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }
        return;
      }

      try {
        const response = await fetch(WEBHOOK_URLS.status, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ instanceName: name }),
        });

        if (!response.ok) {
          // Se o status for 404, a instância pode não existir mais ou estar com problemas
          if (response.status === 404) {
            console.warn(`Instância ${name} não encontrada (404) ao verificar status.`);
            // setError(`Instância ${name} não encontrada. Pode ter sido removida ou está com erro.`); // Substituído
            setUserMessage({ type: 'error', message: `Instância ${name} não encontrada (404). Pode ter sido removida ou está com erro.` });
            setAllInstances(prev => prev.map(inst => inst.name === name ? { ...inst, status: 'error' } : inst));
            updateInstanceHistory(name, false, 'error');
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            setLoadingQr(false);
            setCurrentOperationInstanceName(null);
            return;
          }
          throw new Error(`Erro ao verificar status: ${response.status}`);
        }

        const responseText = await response.text();
        if (!responseText || !responseText.trim()) {
          console.log('Resposta de status vazia, tratando como não conectado.');
          // Não altera o status aqui, deixa o atualizar QR tentar.
          // Se o atualizar QR também falhar ou não retornar QR, o status será 'close' ou 'error'.
        } else {
          let statusData: QRCodeResponse;
          try {
            statusData = JSON.parse(responseText);
          } catch (e) {
            console.error('Erro ao fazer parse do status JSON:', e, "Resposta:", responseText);
            // Se não for JSON, mas contiver "conectado", trata como conectado
            if (responseText.toLowerCase().includes('conectado')) {
              statusData = { status: 'conectado' };
            } else {
              // Se não for JSON e não contiver "conectado", pode ser um QR code em texto puro (base64)
              if (responseText.startsWith('data:image/') || responseText.length > 200) { // Heurística para base64
                setQrCodeSrc(responseText.startsWith('data:image/') ? responseText : `data:image/png;base64,${responseText}`);
                setIsConnected(false);
                setAllInstances(prev => prev.map(inst => inst.name === name ? { ...inst, status: 'open' } : inst)); // Status 'open' pois tem QR
                updateInstanceHistory(name, false);
                return; // QR Code atualizado, continua polling
              }
              console.warn('Resposta de status não reconhecida:', responseText.substring(0, 100));
              return; // Não sabe o que fazer, mantém estado anterior e continua polling
            }
          }

          // Normaliza o status vindo de diferentes formatos de resposta
          const currentStatus = statusData.status?.trim().toLowerCase() || statusData.instance?.status?.trim().toLowerCase();

          if (currentStatus === 'conectado') {
            console.log(`Instância '${name}' conectada!`);
            setUserMessage({ type: 'success', message: `Instância ${name} conectada com sucesso!` });
            setIsConnected(true);
            setQrCodeSrc('/images/conectado.png');
            updateInstanceHistory(name, true);
            setAllInstances(prev => prev.map(inst => inst.name === name ? { ...inst, status: 'conectado' } : inst));
            if (timerIntervalRef.current) {
              clearInterval(timerIntervalRef.current);
              timerIntervalRef.current = null;
            }
            setLoadingQr(false); // Para o loading do QR principal
            setCurrentOperationInstanceName(null);
            return;
          } else if (currentStatus && currentStatus !== 'conectado') {
            // Se o status retornado for algo como 'open', 'close', 'connecting'
            setAllInstances(prev => prev.map(inst => inst.name === name ? { ...inst, status: currentStatus } : inst));
          }
        }

        // Se não conectado, tenta atualizar o QR code
        console.log(`Instância '${name}' não conectada (status atual via API: ${allInstances.find(i => i.name === name)?.status}). Tentando atualizar QR code...`);
        const updateResponse = await fetch(WEBHOOK_URLS.atualizar, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ instanceName: name }),
        });

        if (!updateResponse.ok) {
          if (updateResponse.status === 404) { // Instância pode não existir mais
            setError(`Falha ao atualizar QR para ${name}: Instância não encontrada.`);
            setAllInstances(prev => prev.map(inst => inst.name === name ? { ...inst, status: 'error' } : inst));
            updateInstanceHistory(name, false, 'error');
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            setLoadingQr(false);
            setCurrentOperationInstanceName(null);
            return;
          }
          throw new Error(`Erro ao atualizar QR code: ${updateResponse.status}`);
        }

        const contentType = updateResponse.headers.get('content-type');
        let qrUpdateData: QRCodeResponse = {};

        if (contentType?.includes('image/png')) {
          const arrayBuffer = await updateResponse.arrayBuffer();
          const base64 = Buffer.from(arrayBuffer).toString('base64');
          qrUpdateData = { qrCodeBase64: `data:image/png;base64,${base64}` };
        } else {
          const updateText = await updateResponse.text();
          if (updateText.match(/^data:image\/(png|jpeg|jpg|gif);base64,/)) {
            qrUpdateData = { qrCodeBase64: updateText };
          } else if (updateText.trim()) {
            try {
              qrUpdateData = JSON.parse(updateText);
            } catch (e) {
              // Se não for JSON, mas for uma string longa, assume que é base64 puro
              if (updateText.length > 200 && !updateText.includes(" ") && !updateText.includes("<")) {
                qrUpdateData = { qrCodeBase64: `data:image/png;base64,${updateText}` };
              } else {
                console.warn("Resposta de atualização de QR não reconhecida:", updateText.substring(0, 100));
                // Mantém o QR anterior ou nenhum se não houver
              }
            }
          }
        }

        const newQrSrc = qrUpdateData.qrcode || qrUpdateData.qrCodeBase64;
        if (newQrSrc) {
          setQrCodeSrc(newQrSrc);
          setIsConnected(false); // Garante que não está marcado como conectado se recebeu novo QR
          setUserMessage({ type: 'info', message: `QR Code para ${name} atualizado. Escaneie para conectar.` });
          console.log(`QR code para \'${name}\' atualizado.`);
          // Se recebeu um QR, o status da instância em allInstances deve ser \'open\' (pronta para escanear)
          setAllInstances(prev => prev.map(inst => inst.name === name ? { ...inst, status: 'open' } : inst));
          updateInstanceHistory(name, false);
        } else if (qrUpdateData.status === 'conectado') { // Caso raro, mas o endpoint de atualizar pode conectar
          setIsConnected(true);
          setQrCodeSrc('/images/conectado.png');
          setUserMessage({ type: 'success', message: `Instância ${name} conectada através da atualização.` });
          updateInstanceHistory(name, true);
          setAllInstances(prev => prev.map(inst => inst.name === name ? { ...inst, status: 'conectado' } : inst));
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          setCurrentOperationInstanceName(name);
        } else if (qrUpdateData.status) { // Se o endpoint de atualizar retornar um status
          setAllInstances(prev => prev.map(inst => inst.name === name ? { ...inst, status: qrUpdateData.status!.trim().toLowerCase() } : inst));
        } else {
          // Se não recebeu QR nem status 'conectado', e a instância não foi 404, pode ser 'close' ou um erro não capturado
          // Vamos assumir 'close' se não houver erro explícito, pois o QR não foi obtido.
          console.warn(`Não foi possível obter QR para ${name}, e não está conectada. Status pode ser 'close'.`);
          setAllInstances(prev => prev.map(inst => inst.name === name && inst.status !== 'error' ? { ...inst, status: 'close' } : inst));
        }

      } catch (statusError) {
        const errorMessage = statusError instanceof Error ? statusError.message : String(statusError);
        console.error(`Erro no ciclo de verificação de status/atualização de QR para ${name}:`, statusError);
        //setError(`Erro ao verificar/atualizar ${name}: ${errorMessage.substring(0,100)}`);
        // Não mostra mensagem de erro para cada falha de polling, apenas para erros terminais (como 404)
        // setUserMessage({ type: \'error\', message: `Erro no polling para ${name}: ${errorMessage.substring(0,100)}` });
        const currentInstance = allInstances.find(inst => inst.name === name);
        if (currentInstance && currentInstance.status !== 'error') {
          // Poderia definir um status temporário de 'unknown' ou 'connecting' se o erro for de rede
          // setAllInstances(prev => prev.map(inst => inst.name === name ? { ...inst, status: 'unknown' } : inst));
        }
      }
    };

    checkStatus(); // Primeira verificação imediata
    timerIntervalRef.current = setInterval(checkStatus, 7000); // Aumentado para 7s

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [WEBHOOK_URLS, updateInstanceHistory, allInstances, currentOperationInstanceName]);

  const handleSelectInstanceFromList = (selectedInstance: InstanceDetail) => {
    resetMainUIDisplayAndPolling();
    setInstanceName(selectedInstance.name);
    setCurrentOperationInstanceName(selectedInstance.name);
    setLastActiveInstanceName(selectedInstance.name);

    const status = selectedInstance.status?.trim().toLowerCase();

    if (status === 'conectado' || status === 'open') {
      setIsConnected(true);
      setQrCodeSrc('/images/conectado.png');
      setLoadingQr(false);
      // Garante que o status em allInstances seja 'conectado' se era 'open' para consistência visual imediata na lista
      setAllInstances(prev => prev.map(inst => inst.name === selectedInstance.name ? { ...inst, status: 'conectado' } : inst));
    } else if (status === 'close' || status === 'error' || status === 'unknown') {
      initiateConnectionProcess(selectedInstance.name);
    } else if (status === 'connecting') {
      // Se estiver 'connecting', já deve haver um polling em andamento ou será iniciado.
      // A UI principal (QR code area) deve refletir isso (loadingQr).
      setLoadingQr(true); // Mostra loading na área principal do QR
      // Se não houver polling para esta instância, inicia um.
      // Isso pode acontecer se o usuário selecionou uma instância que estava 'connecting' mas não era a 'currentOperationInstanceName'.
      if (!timerIntervalRef.current || currentOperationInstanceName !== selectedInstance.name) {
        startStatusCheck(selectedInstance.name);
      }
    }
    // Outros status podem não fazer nada ou ter comportamento específico.
  };


  const initiateConnectionProcess = useCallback(async (nameToProcess: string) => {
    if (!nameToProcess.trim()) {
      // setError("O nome da instância não pode estar vazio."); // Substituído
      setUserMessage({
        type: 'error', message: 'O nome da instância não pode estar vazio.'
      }); // Corrigido aqui
      return;
    }
    setLoadingQr(true);
    setQrCodeSrc(null);
    setIsConnected(false);
    setError(null); // Limpa erro legado
    setUserMessage(null); // Limpa mensagens
    setCurrentOperationInstanceName(nameToProcess);
    setInstanceName(nameToProcess);
    setLastActiveInstanceName(nameToProcess);

    const instanceExists = allInstances.find(inst => inst.name === nameToProcess);
    const currentStatus = instanceExists?.status?.trim().toLowerCase();
    let endpointToCall = '';
    let isCreatingNewInstance = false;

    if (currentStatus === 'conectado' || currentStatus === 'open') {
      setIsConnected(true);
      setQrCodeSrc('/images/conectado.png');
      updateInstanceHistory(nameToProcess, true);
      setAllInstances(prev => prev.map(inst => inst.name === nameToProcess ? { ...inst, status: 'conectado' } : inst));
      setLoadingQr(false);
      return;
    }

    // Se a instância existe e não está conectada (open, close, error, unknown, connecting), tenta atualizar/obter QR.
    // Se não existe, tenta criar.
    if (instanceExists) {
      endpointToCall = WEBHOOK_URLS.atualizar;
      // Atualiza o status para 'connecting' otimisticamente
      setAllInstances(prev => prev.map(inst => inst.name === nameToProcess ? { ...inst, status: 'connecting' } : inst));
    } else {
      endpointToCall = WEBHOOK_URLS.criar;
      isCreatingNewInstance = true;
      // Adiciona otimisticamente à lista com status 'connecting'
      // setAllInstances(prev => [...prev, { name: nameToProcess, status: 'connecting' }]);
      // É melhor esperar a resposta da criação antes de adicionar, ou deixar fetchAllInstances cuidar disso.
    }

    // Se o status for 'connecting', já pode haver um polling. A chamada abaixo pode ser redundante
    // mas garante que o processo de obtenção de QR seja (re)iniciado.
    // Se já estiver 'connecting', a UI já deve estar mostrando isso.
    // A chamada abaixo irá buscar um novo QR ou o status.

    try {
      const response = await fetch(endpointToCall, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instanceName: nameToProcess }),
      });

      let data: QRCodeResponse = {};
      const contentType = response.headers.get('content-type');

      if (contentType?.includes('image/png')) {
        const arrayBuffer = await response.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        data = { qrCodeBase64: `data:image/png;base64,${base64}` };
      } else {
        const responseText = await response.text();
        if (responseText.match(/^data:image\/(png|jpeg|jpg|gif);base64,/)) {
          data = { qrCodeBase64: responseText };
        } else if (responseText.trim()) {
          try {
            data = JSON.parse(responseText);
          } catch (e) {
            // Se não for JSON, mas for uma string longa, assume que é base64 puro
            if (responseText.length > 200 && !responseText.includes(" ") && !responseText.includes("<")) {
              data = { qrCodeBase64: `data:image/png;base64,${responseText}` };
            } else if (responseText.toLowerCase().includes("conectado")) { // Resposta de criar pode ser texto simples
              data = { status: "conectado" };
            } else {
              throw new Error(`Formato de resposta inválido do servidor (${endpointToCall.split('/').pop()}). Resposta: ${responseText.substring(0, 100)}`);
            }
          }
        }
      }

      if (!response.ok) {
        // Se data.error não existir, usa response.statusText ou uma mensagem genérica
        const errorMsg = data.error || response.statusText || `Erro ${response.status}`;
        throw new Error(`Falha na operação (${endpointToCall.split('/').pop()}): ${errorMsg}`);
      }
      if (data.error) throw new Error(data.error);

      const receivedQrSrc = data.qrcode || data.qrCodeBase64;
      if (receivedQrSrc) {
        setQrCodeSrc(receivedQrSrc);
        setIsConnected(false);
        setUserMessage({ type: 'info', message: `QR Code para ${nameToProcess} gerado/atualizado. Escaneie para conectar.` });
        startStatusCheck(nameToProcess);
        // Atualiza status em allInstances para \'open\' pois um QR foi gerado/atualizado
        setAllInstances(prev => {
          const existing = prev.find(i => i.name === nameToProcess);
          if (existing) {
            return prev.map(i => i.name === nameToProcess ? { ...i, status: 'open' } : i);
          }
          // Se estava criando e recebeu QR, adiciona à lista com status 'open'
          return [...prev, { name: nameToProcess, status: 'open' }];
        });
        updateInstanceHistory(nameToProcess, false);
      } else if (data.status === 'conectado' || (data.instance && data.instance.status === 'conectado')) {
        setIsConnected(true);
        setQrCodeSrc('/images/conectado.png');
        setUserMessage({ type: 'success', message: `Instância ${nameToProcess} conectada com sucesso!` });
        updateInstanceHistory(nameToProcess, true);
        setAllInstances(prev => {
          const existing = prev.find(i => i.name === nameToProcess);
          if (existing) {
            return prev.map(i => i.name === nameToProcess ? { ...i, status: 'conectado' } : i);
          }
          // Se estava criando e conectou direto, adiciona à lista
          return [...prev, { name: nameToProcess, status: 'conectado' }];
        });
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current); // Para polling se conectou direto
      } else {
        // Se não recebeu QR nem conectou, o status pode ser 'close' ou 'error' dependendo da resposta
        // Se a API de criar/atualizar retornar um status específico, usar esse.
        const returnedStatus = data.status?.trim().toLowerCase() || data.instance?.status?.trim().toLowerCase();
        if (returnedStatus && returnedStatus !== 'conectado') {
          setAllInstances(prev => prev.map(inst => inst.name === nameToProcess ? { ...inst, status: returnedStatus } : inst));
        } else {
          // Fallback se não houver QR nem status claro de conectado/erro da API
          setAllInstances(prev => prev.map(inst => inst.name === nameToProcess ? { ...inst, status: 'close' } : inst));
        }
        // Não inicia o status check aqui se não recebeu QR, pois pode não haver nada para verificar ainda.
        // O usuário pode precisar tentar novamente.
        // setError(\'Não foi possível obter o QR Code. Tente novamente.\'); // Removido para não ser muito agressivo
        // setUserMessage({ type: \'info\', message: `Tentando obter QR Code para ${nameToProcess}...` }); // Mensagem mais neutra
        console.warn("Resposta inválida do servidor ou falha ao obter QR, status pode ser \'close\' ou \'error\'. Resposta:", data);
      }

    } catch (opError) {
      const errorMessage = opError instanceof Error ? opError.message : String(opError);
      console.error(`Erro ao iniciar processo para ${nameToProcess}:`, opError);
      // setError(errorMessage.substring(0, 300)); // Substituído
      setUserMessage({ type: 'error', message: `Erro ao processar ${nameToProcess}: ${errorMessage.substring(0, 300)}` });
      // Se deu erro, o status da instância pode ser \'error\'
      setAllInstances(prev => {
        const existing = prev.find(i => i.name === nameToProcess);
        if (existing) {
          return prev.map(inst => inst.name === nameToProcess ? { ...inst, status: 'error' } : inst);
        }
        // Se estava criando e deu erro, adiciona com status 'error' para feedback
        return [...prev, { name: nameToProcess, status: 'error' }];
      });
      updateInstanceHistory(nameToProcess, false, 'error');
    } finally {
      setLoadingQr(false);
      // Não limpa currentOperationInstanceName aqui, startStatusCheck pode precisar dele
      // Limpar em startStatusCheck quando conectado ou se der erro final.
    }
  }, [allInstances, WEBHOOK_URLS, startStatusCheck, updateInstanceHistory, fetchAllInstances, currentOperationInstanceName]);


  const resetMainUIDisplayAndPolling = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setTimer(null);
    setQrCodeSrc(null);
    setIsConnected(false);
    setError(null);
    setLoadingQr(false);
    // Não limpa instanceName aqui intencionalmente
    // setCurrentOperationInstanceName(null); // Não limpar aqui, pois pode ser chamado ao mudar o input
  }, []);

  const handleClearAll = useCallback(() => {
    resetMainUIDisplayAndPolling();
    setInstanceName('');
    setCurrentOperationInstanceName(null);
    setLastActiveInstanceName(null);
    localStorage.removeItem(LAST_ACTIVE_INSTANCE_KEY);
    // Não limpa allInstances ou history (são persistentes/carregados no início)
  }, [resetMainUIDisplayAndPolling]);


  // Efeito de Inicialização da Página
  useEffect(() => {
    const initializePage = async () => {
      setLoadingGlobal(true);
      isMounted.current = false; // Reset isMounted for initialization logic

      let cachedData: InstanceDetail[] = [];
      const cachedAllInstancesString = localStorage.getItem(ALL_INSTANCES_KEY);
      if (cachedAllInstancesString) {
        try {
          cachedData = JSON.parse(cachedAllInstancesString);
          if (Array.isArray(cachedData)) {
            setAllInstances(cachedData);
          } else {
            localStorage.removeItem(ALL_INSTANCES_KEY); // Cache inválido
          }
        } catch (e) {
          console.error('Erro ao carregar allInstances do cache:', e);
          localStorage.removeItem(ALL_INSTANCES_KEY);
        }
      }

      const fetchedInstances = await fetchAllInstances(); // Sempre busca do servidor para ter dados frescos

      const finalInstances = fetchedInstances.length > 0 ? fetchedInstances : cachedData;

      const savedHistoryString = localStorage.getItem(INSTANCE_HISTORY_KEY);
      if (savedHistoryString) {
        try {
          const localHistory = JSON.parse(savedHistoryString);
          if (Array.isArray(localHistory)) setHistory(localHistory);
        } catch (e) { console.error('Erro ao carregar histórico do localStorage:', e); }
      }

      const lastActive = localStorage.getItem(LAST_ACTIVE_INSTANCE_KEY);
      if (lastActive) {
        setLastActiveInstanceName(lastActive);
      }

      let activeInstanceSet = false;
      // Usa finalInstances (dados do fetch ou cache) para determinar a seleção automática.
      // allInstances (estado React) já foi atualizado por fetchAllInstances (se bem-sucedido) ou manteve o cache.
      const instancesToConsiderForAutoSelection = finalInstances.length > 0 ? finalInstances : (cachedData.length > 0 ? cachedData : []);

      if (instancesToConsiderForAutoSelection.length > 0) {
        const connectedOrOpenInstance = instancesToConsiderForAutoSelection.find(inst => inst.status === 'conectado' || inst.status === 'open');
        let instanceToAutoSelect: InstanceDetail | undefined = connectedOrOpenInstance;

        if (!instanceToAutoSelect && lastActive) {
          const lastActiveInstance = instancesToConsiderForAutoSelection.find(inst => inst.name === lastActive);
          // Só seleciona a última ativa se ela não estiver já conectada/open (já coberto por connectedOrOpenInstance)
          if (lastActiveInstance && lastActiveInstance.status !== 'conectado' && lastActiveInstance.status !== 'open') {
            instanceToAutoSelect = lastActiveInstance;
          }
        }

        if (!instanceToAutoSelect) {
          instanceToAutoSelect = instancesToConsiderForAutoSelection.find(inst => inst.status === 'close');
        }
        // Fallback para a primeira da lista se nenhuma das anteriores
        if (!instanceToAutoSelect && instancesToConsiderForAutoSelection.length > 0) {
          // instanceToAutoSelect = instancesToConsider[0]; // Comentado para não selecionar automaticamente qualquer uma
        }

        if (instanceToAutoSelect) {
          setInstanceName(instanceToAutoSelect.name);
          setCurrentOperationInstanceName(instanceToAutoSelect.name);
          setLastActiveInstanceName(instanceToAutoSelect.name);
          activeInstanceSet = true;

          if (instanceToAutoSelect.status === 'conectado' || instanceToAutoSelect.status === 'open') {
            setQrCodeSrc('/images/conectado.png');
            setIsConnected(true);
            // Atualiza o estado em allInstances para refletir 'conectado' se era 'open'
            setAllInstances(prev => prev.map(inst => inst.name === instanceToAutoSelect!.name ? { ...inst, status: 'conectado' } : inst));
          } else if (instanceToAutoSelect.status === 'close' || instanceToAutoSelect.status === 'error' || instanceToAutoSelect.status === 'unknown') {
            // Não inicia conexão automaticamente na carga para 'close', 'error', 'unknown'
            // Apenas prepara a UI para uma ação do usuário
            setQrCodeSrc(null); // Limpa QR antigo
            setIsConnected(false);
          } else if (instanceToAutoSelect.status === 'connecting') {
            // Se estiver 'connecting', inicia a verificação de status
            setLoadingQr(true);
            startStatusCheck(instanceToAutoSelect.name);
          }
        } else if (!activeInstanceSet && allInstances.length > 0) {
          // Fallback para a primeira instância da lista se nenhuma outra lógica de seleção se aplicar
          // e nenhuma instância foi definida ainda.
          const firstInstance = allInstances[0];
          setInstanceName(firstInstance.name);
          setCurrentOperationInstanceName(firstInstance.name);
          setLastActiveInstanceName(firstInstance.name);
          if (firstInstance.status === 'conectado' || firstInstance.status === 'open') {
            setQrCodeSrc('/images/conectado.png');
            setIsConnected(true);
            setAllInstances(prev => prev.map(inst => inst.name === firstInstance.name ? { ...inst, status: 'conectado' } : inst));
          } else if (firstInstance.status === 'connecting') {
            setLoadingQr(true);
            startStatusCheck(firstInstance.name);
          } else {
            // Para 'close', 'error', 'unknown', apenas seleciona, não inicia conexão.
            setQrCodeSrc(null);
            setIsConnected(false);
          }
        }
      }
      setLoadingGlobal(false);
    };

    initializePage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchAllInstances]); // fetchAllInstances é useCallback

  // Efeito para limpar mensagens de usuário após 5 segundos
  useEffect(() => {
    if (userMessage) {
      const messageTimer = setTimeout(() => {
        setUserMessage(null);
      }, 5000); // Mensagem desaparece após 5 segundos
      return () => clearTimeout(messageTimer);
    }
  }, [userMessage]);

  // Salvar histórico no localStorage
  useEffect(() => {
    if (isMounted.current) { // Evita salvar na montagem inicial antes de carregar
      localStorage.setItem(INSTANCE_HISTORY_KEY, JSON.stringify(history));
    } else {
      isMounted.current = true;
    }
  }, [history]);

  // Salvar allInstances no localStorage
  useEffect(() => {
    if (isMounted.current && allInstances.length > 0) {
      localStorage.setItem(ALL_INSTANCES_KEY, JSON.stringify(allInstances));
    } else if (isMounted.current && allInstances.length === 0) {
      // Se a lista ficar vazia após montagem (ex: todas instâncias removidas externamente e fetchAllInstances retorna vazio)
      // então removemos o cache para não carregar uma lista vazia antiga na próxima vez.
      localStorage.removeItem(ALL_INSTANCES_KEY);
    }
  }, [allInstances]);

  // Salvar última instância ativa
  useEffect(() => {
    if (isMounted.current && lastActiveInstanceName) {
      localStorage.setItem(LAST_ACTIVE_INSTANCE_KEY, lastActiveInstanceName);
    }
  }, [lastActiveInstanceName]);


  if (loadingGlobal) {
    return (
      <div className="container text-center py-5">
        <Loader2 className="animate-spin me-2" size={48} />
        <p className="mt-2">Carregando configurações da página...</p>
      </div>
    );
  }

  return (
    <div className="container pb-5"> {/* Adicionado padding bottom */}
      <div className="card mb-4">
        <div className="card-body">
          <h1 className="display-6 fw-bold mb-4">Gerenciador de Instâncias WhatsApp</h1>

          {error && ( // Mantido por enquanto, para erros não cobertos por userMessage ou para depuração
            <div className="alert alert-danger d-flex align-items-center mb-4" role="alert">
              <AlertCircle className="me-2 flex-shrink-0" />
              <small>{error}</small>
            </div>
          )}

          {userMessage && (
            <div className={`alert alert-${userMessage.type === 'error' ? 'danger' : userMessage.type === 'success' ? 'success' : 'info'} d-flex align-items-center mb-4 alert-dismissible fade show`} role="alert">
              {userMessage.type === 'success' && <CheckCircle2 className="me-2 flex-shrink-0" />}
              {userMessage.type === 'error' && <AlertTriangle className="me-2 flex-shrink-0" />}
              {userMessage.type === 'info' && <Info className="me-2 flex-shrink-0" />}
              <small>{userMessage.message}</small>
              <button type="button" className="btn-close" onClick={() => setUserMessage(null)} aria-label="Close"></button>
            </div>
          )}

          {/* Removido o alerta de conectado específico, pois userMessage cobrirá isso */}
          {/* {isConnected && instanceName === currentOperationInstanceName && qrCodeSrc === '/images/conectado.png' && ( ... )} */}

          <div className="mb-3"> {/* Reduzido mb-4 para mb-3 */}
            <label htmlFor="instanceNameInput" className="form-label">
              Nome da Instância
            </label>
            <input
              id="instanceNameInput"
              type="text"
              value={instanceName}
              onChange={(e) => {
                setInstanceName(e.target.value);
                // Se o nome mudar, reseta o estado de QR/conexão da instância anterior
                // mas não limpa currentOperationInstanceName se o novo nome for uma instância existente
                // A seleção da lista ou o clique no botão principal definirão currentOperationInstanceName
                if (e.target.value !== currentOperationInstanceName) {
                  // resetMainUIDisplayAndPolling(); // Chamada movida para ser mais granular
                  if (timerIntervalRef.current && currentOperationInstanceName !== e.target.value) {
                    clearInterval(timerIntervalRef.current);
                    timerIntervalRef.current = null;
                  }
                  setQrCodeSrc(null);
                  setIsConnected(false);
                  // setError(null); // Não limpa erro global ao digitar
                  setLoadingQr(false);
                }
              }}
              className="form-control product-form-input"
              placeholder="Digite ou selecione uma instância"
              disabled={loadingQr}
            />
          </div>

          <div className="d-flex flex-column flex-sm-row gap-2 mb-3"> {/* gap-3 para gap-2, mb-4 para mb-3 */}
            <button
              onClick={() => initiateConnectionProcess(instanceName)}
              className="btn btn-primary flex-grow-1 d-flex align-items-center justify-content-center gap-2 py-2 hover-scale"
              disabled={loadingQr && instanceName === currentOperationInstanceName || (isConnected && instanceName === currentOperationInstanceName && qrCodeSrc === '/images/conectado.png')}
            >
              {loadingQr && instanceName === currentOperationInstanceName ? (
                <>
                  <Loader2 className="animate-spin me-2" size={18} />
                  <span>Processando \'{instanceName}\'...</span>
                </>
              ) : (
                <>
                  <QrCodeIcon size={18} />
                  <span>
                    {allInstances.find(inst => inst.name === instanceName) ?
                      (allInstances.find(inst => inst.name === instanceName)?.status === 'conectado' ? 'Verificar Conexão' : 'Conectar / Atualizar QR') :
                      'Criar e Conectar'}
                  </span>
                </>
              )}
            </button>

            <button
              onClick={handleClearAll}
              className="btn btn-light flex-grow-1 d-flex align-items-center justify-content-center gap-2 py-2 hover-scale"
              disabled={loadingQr}
            >
              <Trash2 size={18} />
              <span>Limpar Painel</span>
            </button>
          </div>

          {/* Exibição do QR Code ou Imagem de Conectado */}
          {/* Mostra apenas se a instância em operação é a mesma no input */}
          {(loadingQr || qrCodeSrc) && instanceName === currentOperationInstanceName && (
            <div className={`mt-3 qr-code-wrapper text-center p-3 rounded ${isConnected && qrCodeSrc === '/images/conectado.png' ? 'bg-light' : 'bg-white border'}`}>
              {loadingQr && !qrCodeSrc && (
                <div className="d-flex flex-column align-items-center justify-content-center py-5">
                  <Loader2 className="animate-spin text-primary mb-2" size={48} />
                  <p>Obtendo QR Code para <strong>{currentOperationInstanceName}</strong>...</p>
                </div>
              )}
              {qrCodeSrc && (
                <Image
                  key={isConnected ? `connected-${currentOperationInstanceName}` : qrCodeSrc} // Chave única para forçar recarregamento
                  src={qrCodeSrc}
                  alt={isConnected && qrCodeSrc === '/images/conectado.png' ? `Instância ${currentOperationInstanceName} Conectada` : "Escaneie o QR Code"}
                  width={256}
                  height={256}
                  className="img-fluid rounded animate-slide-in"
                  priority={!isConnected || qrCodeSrc !== '/images/conectado.png'} // Prioriza carregamento do QR code
                  unoptimized={qrCodeSrc.startsWith('data:image')}
                />
              )}
            </div>
          )}

          {/* Seção de Instâncias Salvas */}
          <div className="card mt-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0 d-flex align-items-center">
                <ListChecks className="me-2" /> Instâncias Salvas
              </h5>
              <button
                onClick={() => fetchAllInstances()}
                className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1" // Estilo melhorado
                disabled={loadingInstancesList}
              >
                {loadingInstancesList ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <RefreshCw size={16} />
                )}
                Atualizar Lista
              </button>
            </div>
            <div className="list-group list-group-flush">
              {loadingInstancesList && allInstances.length === 0 ? (
                <div className="list-group-item text-center p-3">
                  <Loader2 className="animate-spin me-2" /> Carregando instâncias...
                </div>
              ) : allInstances.length > 0 ? (
                allInstances.map((instance) => {
                  const displayInfo = getInstanceDisplayInfo(instance.status);
                  const IconComponent = displayInfo.icon;
                  return (
                    <div
                      key={instance.name}
                      className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${instance.name === instanceName ? 'active-instance' : ''}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleSelectInstanceFromList(instance)}
                    >
                      <div className="flex-grow-1">
                        <span className="fw-bold">{instance.name}</span>
                        <small className={`ms-2 ${displayInfo.color} d-flex align-items-center`}>
                          <IconComponent className="me-1" size={14} />
                          {displayInfo.text}
                        </small>
                      </div>
                      <div className="btn-group ms-2" role="group">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectInstanceFromList(instance);
                          }}
                          className={`btn btn-sm ${instance.status === 'conectado' || instance.status === 'open'
                            ? 'btn-outline-success'
                            : instance.status === 'close' || instance.status === 'error' || instance.status === 'unknown'
                              ? 'btn-outline-primary'
                              : 'btn-outline-secondary'
                            }`}
                          disabled={(loadingQr && currentOperationInstanceName === instance.name) || loadingDisconnectInstanceName === instance.name}
                        >
                          {getListButtonText(instance.status)}
                        </button>
                        {(instance.status === 'conectado' || instance.status === 'open') && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDisconnect(instance.name);
                            }}
                            className="btn btn-sm btn-outline-danger d-flex align-items-center"
                            disabled={loadingDisconnectInstanceName === instance.name}
                          >
                            {loadingDisconnectInstanceName === instance.name ? (
                              <Loader2 className="animate-spin" size={14} />
                            ) : (
                              <XCircle size={14} />
                            )}
                            <span className="ms-1">Desconectar</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="list-group-item text-center p-3">
                  Nenhuma instância encontrada.
                </div>
              )}
            </div>
          </div>


          {/* Botão de Histórico */}
          <div className="mt-4 text-center">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="btn btn-outline-info btn-sm" // Estilo melhorado
            >
              <History size={16} className="me-1" />
              {showHistory ? 'Ocultar Histórico' : 'Mostrar Histórico de Conexões'}
            </button>
          </div>

          {/* Histórico de Conexões */}
          {showHistory && (
            <div className="mt-3">
              {history.length > 0 ? (
                <ul className="list-group list-group-flush shadow-sm">
                  {history.map((h, index) => (
                    <li key={index} className="list-group-item text-muted small">
                      <strong>{h.name}</strong> - {h.status === 'connected' ? 'Conectado' : (h.status === 'error' ? 'Erro' : 'Desconectado')} em: {new Date(h.lastConnected).toLocaleString()}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted small">Nenhum histórico recente.</p>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
