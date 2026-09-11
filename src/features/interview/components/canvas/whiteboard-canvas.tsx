"use client";

import React, { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import "@excalidraw/excalidraw/index.css";
import type { CanvasPreferences, ExcalidrawElementSnapshot } from "../../types";

const Excalidraw = dynamic(
  async () => {
    const module = await import("@excalidraw/excalidraw");
    return module.Excalidraw;
  },
  { ssr: false }
);

interface WhiteboardCanvasProps {
  setExcalidrawAPI: (api: unknown) => void;
  onSceneChange?: (elements: readonly ExcalidrawElementSnapshot[]) => void;
  initialElements?: readonly unknown[];
  canvasPreferences?: CanvasPreferences;
}

export const WhiteboardCanvas: React.FC<WhiteboardCanvasProps> = ({
  setExcalidrawAPI,
  onSceneChange,
  initialElements,
  canvasPreferences,
}) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const apiRef = useRef<unknown>(null);
  const restoredRef = useRef(false);

  const gridEnabled = canvasPreferences?.gridType !== "blank";

  useEffect(() => {
    if (!initialElements?.length || restoredRef.current) return;
    const api = apiRef.current as { updateScene?: (scene: { elements: readonly unknown[] }) => void } | null;
    if (!api?.updateScene) return;

    api.updateScene({ elements: initialElements });
    restoredRef.current = true;
  }, [initialElements]);

  return (
    <div className="flex-1 w-full h-full relative bg-zinc-50 dark:bg-[#0b0c10] border-r border-zinc-200 dark:border-zinc-850 overflow-hidden">
      <Excalidraw
        excalidrawAPI={(api) => {
          apiRef.current = api;
          setExcalidrawAPI(api);
        }}
        theme={isDarkMode ? "dark" : "light"}
        gridModeEnabled={gridEnabled}
        initialData={{
          // Restored diagram elements are built to match Excalidraw's schema at runtime
          elements: (initialElements ?? []) as never[],
          appState: {
            viewBackgroundColor: isDarkMode ? "#0b0c10" : "#fafafa",
            currentItemStrokeColor: "#1e1e1e",
            objectsSnapModeEnabled: canvasPreferences?.snapToGrid ?? true,
          },
        }}
        onChange={(elements) => {
          if (onSceneChange && elements) {
            onSceneChange(elements as readonly ExcalidrawElementSnapshot[]);
          }
        }}
      />
    </div>
  );
};
