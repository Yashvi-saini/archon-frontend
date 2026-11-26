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
  interimTranscript: string;
  isSupported: boolean;
  toggleListening: () => void;
  startListening: () => void;
  stopListening: () => void;
  toggleVoiceMute: () => void;
  speak: (text: string) => void;
  stopSpeaking: () => void;
}

function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8071";
}

function getAuthHeader(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("archon_access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
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
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isSupported] = useState(true);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const currentAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const onTranscriptCompleteRef = useRef(onTranscriptComplete);

  useEffect(() => {
    onTranscriptCompleteRef.current = onTranscriptComplete;
  }, [onTranscriptComplete]);

  // Initialize Web Audio Context
  useEffect(() => {
    if (typeof window === "undefined") return;

    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtxRef.current = new AudioContextClass();
    }

    return () => {
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

  // Stop any active neural speech playback (Barge-in cancellation)
  const stopSpeaking = useCallback(() => {
    if (currentAudioSourceRef.current) {
      try {
        currentAudioSourceRef.current.stop();
      } catch {
        // ignore
      }
      currentAudioSourceRef.current = null;
    }
    // Also cancel native fallback speech if active
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  // Production-grade Neural TTS speech synthesis via Go Backend API (/api/v1/voice/synthesize)
  const speak = useCallback(
    async (text: string) => {
      if (!enabled || isVoiceMuted || !text.trim()) return;

      stopSpeaking();

      try {
        const apiBase = getApiBaseUrl();
        const res = await fetch(`${apiBase}/api/v1/voice/synthesize`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeader(),
          },
          body: JSON.stringify({ text, voice: "Puck" }),
        });

        if (!res.ok) {
          throw new Error(`TTS API failed with status ${res.status}`);
        }

        const data = await res.json();
        if (data.audio && audioCtxRef.current) {
          if (audioCtxRef.current.state === "suspended") {
            await audioCtxRef.current.resume();
          }

          setIsSpeaking(true);
          const source = playPcmAudio(data.audio, data.sampleRate || 24000, audioCtxRef.current);
          currentAudioSourceRef.current = source;

          source.onended = () => {
            setIsSpeaking(false);
            currentAudioSourceRef.current = null;
          };
          return;
        }
      } catch (err) {
        console.warn("[useVoiceInterviewer] Backend Neural TTS error, falling back to local synthesis:", err);
      }

      // Safe fallback if server voice is unreachable
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.05;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
      }
    },
    [enabled, isVoiceMuted, stopSpeaking]
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

    // Barge-in: immediately stop AI talking when candidate activates mic
    stopSpeaking();

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

        setIsTranscribing(true);
        setInterimTranscript("Transcribing audio with Groq Whisper Turbo...");

        try {
          const apiBase = getApiBaseUrl();
          const formData = new FormData();
          formData.append("file", audioBlob, "speech.webm");

          const res = await fetch(`${apiBase}/api/v1/voice/transcribe`, {
            method: "POST",
            headers: {
              ...getAuthHeader(),
            },
            body: formData,
          });

          if (!res.ok) {
            throw new Error(`Whisper API error: ${res.statusText}`);
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
        } catch (err) {
          console.error("[useVoiceInterviewer] Backend Whisper transcription error:", err);
          setIsTranscribing(false);
          setInterimTranscript("");
          toast.error("Speech transcription failed. Please try again or type in chat.");
        }
      };

      mediaRecorder.start(250);
      setIsListening(true);
      setInterimTranscript("Listening...");
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

  return {
    isListening,
    isTranscribing,
    isSpeaking,
    isVoiceMuted,
    interimTranscript,
    isSupported,
    toggleListening,
    startListening,
    stopListening,
    toggleVoiceMute,
    speak,
    stopSpeaking,
  };
}
