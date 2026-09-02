"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Send,
  Clock,
  ArrowLeft,
  Play,
  Pause,
  CheckSquare,
  MessageSquare,
  Wifi,
  WifiOff,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { WhiteboardCanvas } from "./canvas/whiteboard-canvas";
import { useInterviewWs } from "../hooks/use-interview-ws";
import { useSubmitInterview } from "../hooks/use-submit-interview";
import type {
  ChatMessage,
  ExcalidrawElementSnapshot,
  WsNodeData,
  WsEdgeData,
} from "../types";

interface WorkspaceLayoutProps {
  sessionId: string;
}


function shapeToNodeType(excalidrawType: string, label: string): string {
  const l = label.toLowerCase();
  if (l.includes("database") || l.includes("db") || l.includes("postgres") || l.includes("mysql") || l.includes("mongo")) return "database";
  if (l.includes("cache") || l.includes("redis") || l.includes("memcache")) return "cache";
  if (l.includes("queue") || l.includes("kafka") || l.includes("rabbit") || l.includes("sqs")) return "queue";
  if (l.includes("load balancer") || l.includes("lb") || l.includes("nginx") || l.includes("gateway")) return "load_balancer";
  if (l.includes("cdn")) return "cdn";
  if (l.includes("client") || l.includes("user") || l.includes("browser") || l.includes("mobile")) return "client";
  if (l.includes("storage") || l.includes("s3") || l.includes("blob")) return "storage";
  // Fall back to shape type
  if (excalidrawType === "ellipse") return "client";
  if (excalidrawType === "diamond") return "gateway";
  return "service";
}

function inferEdgeProtocol(label: string): string {
  const l = label.toLowerCase();
  if (l.includes("grpc")) return "grpc";
  if (l.includes("tcp")) return "tcp";
  if (l.includes("pubsub") || l.includes("pub/sub")) return "pubsub";
  if (l.includes("ws") || l.includes("websocket")) return "ws";
  return "http";
}

function getElementLabel(
  el: ExcalidrawElementSnapshot,
  allElements: readonly ExcalidrawElementSnapshot[]
): string {

  if (el.type === "text") return el.text ?? "";
  const boundText = allElements.find(
    (e) => !e.isDeleted && e.type === "text" && e.containerId === el.id
  );
  return boundText?.text ?? "";
}

const NODE_TYPES = new Set(["rectangle", "ellipse", "diamond"]);
const EDGE_TYPES = new Set(["arrow", "line"]);

export function InterviewWorkspace({ sessionId }: WorkspaceLayoutProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const topicTitle = searchParams.get("title") ?? "System Design Interview";

  // ── Timer ───────────────────────────────────────────────────────────────────
  const [seconds, setSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isTimerRunning) {
      interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const [excalidrawAPI, setExcalidrawAPI] = useState<unknown>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);


  const addMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const {
    wsStatus,
    sendChat,
    sendNodeEvent,
    sendNodeDeleted,
    sendEdgeEvent,
    sendEdgeDeleted,
    isAiTyping,
  } = useInterviewWs(sessionId, addMessage);

  useEffect(() => {
    if (wsStatus === "open") toast.success("AI Interviewer connected", { id: "ws-status", duration: 2000 });
    else if (wsStatus === "error") toast.error("AI connection error", { id: "ws-status" });
    else if (wsStatus === "closed") toast.warning("AI connection closed", { id: "ws-status", duration: 3000 });
  }, [wsStatus]);

  const prevElementsRef = useRef<Map<string, ExcalidrawElementSnapshot>>(new Map());
  const pendingElementsRef = useRef<readonly ExcalidrawElementSnapshot[] | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSceneChange = useCallback(
    (elements: readonly ExcalidrawElementSnapshot[]) => {
      if (wsStatus !== "open") {
        const next = new Map<string, ExcalidrawElementSnapshot>();
        for (const el of elements) next.set(el.id, el);
        prevElementsRef.current = next;
        return;
      }

      pendingElementsRef.current = elements;
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        const snapshot = pendingElementsRef.current;
        if (!snapshot) return;
        runDiff(snapshot);
      }, 500); // 500ms after user stops moving
    },
    [wsStatus, sendNodeEvent, sendNodeDeleted, sendEdgeEvent, sendEdgeDeleted]
  );

  const runDiff = useCallback(
    (elements: readonly ExcalidrawElementSnapshot[]) => {

      const prev = prevElementsRef.current;
      const next = new Map<string, ExcalidrawElementSnapshot>();

      for (const el of elements) {
        next.set(el.id, el);
      }

      for (const [id, el] of next) {
        const wasPresent = prev.has(id);
        const prevEl = prev.get(id);

        if (el.type === "text") continue;

        if (NODE_TYPES.has(el.type)) {
          if (el.isDeleted) {
            if (wasPresent && !prevEl!.isDeleted) {
              sendNodeDeleted(id);
            }
          } else {
            const label = getElementLabel(el, elements);
            const nodePayload: WsNodeData = {
              id: el.id,
              type: shapeToNodeType(el.type, label),
              label: label || `${el.type}-${id.slice(0, 6)}`,
              x: el.x,
              y: el.y,
            };

            if (!wasPresent || prevEl!.isDeleted) {
              sendNodeEvent("node_added", nodePayload);
            } else {
              const prevLabel = getElementLabel(prevEl!, elements);
              const moved = Math.abs(prevEl!.x - el.x) > 1 || Math.abs(prevEl!.y - el.y) > 1;
              const labelChanged = prevLabel !== label;
              if (moved || labelChanged) {
                sendNodeEvent("node_updated", nodePayload);
              }
            }
          }
        }

        if (EDGE_TYPES.has(el.type)) {
          if (el.isDeleted) {
            if (wasPresent && !prevEl!.isDeleted) {
              sendEdgeDeleted(id);
            }
          } else {
            const sourceId = el.startBinding?.elementId ?? "";
            const targetId = el.endBinding?.elementId ?? "";
            // Only emit if both ends are connected to nodes
            if (!sourceId || !targetId) continue;

            const label = getElementLabel(el, elements);
            const edgePayload: WsEdgeData = {
              id: el.id,
              source: sourceId,
              target: targetId,
              type: inferEdgeProtocol(label),
            };

            if (!wasPresent || prevEl!.isDeleted) {
              sendEdgeEvent("edge_added", edgePayload);
            } else {
              // Check if connection changed
              const prevSrc = prevEl!.startBinding?.elementId ?? "";
              const prevTgt = prevEl!.endBinding?.elementId ?? "";
              if (prevSrc !== sourceId || prevTgt !== targetId) {
                sendEdgeEvent("edge_updated", edgePayload);
              }
            }
          }
        }
      }

      // Update prev snapshot
      prevElementsRef.current = next;
    },
    [sendNodeEvent, sendNodeDeleted, sendEdgeEvent, sendEdgeDeleted]
  );

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    addMessage(userMsg);
    sendChat(inputText);
    setInputText("");
  };

  const handleGetAiFeedback = () => {
    const api = excalidrawAPI as { getSceneElements: () => ExcalidrawElementSnapshot[] } | null;
    const elements = api?.getSceneElements() ?? [];
    const nodes = elements.filter((el) => !el.isDeleted && NODE_TYPES.has(el.type));
    const edges = elements.filter((el) => !el.isDeleted && EDGE_TYPES.has(el.type));

    const nodeLabels = nodes
      .map((el) => getElementLabel(el, elements))
      .filter(Boolean)
      .join(", ");

    const prompt =
      nodes.length === 0
        ? "I haven't placed any components yet. Can you guide me on where to begin?"
        : `My whiteboard has ${nodes.length} components${nodeLabels ? ` (${nodeLabels})` : ""} and ${edges.length} connections. Please evaluate my design.`;

    const userMsg: ChatMessage = {
      id: `user-fb-${Date.now()}`,
      sender: "user",
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    addMessage(userMsg);
    sendChat(prompt);
    toast.info("Requesting AI feedback...");
  };

  const submitInterviewMutation = useSubmitInterview();

  //  Submit interview 
  const handleSubmitDesign = async () => {
    setIsTimerRunning(false);
    toast.loading("Submitting interview to AI...", { id: "submit-interview" });
    try {
      await submitInterviewMutation.mutateAsync(sessionId);
      toast.success("Interview submitted! Generating evaluation report...", { id: "submit-interview" });
      router.push(`/reports?session_id=${encodeURIComponent(sessionId)}`);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to submit interview";
      toast.error(errorMsg, { id: "submit-interview" });
    }
  };

  //WS status badge 
  const WsBadge = () => {
    if (wsStatus === "open")
      return (
        <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-md border border-emerald-200/40 dark:border-emerald-800">
          <Wifi className="h-3 w-3" /> Session Active
        </span>
      );
    if (wsStatus === "connecting")
      return (
        <span className="flex items-center gap-1 text-[10px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-md border border-amber-200/40 dark:border-amber-800">
          <Loader2 className="h-3 w-3 animate-spin" /> Connecting...
        </span>
      );
    return (
      <span className="flex items-center gap-1 text-[10px] font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 px-2 py-0.5 rounded-md border border-rose-200/40 dark:border-rose-800">
        <WifiOff className="h-3 w-3" /> Disconnected
      </span>
    );
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-zinc-50 dark:bg-[#08090c] text-foreground select-none overflow-hidden">
      {/* Header */}
      <header className="h-14 border-b border-zinc-200 dark:border-zinc-850 bg-white dark:bg-[#0a0c10] flex items-center justify-between px-6 flex-shrink-0 z-40">
        <div className="flex items-center gap-3.5">
          <button
            onClick={() => {
              if (confirm("Exit the session? Progress will not be saved.")) {
                router.push("/interviews");
              }
            }}
            className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all cursor-pointer"
            title="Exit Session"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div>
            <h1 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 font-sans">
              {topicTitle}
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-normal hidden sm:block font-mono">
              session: {sessionId.slice(0, 8)}…
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Timer */}
          <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 font-sans">
            <Clock className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400 flex-shrink-0" />
            <span className="text-xs font-semibold font-mono text-zinc-700 dark:text-zinc-300 leading-none">
              {formatTime(seconds)}
            </span>
          </div>

          {/* Pause / Resume */}
          <button
            onClick={() => setIsTimerRunning((v) => !v)}
            className="p-2 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg cursor-pointer transition-colors flex items-center gap-1.5 text-xs font-medium font-sans"
          >
            {isTimerRunning ? (
              <><Pause className="h-3.5 w-3.5 text-amber-500" /><span className="hidden md:inline">Pause</span></>
            ) : (
              <><Play className="h-3.5 w-3.5 text-emerald-500" /><span className="hidden md:inline">Resume</span></>
            )}
          </button>

          {/* Request AI Feedback */}
          <button
            onClick={handleGetAiFeedback}
            disabled={wsStatus !== "open" || isAiTyping}
            className="p-2 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg cursor-pointer transition-colors flex items-center gap-1.5 text-xs font-medium font-sans disabled:opacity-50 disabled:cursor-not-allowed"
            title="Request AI feedback on your current whiteboard"
          >
            <MessageSquare className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" />
            <span className="hidden md:inline">Request Feedback</span>
          </button>

          {/* End Interview */}
          <button
            onClick={handleSubmitDesign}
            disabled={submitInterviewMutation.isPending}
            className="p-2 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white rounded-lg cursor-pointer transition-colors flex items-center gap-1.5 text-xs font-medium shadow-xs font-sans disabled:cursor-not-allowed"
          >
            {submitInterviewMutation.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <CheckSquare className="h-3.5 w-3.5" />
            )}
            <span>{submitInterviewMutation.isPending ? "Submitting..." : "End Interview"}</span>
          </button>

          <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 mx-1" />
          <ThemeToggle />
        </div>
      </header>

      {/* Main split */}
      <div className="flex flex-1 overflow-hidden relative w-full">
        <WhiteboardCanvas
          setExcalidrawAPI={setExcalidrawAPI}
          onSceneChange={handleSceneChange}
        />

        {/* RIGHT: AI Chat Panel */}
        <div className="w-[380px] md:w-[420px] bg-white dark:bg-[#090a0e] border-l border-zinc-200 dark:border-zinc-850 flex flex-col h-full z-10 flex-shrink-0">
          {/* Chat Header */}
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-900/10 flex items-center justify-between font-sans">
            <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              System Interviewer
            </span>
            <WsBadge />
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Empty state while WS is connecting */}
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-center py-12">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <p className="text-xs text-zinc-400 dark:text-zinc-500">Connecting to AI interviewer...</p>
              </div>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[85%] ${
                  msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
                }`}
              >
                <div
                  className={`p-3 rounded-xl text-xs leading-relaxed font-sans ${
                    msg.sender === "user"
                      ? "bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 font-medium rounded-tr-none"
                      : "bg-zinc-100 text-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 border border-zinc-200/50 dark:border-zinc-800/60 rounded-tl-none"
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 px-1 font-sans">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {/* AI Typing indicator */}
            {isAiTyping && (
              <div className="mr-auto items-start max-w-[85%]">
                <div className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-xl rounded-tl-none border border-zinc-200/50 dark:border-zinc-850 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-600 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-600 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-600 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSendMessage}
            className="p-4 border-t border-zinc-200 dark:border-zinc-850 bg-zinc-50/50 dark:bg-[#090a0e] flex items-center gap-2"
          >
            <input
              type="text"
              placeholder={
                wsStatus === "open"
                  ? "Explain your design or ask a question..."
                  : "AI connection unavailable..."
              }
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={wsStatus !== "open"}
              className="flex-1 px-3.5 py-2.5 text-xs bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary/30 focus:border-primary/50 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isAiTyping || wsStatus !== "open"}
              className="p-2.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-zinc-100 dark:text-zinc-900 rounded-xl transition-colors cursor-pointer disabled:opacity-50 flex-shrink-0"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
