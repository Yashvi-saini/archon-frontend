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
  const { setTheme } = useTheme();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [activeApi, setActiveApi] = useState<any>(null);
  const apiRef = useRef<unknown>(null);
  const libraryLoadedRef = useRef(false);
  const lastElementsRef = useRef<readonly unknown[] | null>(null);

  // Pre-generate system design library items (individual components) once
  const systemDesignLib = useRef(getSystemDesignLibraryItems());

  // Clean old duplicate library cache and ensure dark theme in storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem("excalidraw-library");
        window.localStorage.removeItem("theme");
        window.localStorage.setItem("archon-theme-v2", "dark");
        window.localStorage.setItem("excalidraw-theme", "dark");
        setTheme("dark");
      } catch {
        // ignore storage errors
      }
    }
  }, [setTheme]);

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

  // Safely sync dark theme to Excalidraw after mount, keeping sidebar closed by default
  useEffect(() => {
    if (!activeApi) return;
    try {
      if (typeof activeApi.updateScene === "function") {
        activeApi.updateScene({
          appState: {
            gridModeEnabled: false,
            viewBackgroundColor: "#121212",
            currentItemStrokeColor: "#e4e4e7",
            theme: "dark",
            openSidebar: null,
          },
        });
      }
    } catch {
      // ignore
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

  // Default initial canvas state is strictly dark themed and blank, with sidebar closed
  const initialData: ExcalidrawInitialDataState = useMemo(() => {
    return {
      elements: [],
      appState: {
        viewBackgroundColor: "#121212",
        currentItemStrokeColor: "#e4e4e7",
        gridModeEnabled: false,
        objectsSnapModeEnabled: false,
        openSidebar: null,
        theme: "dark" as const,
      },
    };
  }, []);

  return (
    <div className="flex-1 w-full h-full relative bg-[#121212] border-r border-zinc-200 dark:border-zinc-850 overflow-hidden">
      <Excalidraw
        excalidrawAPI={handleExcalidrawApi}
        theme="dark"
        gridModeEnabled={false}
        initialData={initialData}
        onChange={handleChange}
      />
    </div>
  );
};
