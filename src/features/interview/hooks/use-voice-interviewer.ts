"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";

interface UseVoiceInterviewerOptions {
  onTranscriptComplete?: (transcript: string) => void;
  enabled?: boolean;
}

export interface UseVoiceInterviewerReturn {
  isListening: boolean;
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

// Clean markdown, code blocks, and symbols so the speech sounds like a natural human interviewer
export function cleanTextForSpeech(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, "") // remove multi-line code blocks
    .replace(/`([^`]+)`/g, "$1") // unwrap inline backtick code
    .replace(/\[STAGE:[^\]]*\]/gi, "") // strip stage tags
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // unwrap markdown links
    .replace(/[#*_~>|\\]/g, "") // remove markdown syntax chars
    .replace(/{[\s\S]*?}/g, "") // remove inline json snippets
    .replace(/\s+/g, " ")
    .trim();
}

export function useVoiceInterviewer({
  onTranscriptComplete,
  enabled = true,
}: UseVoiceInterviewerOptions = {}): UseVoiceInterviewerReturn {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isVoiceMuted, setIsVoiceMuted] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onTranscriptCompleteRef = useRef(onTranscriptComplete);

  useEffect(() => {
    onTranscriptCompleteRef.current = onTranscriptComplete;
  }, [onTranscriptComplete]);

  // Initialize SpeechSynthesis and SpeechRecognition capabilities
  useEffect(() => {
    if (typeof window === "undefined") return;

    if ("speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
    }

    // Check for browser SpeechRecognition
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognitionAPI) {
      setIsSupported(true);
      try {
        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onresult = (event: any) => {
          let currentInterim = "";
          let finalUtterance = "";

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalUtterance += transcript;
            } else {
              currentInterim += transcript;
            }
          }

          if (currentInterim) {
            setInterimTranscript(currentInterim);
          }

          if (finalUtterance.trim()) {
            setInterimTranscript("");
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            onTranscriptCompleteRef.current?.(finalUtterance.trim());
          }
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onerror = (event: any) => {
          console.warn("[useVoiceInterviewer] Recognition error:", event.error);
          if (event.error === "not-allowed") {
            toast.error("Microphone access blocked. Please allow mic permissions in browser.");
          }
          setIsListening(false);
          setInterimTranscript("");
        };

        recognition.onend = () => {
          setIsListening(false);
          setInterimTranscript("");
        };

        recognitionRef.current = recognition;
      } catch (err) {
        console.warn("[useVoiceInterviewer] Failed to initialize SpeechRecognition:", err);
      }
    } else {
      setIsSupported(false);
    }

    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const stopSpeaking = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsSpeaking(false);
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      toast.info("Speech recognition is not supported in this browser. You can still type in chat.");
      return;
    }
    // Immediate barge-in: cancel any active AI speech as soon as candidate speaks
    stopSpeaking();

    try {
      recognitionRef.current.start();
      setIsListening(true);
      setInterimTranscript("");
    } catch {
      // recognition may already be active
      setIsListening(true);
    }
  }, [stopSpeaking]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
    setInterimTranscript("");
  }, []);

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
        toast.success("AI interviewer voice enabled");
      }
      return next;
    });
  }, [stopSpeaking]);

  const speak = useCallback(
    (rawText: string) => {
      if (!enabled || isVoiceMuted || !synthRef.current || typeof window === "undefined") return;

      const cleanText = cleanTextForSpeech(rawText);
      if (!cleanText) return;

      // Stop previous speech before playing new response
      synthRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.05; // Slightly brisk, natural conversational tempo
      utterance.pitch = 1.0;
      utterance.lang = "en-US";

      const voices = synthRef.current.getVoices();
      // Prefer high-clarity natural English voices
      const preferredVoice =
        voices.find(
          (v) =>
            v.lang.startsWith("en") &&
            (v.name.includes("Natural") ||
              v.name.includes("Google") ||
              v.name.includes("Samantha") ||
              v.name.includes("Daniel") ||
              v.name.includes("Siri") ||
              v.name.includes("Premium"))
        ) || voices.find((v) => v.lang.startsWith("en"));

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      synthRef.current.speak(utterance);
    },
    [enabled, isVoiceMuted]
  );

  return {
    isListening,
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
