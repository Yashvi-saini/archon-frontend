"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import "@excalidraw/excalidraw/index.css";

const Excalidraw = dynamic(
  async () => {
    const module = await import("@excalidraw/excalidraw");
    return module.Excalidraw;
  },
  { ssr: false }
);

interface WhiteboardCanvasProps {
  setExcalidrawAPI: (api: any) => void;
}

export const WhiteboardCanvas: React.FC<WhiteboardCanvasProps> = ({ setExcalidrawAPI }) => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";

  return (
    <div className="flex-1 w-full h-full relative bg-zinc-50 dark:bg-[#0b0c10] border-r border-zinc-200 dark:border-zinc-850 overflow-hidden">
      <Excalidraw 
        excalidrawAPI={(api) => {
          setExcalidrawAPI(api);
        }}
        theme={isDarkMode ? "dark" : "light"}
      />
    </div>
  );
};
