"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";

interface UseVoiceInterviewerOptions {
  onTranscriptComplete?: (transcript: string) => void;
  enabled?: boolean;
}

export interface UseVoiceInterviewerReturn {
  isListening: boolean;
  isTranscribing: boolean;
  isSpeaking: boolean;
  isVoiceMuted: boolean;
  isAutoVoiceEnabled: boolean;
  currentlySpeakingId: string | null;
  interimTranscript: string;
  isSupported: boolean;
  toggleListening: () => void;
  startListening: () => void;
  stopListening: () => void;
  toggleVoiceMute: () => void;
  toggleAutoVoice: () => void;
  speak: (text: string, messageId?: string) => Promise<void>;
  stopSpeaking: () => void;
}

export function cleanTextForSpeech(raw: string): string {
  if (!raw) return "";
  let clean = raw
    .replace(/```[\s\S]*?```/g, " Code block omitted. ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/#+\s+/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^[-*•]\s+/gm, "")
    .replace(/[–—]/g, "-")
    .replace(/\n+/g, ". ")
    .replace(/\s+/g, " ")
    .trim();

  // Low-latency conversational audio: synthesize the first 1-2 key sentences (up to 200 chars)
  // This guarantees sub-second synthesis while preserving natural cadence.
  if (clean.length > 200) {
    const sentences = clean.match(/[^.!?]+[.!?]+/g);
    if (sentences && sentences.length > 0) {
      let preview = "";
      for (const s of sentences) {
        if ((preview + s).length <= 200) {
          preview += s;
        } else {
          break;
        }
      }
      clean = preview.trim() || clean.slice(0, 180) + "...";
    } else {
      clean = clean.slice(0, 180) + "...";
    }
  }
  return clean;
}

function getApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (
    typeof window !== "undefined" &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1"
  ) {
    return "https://archon.monu14.me";
  }
  return "http://localhost:8071";
}

async function fetchWithAuthRetry(url: string, init: RequestInit = {}): Promise<Response> {
  const token = typeof window !== "undefined" ? localStorage.getItem("archon_access_token") : null;
  const headers = new Headers(init.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let res = await fetch(url, { ...init, headers });
  if (res.status === 401 && typeof window !== "undefined") {
    const refreshToken = localStorage.getItem("archon_refresh_token");
    if (refreshToken) {
      try {
        const apiBase = getApiBaseUrl();
        const refreshRes = await fetch(`${apiBase}/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
        if (refreshRes.ok) {
          const data = await refreshRes.json();
          const newToken =
            data?.access_token ||
            data?.data?.access_token ||
            data?.accessToken ||
            data?.data?.accessToken;
          if (newToken) {
            localStorage.setItem("archon_access_token", newToken);
            headers.set("Authorization", `Bearer ${newToken}`);
            res = await fetch(url, { ...init, headers });
          }
        }
      } catch {
        // Continue with original response
      }
    }
  }
  return res;
}

// Convert base64 PCM L16 24kHz audio into an AudioBuffer and play via Web Audio API
function playPcmAudio(
  base64Data: string,
  sampleRate = 24000,
  audioCtx: AudioContext
): AudioBufferSourceNode {
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const int16View = new Int16Array(bytes.buffer);
  const float32Array = new Float32Array(int16View.length);
  for (let i = 0; i < int16View.length; i++) {
    float32Array[i] = int16View[i] / 32768.0;
  }

  const buffer = audioCtx.createBuffer(1, float32Array.length, sampleRate);
  buffer.copyToChannel(float32Array, 0);

  const source = audioCtx.createBufferSource();
  source.buffer = buffer;
  source.connect(audioCtx.destination);
  source.start(0);
  return source;
}

export function useVoiceInterviewer({
  onTranscriptComplete,
  enabled = true,
}: UseVoiceInterviewerOptions = {}): UseVoiceInterviewerReturn {
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isVoiceMuted, setIsVoiceMuted] = useState(false);
  const [isAutoVoiceEnabled, setIsAutoVoiceEnabled] = useState(true);
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isSupported] = useState(true);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const currentAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const ttsAbortControllerRef = useRef<AbortController | null>(null);
  const onTranscriptCompleteRef = useRef(onTranscriptComplete);

  useEffect(() => {
    onTranscriptCompleteRef.current = onTranscriptComplete;
  }, [onTranscriptComplete]);

  // Read persisted auto-voice preference
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("archon_auto_voice");
    if (stored !== null) {
      setIsAutoVoiceEnabled(stored === "true");
    }
  }, []);

  // Initialize Web Audio Context and unlock on first user gesture
  useEffect(() => {
    if (typeof window === "undefined") return;

    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass && !audioCtxRef.current) {
      audioCtxRef.current = new AudioContextClass();
    }

    const unlockAudio = () => {
      if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume().catch(() => {});
      }
    };

    window.addEventListener("click", unlockAudio);
    window.addEventListener("touchstart", unlockAudio);
    window.addEventListener("keydown", unlockAudio);

    return () => {
      window.removeEventListener("click", unlockAudio);
      window.removeEventListener("touchstart", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
      if (currentAudioSourceRef.current) {
        try {
          currentAudioSourceRef.current.stop();
        } catch {
          // ignore
        }
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  // Stop any active neural speech playback (Guarantees zero overlapping audio)
  const stopSpeaking = useCallback(() => {
    if (ttsAbortControllerRef.current) {
      ttsAbortControllerRef.current.abort();
      ttsAbortControllerRef.current = null;
    }

    if (currentAudioSourceRef.current) {
      try {
        currentAudioSourceRef.current.stop();
        currentAudioSourceRef.current.disconnect();
      } catch {
        // ignore
      }
      currentAudioSourceRef.current = null;
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    setIsSpeaking(false);
    setCurrentlySpeakingId(null);
  }, []);

  // Neural TTS speech synthesis via Go Backend API (/api/v1/voice/synthesize)
  const speak = useCallback(
    async (text: string, messageId?: string) => {
      if (!enabled || isVoiceMuted || !text.trim()) return;

      // If already playing this exact message, clicking again acts as a stop toggle
      if (currentlySpeakingId && messageId && currentlySpeakingId === messageId && isSpeaking) {
        stopSpeaking();
        return;
      }

      // Stop any existing playing audio immediately (guarantees strictly one audio at a time)
      stopSpeaking();

      const spokenText = cleanTextForSpeech(text);
      if (!spokenText) return;

      const speechId = messageId || "auto";
      setCurrentlySpeakingId(speechId);
      setIsSpeaking(true);

      const controller = new AbortController();
      ttsAbortControllerRef.current = controller;

      try {
        const apiBase = getApiBaseUrl();
        const res = await fetchWithAuthRetry(`${apiBase}/api/v1/voice/synthesize`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: spokenText, voice: "Puck" }),
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(`Voice synthesis returned status ${res.status}`);
        }

        const data = await res.json();
        if (data.audio && audioCtxRef.current) {
          if (audioCtxRef.current.state === "suspended") {
            await audioCtxRef.current.resume();
          }

          const source = playPcmAudio(data.audio, data.sampleRate || 24000, audioCtxRef.current);
          currentAudioSourceRef.current = source;

          source.onended = () => {
            setIsSpeaking(false);
            setCurrentlySpeakingId((prev) => (prev === speechId ? null : prev));
            currentAudioSourceRef.current = null;
          };
          return;
        }
      } catch (err: unknown) {
        if (controller.signal.aborted) {
          return; // Intentionally stopped, do nothing
        }
        console.warn("[useVoiceInterviewer] Voice synthesis error:", err);
      }

      // Do NOT fall back to robotic local browser voice; preserve consistent neural voice persona
      setIsSpeaking(false);
      setCurrentlySpeakingId(null);
    },
    [enabled, isVoiceMuted, stopSpeaking, currentlySpeakingId, isSpeaking]
  );

  // Stop recording candidate voice
  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsListening(false);
  }, []);

  // Start recording candidate voice via MediaRecorder (WebM/Opus) and send to Go Backend
  const startListening = useCallback(async () => {
    if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      toast.error("Microphone access is not supported in this browser.");
      return;
    }

    // Immediately stop AI talking when candidate activates mic (Barge-in)
    stopSpeaking();

    // Ensure audio context is ready
    if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume().catch(() => {});
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      audioChunksRef.current = [];
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/mp4")
        ? "audio/mp4"
        : "audio/webm";

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());

        if (audioChunksRef.current.length === 0) {
          setIsListening(false);
          return;
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        audioChunksRef.current = [];

        if (audioBlob.size < 500) {
          setIsListening(false);
          setIsTranscribing(false);
          setInterimTranscript("");
          toast.info("Audio was too short. Please speak while the microphone is active.");
          return;
        }

        setIsTranscribing(true);
        setInterimTranscript("Transcribing speech...");

        try {
          const apiBase = getApiBaseUrl();
          const extension = mimeType.includes("mp4") ? "speech.mp4" : "speech.webm";
          const formData = new FormData();
          formData.append("file", audioBlob, extension);

          const res = await fetchWithAuthRetry(`${apiBase}/api/v1/voice/transcribe`, {
            method: "POST",
            body: formData,
          });

          if (!res.ok) {
            const errData = await res.json().catch(() => null);
            const serverMsg = errData?.error || `Transcription error: ${res.statusText} (${res.status})`;
            throw new Error(serverMsg);
          }

          const data = await res.json();
          const transcript = data.text?.trim() || "";

          setInterimTranscript("");
          setIsTranscribing(false);

          if (transcript) {
            onTranscriptCompleteRef.current?.(transcript);
          } else {
            toast.info("No clear speech detected. Please speak closer to your microphone.");
          }
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : "Speech transcription failed";
          console.error("[useVoiceInterviewer] Voice transcription error:", err);
          setIsTranscribing(false);
          setInterimTranscript("");
          toast.error(message);
        }
      };

      mediaRecorder.start(250);
      setIsListening(true);
      setInterimTranscript("Listening to candidate speech...");
    } catch (err) {
      console.error("[useVoiceInterviewer] Microphone permission error:", err);
      toast.error("Microphone permission denied. Please allow microphone access.");
      setIsListening(false);
    }
  }, [stopSpeaking]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  const toggleVoiceMute = useCallback(() => {
    setIsVoiceMuted((prev) => {
      const next = !prev;
      if (next) {
        stopSpeaking();
        toast.info("AI interviewer voice muted");
      } else {
        toast.success("AI interviewer voice active");
      }
      return next;
    });
  }, [stopSpeaking]);

  const toggleAutoVoice = useCallback(() => {
    setIsAutoVoiceEnabled((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("archon_auto_voice", String(next));
      }
      if (!next) {
        stopSpeaking();
        toast.info("Auto-Voice replies disabled. Click 'Listen' on any response.");
      } else {
        toast.success("Auto-Voice enabled. AI will speak responses automatically.");
      }
      return next;
    });
  }, [stopSpeaking]);

  return {
    isListening,
    isTranscribing,
    isSpeaking,
    isVoiceMuted,
    isAutoVoiceEnabled,
    currentlySpeakingId,
    interimTranscript,
    isSupported,
    toggleListening,
    startListening,
    stopListening,
    toggleVoiceMute,
    toggleAutoVoice,
    speak,
    stopSpeaking,
  };
}
