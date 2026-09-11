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
  reconnect: () => void;
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

  const connectRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (!sessionId) return;

    let active = true;
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

    const tryRefreshToken = async () => {
      if (typeof window === "undefined") return;
      const refreshToken = localStorage.getItem("archon_refresh_token");
      if (!refreshToken) return;

      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
        const res = await fetch(`${apiBaseUrl}/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refreshToken }),
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json().catch(() => null);
          const newAccessToken =
            data?.access_token ||
            data?.data?.access_token ||
            data?.accessToken;
          if (newAccessToken) {
            localStorage.setItem("archon_access_token", newAccessToken);
            console.log("[WS] Refreshed token successfully for WebSocket");
          }
        }
      } catch {
        // ignore
      }
    };

    const connect = () => {
      if (!active) return;

      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("archon_access_token")
          : null;

      if (!token) {
        console.warn("[WS] No access token — attempting token refresh before connect");
        tryRefreshToken().then(() => {
          if (active && localStorage.getItem("archon_access_token")) {
            connect();
          } else {
            setWsStatus("error");
          }
        });
        return;
      }

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
        console.log("[WS] Connected successfully");
        setWsStatus("open");
      };

      ws.onclose = (event) => {
        if (!active) return;
        console.log("[WS] Connection closed:", event.code, event.reason);
        setWsStatus("closed");
        cancelAiTyping();

        if (active) {
          reconnectTimeout = setTimeout(async () => {
            if (active) {
              await tryRefreshToken();
              connect();
            }
          }, 3000);
        }
      };

      ws.onerror = async (err) => {
        if (!active) return;
        console.error("[WS] Connection error:", err);
        setWsStatus("error");
        cancelAiTyping();
        await tryRefreshToken();
      };

      ws.onmessage = (event: MessageEvent) => {
        if (!active) return;

        const rawData = typeof event.data === "string" ? event.data : "";
        console.log("[WS Received]:", rawData);

        let extractedText: string | null = null;
        let parsedPayload: Record<string, unknown> | null = null;

        try {
          const parsed = JSON.parse(rawData) as Record<string, unknown>;

          if (parsed && typeof parsed === "object") {
            parsedPayload = parsed;
            extractedText =
              (parsed.content as string | undefined) ||
              (parsed.response as string | undefined) ||
              (parsed.text as string | undefined) ||
              (parsed.message as string | undefined) ||
              (typeof parsed.data === "string"
                ? parsed.data
                : (parsed.data as Record<string, unknown> | undefined)?.content as string ||
                  (parsed.data as Record<string, unknown> | undefined)?.response as string) ||
              null;
          }
        } catch {
          if (rawData.trim()) {
            extractedText = rawData.trim();
          }
        }

        if (extractedText) {
          cancelAiTyping();

          const role =
            parsedPayload?.role === "user" || parsedPayload?.sender === "user"
              ? "user"
              : "ai";

          const chatMsg: ChatMessage = {
            id: `${role}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            sender: role,
            text: extractedText,
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          };
          onMessageRef.current(chatMsg);
        }
      };
    };

    connectRef.current = connect;
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

  const reconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    connectRef.current();
  }, []);

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
    reconnect,
  };
}
