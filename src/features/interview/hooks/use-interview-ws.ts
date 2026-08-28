"use client";


import { useEffect, useRef, useCallback, useState } from "react";
import { buildChatWsUrl } from "../api/interview";
import type {
  WsEnvelope,
  WsOutgoingType,
  WsNodeData,
  WsNodeDeletedData,
  WsEdgeData,
  WsEdgeDeletedData,
  WsIncomingMessage,
  ChatMessage,
} from "../types";

export type WsStatus = "connecting" | "open" | "closed" | "error";

export interface UseInterviewWsReturn {
  wsStatus: WsStatus;
  sendChat: (text: string) => void;
  sendNodeEvent: (type: "node_added" | "node_updated", data: WsNodeData) => void;
  sendNodeDeleted: (id: string) => void;
  sendEdgeEvent: (type: "edge_added" | "edge_updated", data: WsEdgeData) => void;
  sendEdgeDeleted: (id: string) => void;
  isAiTyping: boolean;
}

export function useInterviewWs(
  sessionId: string | null,
  onMessage: (msg: ChatMessage) => void
): UseInterviewWsReturn {
  const wsRef = useRef<WebSocket | null>(null);
  const [wsStatus, setWsStatus] = useState<WsStatus>("connecting");
  const [isAiTyping, setIsAiTyping] = useState(false);

  // Keep onMessage stable via ref
  const onMessageRef = useRef(onMessage);
  useEffect(() => { onMessageRef.current = onMessage; }, [onMessage]);

  // Connect / Disconnect
  useEffect(() => {
    if (!sessionId) return;

    const token = typeof window !== "undefined"
      ? localStorage.getItem("archon_access_token")
      : null;

    if (!token) {
      console.warn("[WS] No access token found — skipping WebSocket connection.");
      setWsStatus("error");
      return;
    }

    const url = buildChatWsUrl(sessionId);
    const ws = new WebSocket(url);
    wsRef.current = ws;
    setWsStatus("connecting");

    ws.onopen = () => setWsStatus("open");

    ws.onclose = () => {
      setWsStatus("closed");
      setIsAiTyping(false);
    };

    ws.onerror = () => {
      setWsStatus("error");
      setIsAiTyping(false);
    };

    ws.onmessage = (event: MessageEvent) => {
      try {
        const parsed: WsIncomingMessage = JSON.parse(event.data as string);

        if (parsed.role === "ai" && parsed.content) {
          setIsAiTyping(false);
          const aiMsg: ChatMessage = {
            id: `ai-${Date.now()}`,
            sender: "ai",
            text: parsed.content,
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          };
          onMessageRef.current(aiMsg);
        }
      } catch {
        const raw = event.data as string;
        if (raw?.trim()) {
          setIsAiTyping(false);
          onMessageRef.current({
            id: `ai-raw-${Date.now()}`,
            sender: "ai",
            text: raw,
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          });
        }
      }
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [sessionId]);

  //Internal send helper
  const send = useCallback(<T>(type: WsOutgoingType, data: T) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.warn(`[WS] Cannot send "${type}" — socket not open (state=${ws?.readyState})`);
      return;
    }
    const envelope: WsEnvelope<T> = { type, data };
    ws.send(JSON.stringify(envelope));
  }, []);

  const sendChat = useCallback((text: string) => {
    setIsAiTyping(true);
    send<string>("chat", text);
  }, [send]);

  const sendNodeEvent = useCallback(
    (type: "node_added" | "node_updated", data: WsNodeData) => {
      send<WsNodeData>(type, data);
    },
    [send]
  );

  const sendNodeDeleted = useCallback((id: string) => {
    send<WsNodeDeletedData>("node_deleted", { id });
  }, [send]);

  const sendEdgeEvent = useCallback(
    (type: "edge_added" | "edge_updated", data: WsEdgeData) => {
      send<WsEdgeData>(type, data);
    },
    [send]
  );


  const sendEdgeDeleted = useCallback((id: string) => {
    send<WsEdgeDeletedData>("edge_deleted", { id });
  }, [send]);

  return {
    wsStatus,
    sendChat,
    sendNodeEvent,
    sendNodeDeleted,
    sendEdgeEvent,
    sendEdgeDeleted,
    isAiTyping,
  };
}
