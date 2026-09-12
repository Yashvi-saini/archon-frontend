"use client";

import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import "@excalidraw/excalidraw/index.css";
import type { CanvasPreferences, ExcalidrawElementSnapshot } from "../../types";
import { getSystemDesignLibraryItems } from "../../lib/system-design-library";

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
  canvasPreferences?: CanvasPreferences;
}

export const WhiteboardCanvas: React.FC<WhiteboardCanvasProps> = ({
  setExcalidrawAPI,
  onSceneChange,
  canvasPreferences,
}) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [activeApi, setActiveApi] = useState<any>(null);
  const apiRef = useRef<unknown>(null);
  const libraryLoadedRef = useRef(false);
  const lastElementsRef = useRef<readonly unknown[] | null>(null);

  const gridEnabled = canvasPreferences?.gridType !== "blank";

  // Pre-generate system design library items (individual components) once
  const systemDesignLib = useRef(getSystemDesignLibraryItems());

  // Clean old duplicate library cache from localStorage on client mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem("excalidraw-library");
      } catch {
        // ignore storage errors
      }
    }
  }, []);

  // Load system design components into Excalidraw's native Library drawer (no duplication)
  useEffect(() => {
    if (!activeApi || libraryLoadedRef.current) return;

    try {
      if (typeof activeApi.updateLibrary === "function") {
        activeApi.updateLibrary({
          libraryItems: systemDesignLib.current,
          merge: false,
          openLibraryMenu: true,
          defaultStatus: "published",
        });
        libraryLoadedRef.current = true;
      }
    } catch (err) {
      console.warn("[WhiteboardCanvas] Could not update Excalidraw library drawer:", err);
    }
  }, [activeApi]);

  const handleExcalidrawApi = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (api: any) => {
      if (!api || apiRef.current === api) return;
      apiRef.current = api;
      setActiveApi(api);
      setExcalidrawAPI(api);
    },
    [setExcalidrawAPI]
  );

  const handleChange = useCallback(
    (elements: readonly unknown[]) => {
      if (!onSceneChange) return;
      if (lastElementsRef.current === elements) return;
      lastElementsRef.current = elements;
      onSceneChange(elements as readonly ExcalidrawElementSnapshot[]);
    },
    [onSceneChange]
  );

  const initialData = useMemo(() => {
    return {
      elements: [] as never[],
      appState: {
        viewBackgroundColor: isDarkMode ? "#0b0c10" : "#fafafa",
        currentItemStrokeColor: "#1e1e1e",
        objectsSnapModeEnabled: canvasPreferences?.snapToGrid ?? true,
        openSidebar: { name: "default" },
      },
    };
  }, [isDarkMode, canvasPreferences?.snapToGrid]);

  return (
    <div className="flex-1 w-full h-full relative bg-zinc-50 dark:bg-[#0b0c10] border-r border-zinc-200 dark:border-zinc-850 overflow-hidden">
      <Excalidraw
        excalidrawAPI={handleExcalidrawApi}
        theme={isDarkMode ? "dark" : "light"}
        gridModeEnabled={gridEnabled}
        initialData={initialData}
        onChange={handleChange}
      />
    </div>
  );
};
