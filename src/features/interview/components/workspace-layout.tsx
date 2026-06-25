"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Send, 
  Clock, 
  ArrowLeft,
  Play,
  Pause,
  CheckSquare,
  Bot,
  MessageSquare
} from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { WhiteboardCanvas } from "./canvas/whiteboard-canvas";

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

interface WorkspaceLayoutProps {
  problemId: string;
}

export function InterviewWorkspace({ problemId }: WorkspaceLayoutProps) {
  const router = useRouter();
  

  const problemDetails = {
    whatsapp: {
      title: "WhatsApp System Design",
      desc: "Design a real-time chat application to support 100M active daily users. Focus on low-latency messaging, presence indicators, and scale.",
      initialAiMsg: "Welcome. Please design a system architecture for WhatsApp that can support 100 million active users daily, focusing on low-latency message delivery and high availability. Where would you like to start? Drag or place nodes on the canvas to map out your infrastructure."
    },
    uber: {
      title: "Uber Ride Hailing",
      desc: "Design a real-time ride-matching and GPS location tracking system. Focus on geospatial indexing, high write throughput, and matchmaking.",
      initialAiMsg: "Welcome. Let's design Uber's ride-matching architecture. We need to handle high-frequency GPS updates and match drivers with drivers in under 2 seconds. What geospatial storage and routing components do you propose?"
    },
    netflix: {
      title: "Netflix Video Streaming",
      desc: "Design a global video streaming platform. Focus on content delivery networks (CDNs), video transcoding pipelines, and storage optimization.",
      initialAiMsg: "Welcome. Please map out Netflix's video streaming system. Focus on how you will ingest large raw video files, transcode them into multiple bitrates, and distribute them globally with low buffering. Where should we start?"
    },
    custom: {
      title: "Custom System Design",
      desc: "Practice any custom system architecture scenario of your choice.",
      initialAiMsg: "Welcome. Let's start your custom system design session. Please describe the problem statement you'd like to tackle and place your initial nodes on the canvas."
    }
  }[problemId as "whatsapp" | "uber" | "netflix" | "custom"] || {
    title: "System Design Practice",
    desc: "Interactive system design architecture canvas.",
    initialAiMsg: "Welcome. Place components on the canvas and describe your high-level architecture."
  };

  // Timer
  const [seconds, setSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // Excalidraw 
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);

  // Extract shapes from Excalidraw
  const getShapesMetrics = () => {
    if (!excalidrawAPI) return { shapesCount: 0, notesCount: 0, arrowsCount: 0 };
    
    const allElements = excalidrawAPI.getSceneElements() || [];
    let shapesCount = 0;
    let notesCount = 0;
    let arrowsCount = 0;

    allElements.forEach((el: any) => {
      if (el.isDeleted) return;
      
      if (el.type === "text") {
        notesCount++;
      } else if (el.type === "arrow" || el.type === "line" || el.type === "freedraw") {
        arrowsCount++;
      } else if (el.type === "rectangle" || el.type === "ellipse" || el.type === "diamond") {
        shapesCount++;
      }
    });

    return { shapesCount, notesCount, arrowsCount };
  };



  // Chat 
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "ai-1",
      sender: "ai",
      text: problemDetails.initialAiMsg,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);



  // Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Format time 
  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAiTyping]);

  // Send message to AI
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsAiTyping(true);

    // Simulated ai response
    setTimeout(() => {
      let aiText = "Interesting approach. Can you expand on how you plan to handle synchronization and failure modes for this specific part of the system?";
      
      const text = inputText.toLowerCase();
      if (text.includes("websocket") || text.includes("connection")) {
        aiText = "Using WebSockets is solid for messaging. How will you scale the gateway connection servers horizontally? Where will you store the mapping of connected users to gateway instances?";
      } else if (text.includes("kafka") || text.includes("queue") || text.includes("message broker")) {
        aiText = "A message queue handles spike buffers effectively. What partitioning strategy would you use for Kafka topics to guarantee message ordering for individual chat rooms?";
      } else if (text.includes("redis") || text.includes("cache")) {
        aiText = "Caching will drastically reduce database load. If the cache nodes restart or drop, how do you handle cache stampede or cold starts on the main read databases?";
      } else if (text.includes("database") || text.includes("postgres") || text.includes("cassandra")) {
        aiText = "Selecting Cassandra / wide-column store works well for message history due to sequential writes. How will you handle message read patterns like loading historical chat history?";
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: aiText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setMessages(prev => [...prev, aiMsg]);
      setIsAiTyping(false);
    }, 2000);
  };

  // Submit interview
  const handleSubmitDesign = (shapesCount: number) => {
    setIsTimerRunning(false);
    toast.success("Design session submitted successfully.");
    router.push("/interviews");
  };

  const handleGetAiFeedback = (shapesCount: number, notesCount: number, arrowsCount: number) => {
    setIsAiTyping(true);
    toast.loading("Analyzing whiteboard architecture...");
    
    setTimeout(() => {
      toast.dismiss();
      let aiText = "Interesting architecture. Can you expand on how you plan to handle synchronization and failure modes for this specific configuration?";
      
      if (shapesCount + notesCount === 0) {
        aiText = "Based on your current whiteboard with no components drawn, I recommend adding key architectural elements like clients, a Load Balancer, an API Gateway, and databases before requesting deep system design feedback.";
      } else if (shapesCount + notesCount < 4) {
        aiText = "Your whiteboard contains very few components. Consider detailing the flow of data by drawing more services and mapping out how they interact.";
      } else {
        if (notesCount === 0) {
          aiText = "Your design looks clean, but you haven't added any annotation/sticky notes to describe the database schemas or protocol specifications. Consider adding a few Sticky Notes on your board to detail your design choices.";
        } else if (arrowsCount === 0) {
          aiText = "I see multiple infrastructure blocks, but they are not connected. How does data flow between these systems? Consider connecting your nodes with Arrows to illustrate the request flow.";
        } else {
          aiText = `Superb! You have mapped out a rich architecture with ${shapesCount + notesCount} components and ${arrowsCount} connection flows. How will you configure high availability and database partitioning for this setup?`;
        }
      }

      const aiMsg: ChatMessage = {
        id: `ai-feedback-${Date.now()}`,
        sender: "ai",
        text: aiText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setMessages(prev => [...prev, aiMsg]);
      setIsAiTyping(false);
      toast.success("AI Feedback generated!");
    }, 1500);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-zinc-50 dark:bg-[#08090c] text-foreground select-none overflow-hidden">
      
      {/* Workspace Header Navbar */}
      <header className="h-14 border-b border-zinc-200 dark:border-zinc-850 bg-white dark:bg-[#0a0c10] flex items-center justify-between px-6 flex-shrink-0 z-40">
        <div className="flex items-center gap-3.5">
          <button 
            onClick={() => {
              if (confirm("Are you sure you want to exit the practice session? Progress will not be saved.")) {
                router.push("/interviews");
              }
            }}
            className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all cursor-pointer"
            title="Exit Session"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          
          <div>
            <h1 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 font-sans">{problemDetails.title}</h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-normal hidden sm:block truncate max-w-xs md:max-w-md font-sans">{problemDetails.desc}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Timer status */}
          <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 font-sans">
            <Clock className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400 flex-shrink-0" />
            <span className="text-xs font-semibold font-mono text-zinc-700 dark:text-zinc-300 leading-none">
              {formatTime(seconds)}
            </span>
          </div>

          {/* Pause / Resume Button */}
          <button
            onClick={() => setIsTimerRunning(!isTimerRunning)}
            className="p-2 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg cursor-pointer transition-colors flex items-center gap-1.5 text-xs font-medium font-sans"
            title={isTimerRunning ? "Pause Interview Timer" : "Resume Interview Timer"}
          >
            {isTimerRunning ? (
              <>
                <Pause className="h-3.5 w-3.5 text-amber-500" />
                <span className="hidden md:inline">Pause</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 text-emerald-500" />
                <span className="hidden md:inline">Resume</span>
              </>
            )}
          </button>

          {/* Get AI Feedback Button */}
          <button
            onClick={() => {
              const { shapesCount, notesCount, arrowsCount } = getShapesMetrics();
              handleGetAiFeedback(shapesCount, notesCount, arrowsCount);
            }}
            className="p-2 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg cursor-pointer transition-colors flex items-center gap-1.5 text-xs font-medium font-sans"
            title="Request live evaluation feedback from the system interviewer"
          >
            <MessageSquare className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" />
            <span className="hidden md:inline">Request Feedback</span>
          </button>

          {/* End Interview Button */}
          <button
            onClick={() => {
              const { shapesCount } = getShapesMetrics();
              handleSubmitDesign(shapesCount);
            }}
            className="p-2 bg-rose-400 hover:bg-rose-600 text-white rounded-lg cursor-pointer transition-colors flex items-center gap-1.5 text-xs font-medium shadow-xs font-sans"
            title="Submit design board and complete your interview"
          >
            <CheckSquare className="h-3.5 w-3.5" />
            <span>End Interview</span>
          </button>

          <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 mx-1" />

          <ThemeToggle />
        </div>
      </header>

      {/* Main Workspace split */}
      <div className="flex flex-1 overflow-hidden relative w-full">
        
        {/* LEFT PANE: Whiteboard  */}
        <WhiteboardCanvas setExcalidrawAPI={setExcalidrawAPI} />

        {/* RIGHT PANE:chat Panel */}
        <div className="w-[380px] md:w-[420px] bg-white dark:bg-[#090a0e] border-l border-zinc-200 dark:border-zinc-850 flex flex-col h-full z-10 flex-shrink-0">
                 {/* Chat Panel Header */}
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-900/10 flex items-center justify-between font-sans">
            <div className="flex items-center gap-2">
             
              <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 font-sans">System Interviewer</span>
            </div>
            <span className="text-[10px] font-medium  bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-md border border-emerald-200/40 dark:border-emerald-300 font-sans">
              Session Active
            </span>
          </div>

          {/* Message List area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div 
                key={msg.id}
                className={`flex flex-col max-w-[85%] ${
                  msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
                }`}
              >
                <div className={`p-3 rounded-xl text-xs leading-relaxed font-sans ${
                  msg.sender === "user" 
                    ? "bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 font-medium rounded-tr-none" 
                    : "bg-zinc-100 text-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 border border-zinc-200/50 dark:border-zinc-800/60 rounded-tl-none"
                }`}>
                  {msg.text}
                </div>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 px-1 font-sans">{msg.timestamp}</span>
              </div>
            ))}

            {/* Typing Indicator */}
            {isAiTyping && (
              <div className="mr-auto items-start max-w-[85%] space-y-1">
                <div className="p-3 bg-zinc-100 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-500 rounded-xl rounded-tl-none border border-zinc-200/50 dark:border-zinc-850 flex items-center gap-1 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-600 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-600 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-600 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input form */}
          <form 
            onSubmit={handleSendMessage}
            className="p-4 border-t border-zinc-200 dark:border-zinc-850 bg-zinc-50/50 dark:bg-[#090a0e] flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Explain your design choice or ask a question..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-3.5 py-2.5 text-xs bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary/30 focus:border-primary/50"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isAiTyping}
              className="p-2.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-zinc-100 dark:text-zinc-900 rounded-xl transition-colors cursor-pointer disabled:opacity-50 flex-shrink-0"
              title="Send Message"
            >
              <Send className="h-4.5 w-4.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
