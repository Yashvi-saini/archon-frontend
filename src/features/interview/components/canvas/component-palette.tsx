"use client";

import React, { useState } from "react";
import {
  Smartphone,
  Globe,
  Cloud,
  Split,
  ShieldCheck,
  Server,
  KeyRound,
  Cpu,
  Database,
  Layers,
  Zap,
  HardDrive,
  Search,
  GitFork,
  ChevronDown,
  ChevronUp,
  Box,
  Code2,
  Check,
  Copy,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import { toast } from "sonner";
import {
  SYSTEM_DESIGN_COMPONENTS,
  type SystemDesignComponentItem,
  createComponentElements,
} from "../../lib/system-design-library";
import type { DetectedArchitectureSummary } from "../../lib/diagram-utils";
import type { ExcalidrawElementSnapshot, WsNodeData } from "../../types";

interface ComponentPaletteProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  excalidrawAPI: any;
  architectureSummary?: DetectedArchitectureSummary;
  onSendArchitectureToAi?: (summary: DetectedArchitectureSummary) => void;
  sendNodeEvent?: (type: "node_added" | "node_updated", data: WsNodeData) => void;
  onSceneChange?: (elements: readonly ExcalidrawElementSnapshot[]) => void;
  onSyncAllNodes?: () => void;
  wsStatus?: string;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Smartphone,
  Globe,
  Cloud,
  Split,
  ShieldCheck,
  Server,
  KeyRound,
  Cpu,
  Database,
  Layers,
  Zap,
  HardDrive,
  Search,
  GitFork,
};

type CategoryFilter =
  | "All"
  | "Edge & Client"
  | "Network & Routing"
  | "Compute"
  | "Data & Storage"
  | "Async & Messaging";

export const ComponentPalette: React.FC<ComponentPaletteProps> = ({
  excalidrawAPI,
  architectureSummary,
  onSendArchitectureToAi,
  sendNodeEvent,
  onSceneChange,
  onSyncAllNodes,
  wsStatus,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("All");
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  const categories: CategoryFilter[] = [
    "All",
    "Edge & Client",
    "Network & Routing",
    "Compute",
    "Data & Storage",
    "Async & Messaging",
  ];

  const filteredComponents =
    selectedCategory === "All"
      ? SYSTEM_DESIGN_COMPONENTS
      : SYSTEM_DESIGN_COMPONENTS.filter((c) => c.category === selectedCategory);

  const handleAddComponent = (item: SystemDesignComponentItem) => {
    if (!excalidrawAPI) {
      toast.error("Whiteboard canvas is still initializing");
      return;
    }

    try {
      const currentElements = excalidrawAPI.getSceneElements() || [];
      const appState = excalidrawAPI.getAppState() || {};

      // Determine placement based on canvas scroll or center
      const scrollX = appState.scrollX || 0;
      const scrollY = appState.scrollY || 0;
      const zoom = appState.zoom?.value || 1;
      const width = appState.width || 800;
      const height = appState.height || 600;

      // Center of current viewport in scene coordinates, staggered by existing count
      const existingCount = currentElements.filter((el: { isDeleted?: boolean }) => !el.isDeleted).length;
      const staggerOffset = (existingCount % 6) * 35;

      const x = Math.round((-scrollX + width / 2 / zoom) - item.width / 2 + staggerOffset);
      const y = Math.round((-scrollY + height / 2 / zoom) - item.height / 2 + staggerOffset);

      const newElements = createComponentElements(item, x, y);
      const updatedElements = [...currentElements, ...newElements];

      // 1. Update the canvas visual scene
      excalidrawAPI.updateScene({
        elements: updatedElements,
        commitToHistory: true,
      });

      // 2. Extract the primary shape element ID
      const shapeId = newElements[0]?.id || `comp-${item.type}-${Date.now()}`;

      // 3. Construct the exact backend JSON payload
      const nodePayload: WsNodeData = {
        id: shapeId,
        type: item.type,
        label: item.name,
        x,
        y,
      };

      // 4. Immediately send the JSON event over WebSocket to backend
      if (sendNodeEvent) {
        sendNodeEvent("node_added", nodePayload);
        console.log("[ComponentPalette] Sent node_added JSON to backend:", nodePayload);
      }

      // 5. Trigger local scene sync so detected architecture summary updates instantly
      if (onSceneChange) {
        onSceneChange(updatedElements as readonly ExcalidrawElementSnapshot[]);
      }

      toast.success(`Added ${item.name} (${item.type}) & sent JSON to backend`);
    } catch (err) {
      console.error("[ComponentPalette] Error adding component:", err);
      toast.error("Failed to place component onto canvas");
    }
  };

  const handleCopyJson = () => {
    if (!architectureSummary) return;
    const jsonStr = JSON.stringify(architectureSummary.jsonPayload, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopiedJson(true);
    toast.success("Architecture JSON copied to clipboard");
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <>
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-2 max-w-[calc(100%-24px)] pointer-events-auto">
        {/* Header bar / Quick status & controls */}
        <div className="flex items-center gap-2 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800 rounded-xl px-3 py-1.5 shadow-md">
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-zinc-100 hover:text-primary transition-colors cursor-pointer"
          >
            <Box className="h-4 w-4 text-primary" />
            <span>Architecture Stencils</span>
            {isExpanded ? (
              <ChevronUp className="h-3.5 w-3.5 text-zinc-400" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
            )}
          </button>

          <span className="h-3 w-px bg-zinc-200 dark:bg-zinc-800 mx-1" />

          {/* Detected components counter badge & modal trigger */}
          <button
            type="button"
            onClick={() => setShowJsonModal(true)}
            className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 px-2 py-0.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Inspect detected whiteboard components JSON"
          >
            <Code2 className="h-3.5 w-3.5 text-emerald-500" />
            <span>
              {architectureSummary?.totalComponents ?? 0} components detected
            </span>
          </button>

          {/* Quick sync to backend button */}
          {onSyncAllNodes && (
            <button
              type="button"
              onClick={onSyncAllNodes}
              disabled={wsStatus !== "open"}
              className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-0.5 rounded-md transition-colors cursor-pointer disabled:opacity-50"
              title="Send all components on canvas to backend"
            >
              <UploadCloud className="h-3 w-3" />
              <span>Sync Backend</span>
            </button>
          )}

          {architectureSummary && architectureSummary.totalComponents > 0 && onSendArchitectureToAi && (
            <button
              type="button"
              onClick={() => onSendArchitectureToAi(architectureSummary)}
              className="flex items-center gap-1 text-[10px] font-semibold text-primary bg-primary/10 hover:bg-primary/20 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
              title="Evaluate this architecture with AI Interviewer"
            >
              <Sparkles className="h-3 w-3" />
              <span>Ask AI Review</span>
            </button>
          )}
        </div>

        {/* Expandable Palette Body */}
        {isExpanded && (
          <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-2.5 shadow-xl w-full max-w-[720px] transition-all animate-in fade-in slide-in-from-top-2 duration-150">
            {/* Category filter tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-none border-b border-zinc-100 dark:border-zinc-800/80">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 text-[11px] rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 font-semibold shadow-xs"
                      : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Components Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1.5 pt-2 max-h-[220px] overflow-y-auto pr-1">
              {filteredComponents.map((item) => {
                const IconComponent = ICON_MAP[item.icon] || Box;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleAddComponent(item)}
                    className="flex items-center gap-2 p-2 rounded-xl text-left bg-zinc-50/80 dark:bg-zinc-850/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-800/80 transition-all hover:scale-[1.02] cursor-pointer group shadow-2xs"
                    title={`${item.description} (Type: ${item.type}) - Click to place & send JSON`}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 border"
                      style={{
                        backgroundColor: item.bgColor,
                        borderColor: item.strokeColor,
                        color: item.strokeColor,
                      }}
                    >
                      <IconComponent className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-200 truncate leading-tight group-hover:text-primary">
                        {item.name}
                      </p>
                      <p className="text-[9px] text-zinc-400 font-mono truncate capitalize">
                        {item.type}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Architecture JSON Inspector Modal */}
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
                className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 px-2 py-1 rounded-md"
              >
                ✕ Close
              </button>
            </div>

            {/* JSON Code Viewer */}
            <div className="flex-1 overflow-y-auto my-3 bg-zinc-950 text-zinc-100 rounded-xl p-3 font-mono text-[11px] leading-relaxed border border-zinc-800 select-all">
              <pre>
                {JSON.stringify(architectureSummary?.jsonPayload ?? {}, null, 2)}
              </pre>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800 flex-wrap gap-2">
              <span className="text-[11px] text-zinc-500 font-sans">
                {architectureSummary?.totalComponents ?? 0} components •{" "}
                {architectureSummary?.edges.length ?? 0} connections
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
                {onSyncAllNodes && (
                  <button
                    type="button"
                    onClick={() => {
                      onSyncAllNodes();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    <UploadCloud className="h-3.5 w-3.5" />
                    <span>Sync JSON to Backend</span>
                  </button>
                )}
                {onSendArchitectureToAi && (
                  <button
                    type="button"
                    onClick={() => {
                      if (architectureSummary) {
                        onSendArchitectureToAi(architectureSummary);
                        setShowJsonModal(false);
                      }
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Send to AI Interviewer</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
