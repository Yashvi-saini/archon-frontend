"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
  BookOpen,
  Code2,
  Copy,
  Check,
  UploadCloud,
  Bot,
  Trash2,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Eye,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { fetchUserSettings } from "@/features/settings/api/settings";
import { WhiteboardCanvas } from "./canvas/whiteboard-canvas";
import { useInterviewWs } from "../hooks/use-interview-ws";
import { useInterviewDiagram } from "../hooks/use-interview-diagram";
import { useSubmitInterview } from "../hooks/use-submit-interview";
import { useVoiceInterviewer } from "../hooks/use-voice-interviewer";
import {
  buildElementSnapshotMap,
  EDGE_SHAPE_TYPES,
  getElementLabel,
  getDetectedArchitectureSummary,
  inferEdgeProtocol,
  NODE_SHAPE_TYPES,
  shapeToNodeType,
  type DetectedArchitectureSummary,
} from "../lib/diagram-utils";
import type {
  CanvasPreferences,
  ChatMessage,
  ExcalidrawElementSnapshot,
  WsEdgeData,
  WsNodeData,
} from "../types";

interface WorkspaceLayoutProps {
  sessionId: string;
}

const STAGES = [
  { id: "REQUIREMENTS", label: "Requirements" },
  { id: "ESTIMATION", label: "Scale & Est." },
  { id: "HIGH_LEVEL", label: "Architecture" },
  { id: "DEEP_DIVE", label: "Deep Dive" },
  { id: "COMPLETED", label: "Completed" },
];

export function InterviewWorkspace({ sessionId }: WorkspaceLayoutProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const topicTitle = searchParams.get("title") ?? "System Design Interview";
  const timeLimitMinutes = Number(searchParams.get("timeLimit") ?? "45");
  const expectedTopics = useMemo(() => {
    const raw = searchParams.get("topics");
    return raw ? raw.split(",").map((t) => t.trim()).filter(Boolean) : [];
  }, [searchParams]);

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

  const timeLimitSecs = timeLimitMinutes * 60;
  const isOvertime = seconds > timeLimitSecs;

  const excalidrawApiRef = useRef<unknown>(null);
  const [excalidrawAPI, setExcalidrawAPI] = useState<unknown>(null);
  const handleSetExcalidrawAPI = useCallback((api: unknown) => {
    if (excalidrawApiRef.current === api) return;
    excalidrawApiRef.current = api;
    setExcalidrawAPI(api);
  }, []);
  const [canvasPreferences, setCanvasPreferences] = useState<CanvasPreferences>({
    gridType: "blank",
    snapToGrid: false,
    syncDebounceMs: 500,
  });

  useEffect(() => {
    fetchUserSettings()
      .then(() => {
        setCanvasPreferences({
          gridType: "blank",
          snapToGrid: false,
          syncDebounceMs: 500,
        });
      })
      .catch(() => {
      });
  }, []);

  const { data: diagramData } = useInterviewDiagram(sessionId);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [typingSeconds, setTypingSeconds] = useState(0);
  const [architectureSummary, setArchitectureSummary] = useState<DetectedArchitectureSummary | undefined>();
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleCopyJson = () => {
    if (!architectureSummary) return;
    const jsonStr = JSON.stringify(architectureSummary.jsonPayload, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopiedJson(true);
    toast.success("Architecture JSON copied to clipboard");
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleToggleLibrary = () => {
    const api = excalidrawAPI as { toggleSidebar?: (options: { name: string }) => void } | null;
    if (typeof api?.toggleSidebar === "function") {
      api.toggleSidebar({ name: "default" });
    } else {
      toast.info("Open the Library drawer from Excalidraw's toolbar to browse components.");
    }
  };

  const speakRef = useRef<(text: string, messageId?: string) => void>(() => {});
  const sendChatRef = useRef<(text: string) => void>(() => {});
  const isAutoVoiceRef = useRef<boolean>(true);

  const addMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) => {
      if (prev.length > 0) {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg.id === msg.id || (lastMsg.sender === msg.sender && lastMsg.text === msg.text)) {
          return prev;
        }
      }
      return [...prev, msg];
    });

    if (msg.sender === "ai") {
      if (isAutoVoiceRef.current) {
        speakRef.current(msg.text, msg.id);
      }
    }
  }, []);

  const handleVoiceTranscriptComplete = useCallback(
    (transcript: string) => {
      const clean = transcript.trim();
      if (!clean) return;

      // Automatically send candidate's voice directly to AI Interviewer
      const userMsg: ChatMessage = {
        id: `user-voice-${Date.now()}`,
        sender: "user",
        text: clean,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      addMessage(userMsg);
      sendChatRef.current(clean);
      setInputText("");
      toast.success("Voice sent to AI Interviewer");
    },
    [addMessage]
  );

  const {
    isListening,
    isTranscribing,
    isSpeaking: isAiSpeaking,
    isVoiceMuted,
    isAutoVoiceEnabled,
    currentlySpeakingId,
    interimTranscript,
    isSupported: isVoiceSupported,
    toggleListening,
    startListening,
    stopListening,
    toggleVoiceMute,
    toggleAutoVoice,
    speak,
    stopSpeaking,
  } = useVoiceInterviewer({
    onTranscriptComplete: handleVoiceTranscriptComplete,
  });

  useEffect(() => {
    speakRef.current = speak;
  }, [speak]);

  useEffect(() => {
    isAutoVoiceRef.current = isAutoVoiceEnabled && !isVoiceMuted;
  }, [isAutoVoiceEnabled, isVoiceMuted]);

  const {
    wsStatus,
    sendChat,
    sendNodeEvent,
    sendNodeDeleted,
    sendEdgeEvent,
    sendEdgeDeleted,
    isAiTyping,
    streamingAiText,
    interviewStage,
    cancelAiTyping,
    reconnect,
  } = useInterviewWs(sessionId, addMessage);

  useEffect(() => {
    sendChatRef.current = sendChat;
  }, [sendChat]);

  const currentStageIndex = useMemo(() => {
    const idx = STAGES.findIndex((s) => s.id === interviewStage);
    return idx >= 0 ? idx : 0;
  }, [interviewStage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingAiText, isAiTyping]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isAiTyping) {
      setTypingSeconds(0);
      interval = setInterval(() => setTypingSeconds((s) => s + 1), 1000);
    } else {
      setTypingSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isAiTyping]);

  const getTypingStatusText = (_seconds?: number) => {
    return "Thinking...";
  };

  // Auto-purge any leftover nodes from previous runs from backend DB on initial connect
  const purgedInitialBackendRef = useRef(false);
  useEffect(() => {
    if (wsStatus !== "open" || !diagramData?.nodes?.length || purgedInitialBackendRef.current) return;
    purgedInitialBackendRef.current = true;
    for (const node of diagramData.nodes) {
      sendNodeDeleted(node.id);
    }
  }, [wsStatus, diagramData?.nodes, sendNodeDeleted]);

  const handleClearWhiteboard = useCallback(() => {
    const api = excalidrawAPI as {
      updateScene?: (scene: { elements: readonly unknown[] }) => void;
      getSceneElements?: () => ExcalidrawElementSnapshot[];
    } | null;

    if (!api?.updateScene) return;

    const currentElements = api.getSceneElements?.() || [];
    for (const el of currentElements) {
      if (!el.isDeleted) {
        if (NODE_SHAPE_TYPES.has(el.type)) {
          sendNodeDeleted(el.id);
        } else if (EDGE_SHAPE_TYPES.has(el.type)) {
          sendEdgeDeleted(el.id);
        }
      }
    }

    skipNextDiffRef.current = true;
    api.updateScene({ elements: [] });
    prevElementsRef.current = new Map();
    setArchitectureSummary(undefined);
    toast.success("Whiteboard cleared");
  }, [excalidrawAPI, sendNodeDeleted, sendEdgeDeleted]);

  useEffect(() => {
    if (wsStatus === "open") toast.success("AI Interviewer connected", { id: "ws-status", duration: 2000 });
    else if (wsStatus === "error") toast.error("AI connection error", { id: "ws-status" });
    else if (wsStatus === "closed") toast.warning("AI connection closed", { id: "ws-status", duration: 3000 });
  }, [wsStatus]);

  const prevElementsRef = useRef<Map<string, ExcalidrawElementSnapshot>>(new Map());
  const pendingElementsRef = useRef<readonly ExcalidrawElementSnapshot[] | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextDiffRef = useRef(false);

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

        if (NODE_SHAPE_TYPES.has(el.type)) {
          if (el.isDeleted) {
            if (wasPresent && !prevEl!.isDeleted) {
              sendNodeDeleted(id);
            }
          } else {
            const label = getElementLabel(el, elements);
            const customType = el.customData?.componentType;
            const nodePayload: WsNodeData = {
              id: el.id,
              type: shapeToNodeType(el.type, label, customType),
              label: label || `${el.type}-${id.slice(0, 6)}`,
              x: Math.round(el.x),
              y: Math.round(el.y),
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

        if (EDGE_SHAPE_TYPES.has(el.type)) {
          if (el.isDeleted) {
            if (wasPresent && !prevEl!.isDeleted) {
              sendEdgeDeleted(id);
            }
          } else {
            const sourceId = el.startBinding?.elementId ?? "";
            const targetId = el.endBinding?.elementId ?? "";
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
              const prevSrc = prevEl!.startBinding?.elementId ?? "";
              const prevTgt = prevEl!.endBinding?.elementId ?? "";
              if (prevSrc !== sourceId || prevTgt !== targetId) {
                sendEdgeEvent("edge_updated", edgePayload);
              }
            }
          }
        }
      }

      prevElementsRef.current = next;
    },
    [sendNodeEvent, sendNodeDeleted, sendEdgeEvent, sendEdgeDeleted]
  );

  const handleSceneChange = useCallback(
    (elements: readonly ExcalidrawElementSnapshot[]) => {
      if (skipNextDiffRef.current) {
        skipNextDiffRef.current = false;
        prevElementsRef.current = buildElementSnapshotMap(elements);
        return;
      }

      if (wsStatus !== "open") {
        prevElementsRef.current = buildElementSnapshotMap(elements);
        return;
      }

      pendingElementsRef.current = elements;
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        const snapshot = pendingElementsRef.current;
        if (!snapshot) return;

        const summary = getDetectedArchitectureSummary(snapshot);
        setArchitectureSummary((prev) => {
          if (
            prev &&
            prev.totalComponents === summary.totalComponents &&
            prev.edges.length === summary.edges.length &&
            JSON.stringify(prev.componentCounts) === JSON.stringify(summary.componentCounts)
          ) {
            return prev;
          }
          return summary;
        });

        runDiff(snapshot);
      }, canvasPreferences.syncDebounceMs);
    },
    [wsStatus, runDiff, canvasPreferences.syncDebounceMs]
  );

  const handleSendArchitectureToAi = useCallback(
    (summary: DetectedArchitectureSummary) => {
      if (summary.totalComponents === 0) {
        toast.error("Please place at least one architecture component first.");
        return;
      }
      const breakdown = Object.entries(summary.componentCounts)
        .map(([type, count]) => `${count}x ${type}`)
        .join(", ");
      const prompt = `I have updated my system design diagram with ${summary.totalComponents} components (${breakdown}) and ${summary.edges.length} connections. Please evaluate this architecture and suggest any optimizations, missing components (e.g. caching, queuing, or replication), or failure points.`;
      const userMsg: ChatMessage = {
        id: `user-arch-${Date.now()}`,
        sender: "user",
        text: prompt,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      addMessage(userMsg);
      sendChat(prompt);
      toast.success("Sent architecture summary to AI Interviewer");
    },
    [addMessage, sendChat]
  );

  const handleSyncAllNodes = useCallback(() => {
    const api = excalidrawAPI as { getSceneElements: () => ExcalidrawElementSnapshot[] } | null;
    const elements = api?.getSceneElements() ?? [];
    const summary = getDetectedArchitectureSummary(elements);

    if (summary.nodes.length === 0) {
      toast.error("No components on the canvas to sync.");
      return;
    }

    if (wsStatus !== "open") {
      toast.error("WebSocket connection is not open. Please check connection status.");
      return;
    }

    let count = 0;
    for (const node of summary.nodes) {
      const nodePayload: WsNodeData = {
        id: node.id,
        type: node.type,
        label: node.label,
        x: node.x,
        y: node.y,
      };
      sendNodeEvent("node_added", nodePayload);
      count++;
    }

    for (const edge of summary.edges) {
      const edgePayload: WsEdgeData = {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: edge.type,
      };
      sendEdgeEvent("edge_added", edgePayload);
    }

    toast.success(`Dispatched ${count} components and ${summary.edges.length} connections to backend!`);
  }, [excalidrawAPI, wsStatus, sendNodeEvent, sendEdgeEvent]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    stopSpeaking();
    if (isListening) stopListening();

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
    const nodes = elements.filter((el) => !el.isDeleted && NODE_SHAPE_TYPES.has(el.type));
    const edges = elements.filter((el) => !el.isDeleted && EDGE_SHAPE_TYPES.has(el.type));

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

  const WsBadge = () => {
    if (wsStatus === "open")
      return (
        <span
          className="flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md border border-emerald-500/20"
          title="Session WebSocket Active"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
          Live
        </span>
      );
    if (wsStatus === "connecting")
      return (
        <span
          className="flex items-center gap-1 text-[10px] font-medium text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-md border border-amber-500/20"
          title="Connecting to session..."
        >
          <Loader2 className="h-2.5 w-2.5 animate-spin" />
        </span>
      );
    return (
      <span
        onClick={() => reconnect()}
        className="flex items-center gap-1 text-[10px] font-medium text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded-md border border-rose-500/20 cursor-pointer"
        title="Disconnected. Click to reconnect."
      >
        <WifiOff className="h-2.5 w-2.5" />
      </span>
    );
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-zinc-50 dark:bg-[#08090c] text-foreground select-none overflow-hidden">
      <header className="h-14 border-b border-zinc-200 dark:border-zinc-850 bg-white dark:bg-[#0a0c10] flex items-center justify-between px-6 flex-shrink-0 z-40">
        <div className="flex items-center gap-3.5">
          <button
            onClick={() => {
              if (confirm("Exit the session? Your whiteboard and chat are saved on the server.")) {
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
              session: {sessionId.slice(0, 8)}… · limit {timeLimitMinutes}m
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-full border font-sans ${
              isOvertime
                ? "bg-zinc-100 dark:bg-zinc-800 border-rose-300 dark:border-rose-500/40"
                : "bg-zinc-100 dark:bg-zinc-800 border-zinc-200/50 dark:border-zinc-700/50"
            }`}
          >
            <Clock className={`h-3.5 w-3.5 flex-shrink-0 ${isOvertime ? "text-rose-500" : "text-zinc-500 dark:text-zinc-400"}`} />
            <span className={`text-xs font-medium font-mono leading-none ${isOvertime ? "text-rose-600 dark:text-rose-400" : "text-zinc-700 dark:text-zinc-300"}`}>
              {formatTime(seconds)}
            </span>
          </div>

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

          <button
            onClick={handleToggleLibrary}
            className="p-2 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg cursor-pointer transition-colors flex items-center gap-1.5 text-xs font-medium font-sans"
            title="Browse System Design Component Stencils in Library Drawer"
          >
            <BookOpen className="h-3.5 w-3.5 text-primary" />
            <span className="hidden sm:inline font-semibold">Components Library</span>
          </button>

          <button
            onClick={handleClearWhiteboard}
            className="p-2 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg cursor-pointer transition-colors flex items-center gap-1.5 text-xs font-medium font-sans"
            title="Clear whiteboard canvas and delete from server"
          >
            <Trash2 className="h-3.5 w-3.5 text-rose-500" />
            <span className="hidden sm:inline">Clear Board</span>
          </button>

          <button
            onClick={() => setShowJsonModal(true)}
            className="p-2 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg cursor-pointer transition-colors flex items-center gap-1.5 text-xs font-medium font-sans"
            title="Inspect detected diagram JSON synced to backend"
          >
            <Code2 className="h-3.5 w-3.5 text-emerald-500" />
            <span className="hidden sm:inline">
              {architectureSummary?.totalComponents ?? 0} components
            </span>
          </button>

          <button
            onClick={handleGetAiFeedback}
            disabled={wsStatus !== "open" || isAiTyping}
            className="p-2 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg cursor-pointer transition-colors flex items-center gap-1.5 text-xs font-medium font-sans disabled:opacity-50 disabled:cursor-not-allowed"
            title="Request AI feedback on your current whiteboard"
          >
            <MessageSquare className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" />
            <span className="hidden md:inline">Request Feedback</span>
          </button>

          <button
            onClick={handleSubmitDesign}
            disabled={submitInterviewMutation.isPending}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold font-sans transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            title="Finalize interview and generate AI evaluation report"
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

      {expectedTopics.length > 0 && (
        <div className="px-6 py-2 border-b border-zinc-200 dark:border-zinc-850 bg-zinc-50/80 dark:bg-zinc-900/20 flex flex-wrap gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mr-1 self-center">Expected topics</span>
          {expectedTopics.map((topic) => (
            <span
              key={topic}
              className="text-[10px] px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-700/50 text-zinc-600 dark:text-zinc-400 font-medium"
            >
              {topic}
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-1 overflow-hidden relative w-full">
        <WhiteboardCanvas
          setExcalidrawAPI={handleSetExcalidrawAPI}
          onSceneChange={handleSceneChange}
          canvasPreferences={canvasPreferences}
        />

        <div className="w-[380px] md:w-[420px] bg-white dark:bg-[#090a0e] border-l border-zinc-200 dark:border-zinc-850 flex flex-col h-full z-10 flex-shrink-0">
          {/* Chat Header */}
          <div className="px-3.5 py-2.5 border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-zinc-900/40 flex items-center justify-between gap-2 shrink-0 font-sans">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-bold tracking-tight text-zinc-900 dark:text-zinc-50 truncate">
                AI Interviewer
              </span>
              {/* Single mutually exclusive status indicator */}
              {isAiSpeaking ? (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9.5px] bg-violet-500/15 text-violet-600 dark:text-violet-400 border border-violet-500/30 animate-pulse font-medium shrink-0">
                  <Volume2 className="h-2.5 w-2.5 animate-bounce" />
                  Speaking
                </span>
              ) : isListening ? (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9.5px] bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 animate-pulse font-medium shrink-0">
                  <Mic className="h-2.5 w-2.5" />
                  Listening
                </span>
              ) : isTranscribing ? (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9.5px] bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 animate-pulse font-medium shrink-0">
                  <Loader2 className="h-2.5 w-2.5 animate-spin" />
                  Transcribing
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[9.5px] text-zinc-400 font-medium shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Ready
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {/* Auto Voice Toggle */}
              <button
                type="button"
                onClick={toggleAutoVoice}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border transition-colors cursor-pointer ${
                  isAutoVoiceEnabled && !isVoiceMuted
                    ? "bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30 hover:bg-violet-500/25"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:text-zinc-200"
                }`}
                title={
                  isAutoVoiceEnabled && !isVoiceMuted
                    ? "Auto-Voice is ON (AI replies automatically with speech). Click to toggle."
                    : "Auto-Voice is OFF (AI replies silently). Click to enable auto-speech."
                }
              >
                <Volume2 className="h-3 w-3" />
                <span>Voice {isAutoVoiceEnabled && !isVoiceMuted ? "ON" : "OFF"}</span>
              </button>

              <span
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/60"
                title="AI vision actively observing architecture components"
              >
                <Eye className="h-2.5 w-2.5 text-emerald-500" />
                Vision
              </span>

              <WsBadge />
            </div>
          </div>

          {/* Interactive Interview Stage Progress Stepper (Clean 5-Column Grid) */}
          <div className="px-2.5 py-1.5 border-b border-zinc-200/70 dark:border-zinc-800/70 bg-zinc-100/50 dark:bg-zinc-950/40 grid grid-cols-5 gap-1 text-center font-sans">
            {STAGES.map((s, idx) => {
              const isCurrent = s.id === interviewStage;
              const isDone = idx < currentStageIndex;
              const shortLabels = ["1. Req", "2. Scale", "3. Arch", "4. Deep", "5. Done"];
              return (
                <div
                  key={s.id}
                  title={`${s.label}${isCurrent ? " (Current Stage)" : isDone ? " (Completed)" : ""}`}
                  className={`flex items-center justify-center gap-1 py-1 rounded text-[9.5px] transition-all truncate ${
                    isCurrent
                      ? "bg-violet-600 text-white font-bold shadow-xs"
                      : isDone
                      ? "text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-500/10 border border-emerald-500/20"
                      : "text-zinc-400 dark:text-zinc-600 font-normal"
                  }`}
                >
                  <span
                    className={`w-1 h-1 rounded-full shrink-0 ${
                      isCurrent
                        ? "bg-white animate-pulse"
                        : isDone
                        ? "bg-emerald-500"
                        : "bg-zinc-300 dark:bg-zinc-700"
                    }`}
                  />
                  <span className="truncate">{shortLabels[idx]}</span>
                </div>
              );
            })}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && !streamingAiText && (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-12 px-4">
                {wsStatus === "error" || wsStatus === "closed" ? (
                  <>
                    <div className="p-3 bg-rose-500/10 text-rose-500 rounded-full">
                      <WifiOff className="h-5 w-5" />
                    </div>
                    <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      AI Interviewer Disconnected
                    </p>
                    <p className="text-[11px] text-zinc-400 max-w-xs">
                      The WebSocket session was interrupted or your token expired.
                    </p>
                    <button
                      type="button"
                      onClick={() => reconnect()}
                      className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Reconnect
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500">
                      {wsStatus === "open"
                        ? "Waiting for AI interviewer greeting..."
                        : "Connecting to AI interviewer..."}
                    </p>
                  </>
                )}
              </div>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[88%] ${
                  msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  {msg.sender === "ai" ? (
                    <>
                      <Bot className="h-3 w-3 text-violet-500" />
                      <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">
                        Interviewer
                      </span>
                    </>
                  ) : (
                    <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">
                      You (Candidate)
                    </span>
                  )}
                  <span className="text-[9px] text-zinc-400 dark:text-zinc-600 font-mono">
                    {msg.timestamp}
                  </span>
                </div>
                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed font-sans shadow-xs transition-all ${
                    msg.sender === "user"
                      ? "bg-violet-600 text-white rounded-tr-sm font-medium"
                      : "bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100 border border-zinc-200/80 dark:border-zinc-800 rounded-tl-sm"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  {msg.sender === "ai" && (
                    <div className="mt-2.5 pt-2 border-t border-zinc-200/60 dark:border-zinc-800 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => speak(msg.text, msg.id)}
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10.5px] font-medium transition-colors cursor-pointer ${
                          currentlySpeakingId === msg.id && isAiSpeaking
                            ? "bg-violet-500/20 text-violet-400 border border-violet-500/30 animate-pulse"
                            : "text-violet-600 dark:text-violet-400 hover:bg-violet-500/10"
                        }`}
                        title={
                          currentlySpeakingId === msg.id && isAiSpeaking
                            ? "Stop playing this message"
                            : "Listen to this AI response"
                        }
                      >
                        {currentlySpeakingId === msg.id && isAiSpeaking ? (
                          <>
                            <Volume2 className="h-3 w-3 animate-bounce text-violet-500" />
                            <span>Stop Audio</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="h-3 w-3" />
                            <span>Listen</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {streamingAiText && (
              <div className="mr-auto items-start max-w-[88%] flex flex-col">
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  <Bot className="h-3 w-3 text-violet-500 animate-pulse" />
                  <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">
                    Interviewer (Responding...)
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl text-xs leading-relaxed font-sans bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100 border border-zinc-200/80 dark:border-zinc-800 rounded-tl-sm">
                  {streamingAiText}
                  <span className="inline-block w-1.5 h-3.5 ml-1 bg-violet-500 animate-pulse align-middle rounded-xs" />
                </div>
              </div>
            )}

            {isAiTyping && !streamingAiText && (
              <div className="mr-auto items-start max-w-[90%] space-y-1">
                <div className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-xl rounded-tl-none border border-zinc-200/50 dark:border-zinc-850 flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-600 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-600 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-600 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-sans">
                    {getTypingStatusText(typingSeconds)}{" "}
                    <span className="text-[10px] text-zinc-400 font-mono">({typingSeconds}s)</span>
                  </span>
                </div>
                <div className="flex items-center gap-2 px-1">
                  <button
                    type="button"
                    onClick={cancelAiTyping}
                    className="text-[10px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 underline cursor-pointer"
                    title="Unlock chat input"
                  >
                    Cancel wait & unlock input
                  </button>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={handleSendMessage}
            className="p-3.5 border-t border-zinc-200 dark:border-zinc-850 bg-zinc-50/50 dark:bg-[#090a0e] flex flex-col gap-2"
          >
            {(interimTranscript || isTranscribing) && (
              <div className="text-[11px] text-zinc-600 dark:text-zinc-300 italic flex items-center gap-1.5 px-3 py-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-lg animate-pulse border border-zinc-200 dark:border-zinc-700">
                {isTranscribing ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin text-primary" />
                    <span>Transcribing with Groq Whisper Turbo...</span>
                  </>
                ) : (
                  <>
                    <Mic className="h-3 w-3 text-rose-500 animate-bounce" />
                    <span className="truncate">Hearing: &quot;{interimTranscript}&quot;...</span>
                  </>
                )}
              </div>
            )}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleListening}
                disabled={wsStatus !== "open" || isTranscribing}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex-shrink-0 ${
                  isListening
                    ? "bg-rose-500 text-white border-rose-600 shadow-md animate-pulse"
                    : isTranscribing
                    ? "bg-zinc-100 dark:bg-zinc-800 text-primary border-zinc-200 dark:border-zinc-700 opacity-70"
                    : "bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                }`}
                title={
                  isListening
                    ? "Stop voice recording (auto-transcribes with Groq Whisper)"
                    : isTranscribing
                    ? "Transcribing voice..."
                    : "Speak with AI interviewer (Groq Whisper Turbo)"
                }
              >
                {isTranscribing ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                ) : isListening ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </button>
              <input
                type="text"
                placeholder={
                  isTranscribing
                    ? "Transcribing with Groq Whisper..."
                    : isListening
                    ? "Recording voice... Click mic when done speaking"
                    : wsStatus === "open"
                    ? "Explain design or click mic to talk..."
                    : "AI connection unavailable..."
                }
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={wsStatus !== "open"}
                className="flex-1 px-3.5 py-2.5 text-xs bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary/30 focus:border-primary/50 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || wsStatus !== "open"}
                className="p-2.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-zinc-100 dark:text-zinc-900 rounded-xl transition-colors cursor-pointer disabled:opacity-50 flex-shrink-0"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {showJsonModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-xl w-full p-5 shadow-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Code2 className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                    Detected Architecture Payload
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Active JSON representation sent over WebSocket to backend
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowJsonModal(false)}
                className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 px-2 py-1 rounded-md cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            {architectureSummary && Object.keys(architectureSummary.componentCounts).length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-3">
                {Object.entries(architectureSummary.componentCounts).map(([type, count]) => (
                  <span
                    key={type}
                    className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-700/50 text-zinc-700 dark:text-zinc-300"
                  >
                    {count}x {type}
                  </span>
                ))}
              </div>
            )}

            <div className="flex-1 overflow-y-auto my-3 bg-zinc-950 text-zinc-100 rounded-xl p-3 font-mono text-[11px] leading-relaxed border border-zinc-800 select-all">
              <pre>
                {JSON.stringify(architectureSummary?.jsonPayload ?? {}, null, 2)}
              </pre>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800 flex-wrap gap-2">
              <span className="text-[11px] text-zinc-500 font-sans">
                {architectureSummary?.totalComponents ?? 0} components • {architectureSummary?.edges.length ?? 0} connections
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-200 transition-colors cursor-pointer"
                >
                  {copiedJson ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy JSON</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleSyncAllNodes}
                  disabled={wsStatus !== "open"}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                  <UploadCloud className="h-3.5 w-3.5" />
                  <span>Sync JSON to Backend</span>
                </button>
                {architectureSummary && architectureSummary.totalComponents > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      handleSendArchitectureToAi(architectureSummary);
                      setShowJsonModal(false);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Bot className="h-3.5 w-3.5" />
                    <span>Ask AI Review</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
