"use client";

import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import "@excalidraw/excalidraw/index.css";
import type { CanvasPreferences, ExcalidrawElementSnapshot } from "../../types";
import { getSystemDesignLibraryItems } from "../../lib/system-design-library";
import type { ExcalidrawInitialDataState } from "@excalidraw/excalidraw/types";

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
  const { theme, resolvedTheme } = useTheme();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [activeApi, setActiveApi] = useState<any>(null);
  const apiRef = useRef<unknown>(null);
  const libraryLoadedRef = useRef(false);
  const lastElementsRef = useRef<readonly unknown[] | null>(null);

  const isDark = (resolvedTheme || theme) !== "light";

  // Pre-generate system design library items (individual components) once
  const systemDesignLib = useRef(getSystemDesignLibraryItems());

  // Clean old duplicate library cache (without touching user theme settings)
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
          openLibraryMenu: false,
          defaultStatus: "published",
        });
        libraryLoadedRef.current = true;
      }
    } catch (err) {
      console.warn("[WhiteboardCanvas] Could not update Excalidraw library drawer:", err);
    }
  }, [activeApi]);

  // Dynamically sync theme (dark or light) to Excalidraw canvas
  useEffect(() => {
    if (!activeApi) return;
    try {
      if (typeof activeApi.updateScene === "function") {
        activeApi.updateScene({
          appState: {
            gridModeEnabled: false,
            viewBackgroundColor: isDark ? "#121212" : "#ffffff",
            currentItemStrokeColor: isDark ? "#e4e4e7" : "#18181b",
            theme: isDark ? "dark" : "light",
          },
        });
      }
    } catch {
      // ignore
    }
  }, [activeApi, isDark]);

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

  // Default initial canvas state matches current active theme, with sidebar closed
  const initialData: ExcalidrawInitialDataState = useMemo(() => {
    return {
      elements: [],
      appState: {
        viewBackgroundColor: isDark ? "#121212" : "#ffffff",
        currentItemStrokeColor: isDark ? "#e4e4e7" : "#18181b",
        gridModeEnabled: false,
        objectsSnapModeEnabled: false,
        openSidebar: null,
        theme: isDark ? "dark" : "light",
      },
    };
  }, [isDark]);

  return (
    <div className="flex-1 w-full h-full relative bg-white dark:bg-[#121212] border-r border-zinc-200 dark:border-zinc-850 overflow-hidden">
      <Excalidraw
        excalidrawAPI={handleExcalidrawApi}
        theme={isDark ? "dark" : "light"}
        gridModeEnabled={false}
        initialData={initialData}
        onChange={handleChange}
      />
    </div>
  );
};
