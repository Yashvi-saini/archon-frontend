"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Network, ArrowRight, MessageSquare, Car, Video, Sliders } from "lucide-react";
import { toast } from "sonner";

export default function InterviewsPage() {
  const router = useRouter();
  const [customTopic, setCustomTopic] = useState("");

  const topics = [
    {
      id: "whatsapp",
      title: "WhatsApp System Design",
      desc: "Design a real-time messaging pipeline to support 100M active daily users with instant delivery status and offline queuing.",
      icon: MessageSquare,
      difficulty: "Hard",
      estTime: "45 mins",
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
    },
    {
      id: "uber",
      title: "Uber Ride Hailing",
      desc: "Design a high-throughput geospatial matching broker to match riders with nearby drivers under 2 seconds.",
      icon: Car,
      difficulty: "Hard",
      estTime: "45 mins",
      color: "text-sky-500 bg-sky-500/10 border-sky-500/20"
    },
    {
      id: "netflix",
      title: "Netflix Video Streaming",
      desc: "Design a global content delivery network (CDN) and adaptive video transcoding pipeline for multi-bitrate playbacks.",
      icon: Video,
      difficulty: "Medium",
      estTime: "40 mins",
      color: "text-rose-500 bg-rose-500/10 border-rose-500/20"
    }
  ];

  const handleStartPractice = (topicId: string) => {
    toast.success(`Initializing session for ${topicId}...`);
    router.push(`/interview/${topicId}`);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTopic.trim()) {
      toast.error("Please enter a custom scenario name");
      return;
    }
    toast.success("Initializing custom design workspace...");
    router.push(`/interview/custom?topic=${encodeURIComponent(customTopic)}`);
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-in fade-in duration-205">
      
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50">Interviews</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Select a distributed systems problem to enter the interactive design whiteboard workspace.
        </p>
      </div>

      {/* Grid of system design topics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topics.map((topic) => {
          const Icon = topic.icon;
          return (
            <div 
              key={topic.id} 
              className="flex flex-col justify-between p-6 bg-white dark:bg-[#111318] border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-primary/55 group transition-all"
            >
              <div className="space-y-4">
                {/* Topic icon and metadata badges */}
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg border ${topic.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex gap-1.5">
                    <span className="px-2 py-0.5 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-3xs font-bold rounded-md text-zinc-500">
                      {topic.difficulty}
                    </span>
                    <span className="px-2 py-0.5 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-3xs font-bold rounded-md text-zinc-400">
                      {topic.estTime}
                    </span>
                  </div>
                </div>

                {/* Title and Description */}
                <div>
                  <h3 className="font-bold text-zinc-950 dark:text-zinc-50 group-hover:text-primary transition-colors">{topic.title}</h3>
                  <p className="text-xs text-zinc-450 dark:text-zinc-500 mt-1.5 leading-relaxed">{topic.desc}</p>
                </div>
              </div>

              {/* Action Button */}
              <button 
                onClick={() => handleStartPractice(topic.id)}
                className="w-full mt-6 inline-flex items-center justify-center gap-1.5 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-zinc-100 dark:text-zinc-900 font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Start Practice <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Section 2: Custom Problem creation */}
      <div className="p-6 bg-white dark:bg-[#111318] border border-zinc-200 dark:border-zinc-800 rounded-xl max-w-2xl space-y-4">
        <div>
          <h2 className="text-xs font-black uppercase tracking-wider text-zinc-400">Custom Scenario</h2>
          <p className="text-xs text-zinc-450 dark:text-zinc-500 mt-0.5">Define your own architecture scenario and start practicing immediately.</p>
        </div>

        <form onSubmit={handleCustomSubmit} className="flex gap-3">
          <input 
            type="text"
            placeholder="e.g. Design a Distributed Web Crawler"
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            className="flex-1 px-3.5 py-2 text-xs bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary/30 focus:border-primary/50"
          />
          <button 
            type="submit"
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-zinc-100 dark:text-zinc-900 font-bold text-xs rounded-lg transition-colors cursor-pointer flex-shrink-0"
          >
            Launch Custom
          </button>
        </form>
      </div>

    </div>
  );
}
