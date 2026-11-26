"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Search,
  X,
  Plus,
  Box,
  Database,
  Layers,
  Zap,
  Radio,
  Split,
  ShieldCheck,
  Server,
  KeyRound,
  Cpu,
  Smartphone,
  Globe,
  Cloud,
  HardDrive,
  Workflow,
  BarChart3,
  MapPin,
  Lock,
  LineChart,
  FileText,
  Boxes,
  Activity,
  Check,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import {
  SYSTEM_DESIGN_COMPONENTS,
  type SystemDesignComponentItem,
  type SystemDesignCategory,
  createComponentElements,
} from "../../lib/system-design-library";
import type { ExcalidrawElementSnapshot, WsNodeData } from "../../types";

interface ComponentLibraryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  excalidrawAPI: any;
  sendNodeEvent?: (type: "node_added" | "node_updated", data: WsNodeData) => void;
  onSceneChange?: (elements: readonly ExcalidrawElementSnapshot[]) => void;
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
  Radio,
  Workflow,
  BarChart3,
  MapPin,
  Lock,
  LineChart,
  FileText,
  Boxes,
  Activity,
};

type CategoryFilter = "All" | SystemDesignCategory;

const CATEGORIES: { label: string; value: CategoryFilter; icon: string }[] = [
  { label: "All", value: "All", icon: "✨" },
  { label: "Databases", value: "Data & Storage", icon: "🗄️" },
  { label: "Queues & Events", value: "Async & Messaging", icon: "📨" },
  { label: "Compute & APIs", value: "Compute", icon: "⚙️" },
  { label: "Network & Routing", value: "Network & Routing", icon: "🔀" },
  { label: "Edge & Clients", value: "Edge & Client", icon: "📱" },
  { label: "Search & Specialized", value: "Specialized & Search", icon: "🔍" },
  { label: "Observability", value: "Observability & Security", icon: "📊" },
];

export const ComponentLibraryDrawer: React.FC<ComponentLibraryDrawerProps> = ({
  isOpen,
  onClose,
  excalidrawAPI,
  sendNodeEvent,
  onSceneChange,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("All");
  const [justAddedId, setJustAddedId] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus search input when drawer opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Live real-time search filtering on the same page
  const filteredComponents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return SYSTEM_DESIGN_COMPONENTS.filter((item) => {
      const matchesCategory =
        selectedCategory === "All" || item.category === selectedCategory;

      if (!matchesCategory) return false;
      if (!q) return true;

      const inName = item.name.toLowerCase().includes(q);
      const inType = item.type.toLowerCase().includes(q);
      const inDesc = item.description.toLowerCase().includes(q);
      const inTopics = item.defaultTopics?.some((t) => t.toLowerCase().includes(q));

      return inName || inType || inDesc || inTopics;
    });
  }, [searchQuery, selectedCategory]);

  // Add exactly ONE component to the whiteboard canvas
  const handleAddComponent = (item: SystemDesignComponentItem) => {
    if (!excalidrawAPI) {
      toast.error("Whiteboard canvas is still initializing");
      return;
    }

    try {
      const currentElements = excalidrawAPI.getSceneElements() || [];
      const appState = excalidrawAPI.getAppState() || {};

      // Calculate center of current viewport in scene coordinates
      const scrollX = appState.scrollX || 0;
      const scrollY = appState.scrollY || 0;
      const zoom = appState.zoom?.value || 1;
      const width = appState.width || 800;
      const height = appState.height || 600;

      // Stagger offset so elements don't stack directly on top of each other
      const existingActive = currentElements.filter(
        (el: { isDeleted?: boolean }) => !el.isDeleted
      );
      const stagger = (existingActive.length % 7) * 36;

      const x = Math.round(-scrollX + width / 2 / zoom - item.width / 2 + stagger);
      const y = Math.round(-scrollY + height / 2 / zoom - item.height / 2 + stagger);

      // Create new elements (for database, creates primary body + decorative top cap + bound text)
      const newElements = createComponentElements(item, x, y);
      const updatedElements = [...currentElements, ...newElements];

      // 1. Update the canvas visual scene with exactly this component
      excalidrawAPI.updateScene({
        elements: updatedElements,
        commitToHistory: true,
      });

      // 2. Identify the primary shape element ID
      const primaryElement = newElements[0];
      const shapeId = primaryElement?.id || `comp-${item.id}-${Date.now()}`;

      // 3. Construct WebSocket node payload (strictly ONE node)
      const nodePayload: WsNodeData = {
        id: shapeId,
        type: item.type,
        label: item.name,
        x,
        y,
      };

      // 4. Send exactly ONE node_added event to Go backend
      if (sendNodeEvent) {
        sendNodeEvent("node_added", nodePayload);
      }

      // 5. Trigger local scene sync so detected architecture summary increments by 1
      if (onSceneChange) {
        onSceneChange(updatedElements as readonly ExcalidrawElementSnapshot[]);
      }

      // Visual feedback
      setJustAddedId(item.id);
      setTimeout(() => setJustAddedId(null), 1200);
      toast.success(`Added ${item.name} to whiteboard`);
    } catch (err) {
      console.error("[ComponentLibraryDrawer] Error placing component:", err);
      toast.error("Failed to add component onto canvas");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-2 left-2 bottom-2 z-30 w-84 sm:w-96 bg-white/95 dark:bg-[#0f1117]/95 backdrop-blur-xl border border-zinc-200/90 dark:border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-left-4 duration-200 font-sans pointer-events-auto">
      {/* Header */}
      <div className="p-3.5 border-b border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between shrink-0 bg-zinc-50/60 dark:bg-zinc-900/40">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
            <Box className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <span>Component Library</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-zinc-200/70 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                {filteredComponents.length}
              </span>
            </h3>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
              Click any stencil to add to whiteboard
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
          title="Close Library Drawer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Real-time Search Bar on Same Page */}
      <div className="p-3 border-b border-zinc-100 dark:border-zinc-800/60 shrink-0">
        <div className="relative">
          <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search components (e.g. postgres, redis, kafka)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8.5 pr-8 py-2 text-xs bg-zinc-100/80 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-750 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-hidden focus:ring-1 focus:ring-violet-500/50 focus:border-violet-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto mt-2 pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-2 py-1 text-[10.5px] rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1 ${
                selectedCategory === cat.value
                  ? "bg-violet-600 text-white font-semibold shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/80"
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Component Cards List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
        {filteredComponents.length === 0 ? (
          <div className="py-12 text-center flex flex-col items-center justify-center gap-2">
            <Search className="h-6 w-6 text-zinc-300 dark:text-zinc-600" />
            <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
              No components found
            </p>
            <p className="text-[11px] text-zinc-400 max-w-xs">
              No components match &quot;{searchQuery}&quot;. Try searching for &quot;postgres&quot;, &quot;cache&quot;, or &quot;kafka&quot;.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
              className="mt-1 text-[11px] text-violet-600 dark:text-violet-400 hover:underline font-semibold cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        ) : (
          filteredComponents.map((item) => {
            const IconComponent = ICON_MAP[item.icon] || Box;
            const isJustAdded = justAddedId === item.id;

            // Render shape badge
            const shapeLabel =
              item.shape === "cylinder" || item.type === "database"
                ? "Cylinder"
                : item.shape === "capsule" || item.type === "cache" || item.type === "queue"
                ? "Capsule"
                : item.shape === "diamond"
                ? "Diamond"
                : item.shape === "ellipse"
                ? "Ellipse"
                : "Block";

            return (
              <div
                key={item.id}
                className="group p-2.5 rounded-xl border border-zinc-200/70 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 hover:bg-zinc-100/80 dark:hover:bg-zinc-850/60 hover:border-violet-500/40 dark:hover:border-violet-500/40 transition-all flex items-start gap-2.5"
              >
                {/* Visual Shape Preview Badge */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-xs transition-transform group-hover:scale-105 ${
                    item.shape === "ellipse"
                      ? "rounded-full"
                      : item.shape === "cylinder"
                      ? "rounded-t-2xl rounded-b-lg"
                      : item.shape === "capsule"
                      ? "rounded-2xl"
                      : "rounded-xl"
                  }`}
                  style={{
                    backgroundColor: item.bgColor,
                    borderColor: item.strokeColor,
                    color: item.strokeColor,
                  }}
                >
                  <IconComponent className="h-5 w-5" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                      {item.name}
                    </h4>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-700/60">
                      {shapeLabel}
                    </span>
                  </div>
                  <p className="text-[10.5px] text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-0.5 leading-snug">
                    {item.description}
                  </p>

                  {/* Topics chips */}
                  {item.defaultTopics && item.defaultTopics.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap mt-1.5">
                      {item.defaultTopics.slice(0, 3).map((topic) => (
                        <span
                          key={topic}
                          className="text-[8.5px] font-mono px-1.5 py-0.2 rounded bg-zinc-200/50 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add Button */}
                <button
                  type="button"
                  onClick={() => handleAddComponent(item)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all shrink-0 cursor-pointer ${
                    isJustAdded
                      ? "bg-emerald-600 text-white"
                      : "bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 group-hover:bg-violet-600 dark:group-hover:bg-violet-500 dark:group-hover:text-white"
                  }`}
                  title={`Add ${item.name} to whiteboard`}
                >
                  {isJustAdded ? (
                    <>
                      <Check className="h-3 w-3" />
                      <span>Added</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-3 w-3" />
                      <span>Add</span>
                    </>
                  )}
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="p-2.5 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 text-[10px] text-zinc-400 text-center flex items-center justify-between px-3 shrink-0">
        <span>Clicking &quot;Add&quot; places 1 component on canvas</span>
        <span className="font-mono text-violet-500 font-semibold">Auto-Sync JSON</span>
      </div>
    </div>
  );
};
