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
  cancelAiTyping: () => void;
}

export function useInterviewWs(
  sessionId: string | null,
  onMessage: (msg: ChatMessage) => void
): UseInterviewWsReturn {
  const wsRef = useRef<WebSocket | null>(null);
  const [wsStatus, setWsStatus] = useState<WsStatus>("connecting");
  const [isAiTyping, setIsAiTyping] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onMessageRef = useRef(onMessage);
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  const cancelAiTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    setIsAiTyping(false);
  }, []);

  useEffect(() => {
    if (!sessionId) return;

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("archon_access_token")
        : null;

    if (!token) {
      console.warn("[WS] No access token — skipping connection.");
      setWsStatus("error");
      return;
    }

    let active = true;
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

    const connect = () => {
      if (!active) return;

      const url = buildChatWsUrl(sessionId);
      console.log("[WS] Connecting to:", url);
      const ws = new WebSocket(url);
      wsRef.current = ws;
      setWsStatus("connecting");

      ws.onopen = () => {
        if (!active) {
          ws.close();
          return;
        }
        console.log("[WS] Connection opened successfully");
        setWsStatus("open");
      };

      ws.onclose = (event) => {
        if (!active) return;
        console.log("[WS] Connection closed:", event.code, event.reason);
        setWsStatus("closed");
        cancelAiTyping();

        // Auto-reconnect after 3 seconds if not deliberately unmounted
        if (active) {
          reconnectTimeout = setTimeout(() => {
            if (active) connect();
          }, 3000);
        }
      };

      ws.onerror = (err) => {
        if (!active) return;
        console.error("[WS] Connection error:", err);
        setWsStatus("error");
        cancelAiTyping();
      };

      ws.onmessage = (event: MessageEvent) => {
        if (!active) return;

        const rawData = typeof event.data === "string" ? event.data : "";
        console.log("[WS Received]:", rawData);

        let extractedText: string | null = null;

        try {
          const parsed = JSON.parse(rawData);

          if (parsed && typeof parsed === "object") {
            // Ignore echoes of our own user messages
            if (parsed.role === "user" || parsed.sender === "user") {
              return;
            }

            extractedText =
              parsed.content ||
              parsed.response ||
              parsed.text ||
              parsed.message ||
              (typeof parsed.data === "string"
                ? parsed.data
                : parsed.data?.content || parsed.data?.response) ||
              null;
          }
        } catch {
          if (rawData.trim()) {
            extractedText = rawData.trim();
          }
        }

        if (extractedText) {
          cancelAiTyping();

          const aiMsg: ChatMessage = {
            id: `ai-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            sender: "ai",
            text: extractedText,
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          };
          onMessageRef.current(aiMsg);
        }
      };
    };

    connect();

    return () => {
      active = false;
      cancelAiTyping();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [sessionId, cancelAiTyping]);

  const send = useCallback(<T>(type: WsOutgoingType, data: T): boolean => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.warn(`[WS] Cannot send "${type}" — not open (state=${ws?.readyState})`);
      return false;
    }
    const envelope: WsEnvelope<T> = { type, data };
    console.log("[WS Sent]:", envelope);
    ws.send(JSON.stringify(envelope));
    return true;
  }, []);

  const sendChat = useCallback(
    (text: string) => {
      const sent = send<string>("chat", text);
      if (sent) {
        setIsAiTyping(true);

        // Safety timeout: 25 seconds
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          setIsAiTyping(false);
          onMessageRef.current({
            id: `ai-timeout-${Date.now()}`,
            sender: "ai",
            text: "The AI interviewer took too long to respond. The system may still be processing your previous answer, or you can try sending your clarification again.",
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          });
        }, 25000);
      } else {
        cancelAiTyping();
      }
    },
    [send, cancelAiTyping]
  );

  const sendNodeEvent = useCallback(
    (type: "node_added" | "node_updated", data: WsNodeData) => {
      send<WsNodeData>(type, data);
    },
    [send]
  );

  const sendNodeDeleted = useCallback(
    (id: string) => {
      send<WsNodeDeletedData>("node_deleted", { id });
    },
    [send]
  );

  const sendEdgeEvent = useCallback(
    (type: "edge_added" | "edge_updated", data: WsEdgeData) => {
      send<WsEdgeData>(type, data);
    },
    [send]
  );

  const sendEdgeDeleted = useCallback(
    (id: string) => {
      send<WsEdgeDeletedData>("edge_deleted", { id });
    },
    [send]
  );

  return {
    wsStatus,
    sendChat,
    sendNodeEvent,
    sendNodeDeleted,
    sendEdgeEvent,
    sendEdgeDeleted,
    isAiTyping,
    cancelAiTyping,
  };
}
