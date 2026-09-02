"use client";

import React from "react";

interface RadialGaugeProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  colorClassName?: string;
}

export function RadialScoreGauge({
  value,
  size = 140,
  strokeWidth = 10,
  label,
  sublabel,
  colorClassName = "text-primary",
}: RadialGaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(Math.max(value, 0), 100) / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90 transform">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-zinc-100 dark:text-zinc-800/80"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={`${colorClassName} transition-all duration-1000 ease-out`}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
          {value}
        </span>
        {label && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mt-0.5">
            {label}
          </span>
        )}
        {sublabel && (
          <span className="text-[9px] text-zinc-400">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}

interface TrendDataPoint {
  label: string;
  value: number;
}

interface AreaTrendChartProps {
  data: TrendDataPoint[];
  height?: number;
  showGrid?: boolean;
}

export function AreaTrendChart({ data, height = 180, showGrid = true }: AreaTrendChartProps) {
  if (!data || data.length === 0) return null;

  const width = 600;
  const paddingX = 40;
  const paddingTop = 20;
  const paddingBottom = 30;

  const values = data.map((d) => d.value);
  const minVal = Math.min(...values, 0);
  const maxVal = Math.max(...values, 100);

  const getY = (val: number) => {
    const range = maxVal - minVal || 1;
    return height - paddingBottom - ((val - minVal) / range) * (height - paddingTop - paddingBottom);
  };

  const getX = (idx: number) => {
    if (data.length <= 1) return width / 2;
    return paddingX + (idx / (data.length - 1)) * (width - 2 * paddingX);
  };

  const points = data.map((d, i) => ({ x: getX(i), y: getY(d.value) }));
  
  let linePath = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    const cpX = (current.x + next.x) / 2;
    linePath += ` C ${cpX} ${current.y}, ${cpX} ${next.y}, ${next.x} ${next.y}`;
  }

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible" preserveAspectRatio="none">
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#BA68C8" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#BA68C8" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {showGrid && (
          <>
            {[0, 25, 50, 75, 100].map((level) => {
              const y = getY(level);
              return (
                <g key={level}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={width - paddingX}
                    y2={y}
                    stroke="currentColor"
                    strokeDasharray="3 3"
                    className="text-zinc-200 dark:text-zinc-800"
                  />
                  <text
                    x={paddingX - 8}
                    y={y + 3}
                    textAnchor="end"
                    className="text-[9px] fill-zinc-400 dark:fill-zinc-600 font-mono"
                  >
                    {level}
                  </text>
                </g>
              );
            })}
          </>
        )}

        <path d={areaPath} fill="url(#areaGradient)" />

        <path
          d={linePath}
          fill="none"
          stroke="#BA68C8"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {points.map((p, i) => (
          <g key={i} className="group cursor-pointer">
            <circle
              cx={p.x}
              cy={p.y}
              r="4"
              className="fill-white dark:fill-zinc-900 stroke-primary stroke-[2.5] transition-all hover:scale-125"
            />
            <text
              x={p.x}
              y={height - 10}
              textAnchor="middle"
              className="text-[10px] fill-zinc-400 dark:fill-zinc-500 font-medium"
            >
              {data[i].label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

interface RadarMetric {
  label: string;
  value: number;
}

interface SkillRadarProps {
  metrics: RadarMetric[];
  size?: number;
}

export function SkillRadar({ metrics, size = 260 }: SkillRadarProps) {
  const center = size / 2;
  const radius = size * 0.38;
  const count = metrics.length;
  const angleStep = (2 * Math.PI) / count;
  const rings = [0.25, 0.5, 0.75, 1.0];

  const getPoint = (valuePct: number, index: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const dist = radius * (valuePct / 100);
    return {
      x: center + dist * Math.cos(angle),
      y: center + dist * Math.sin(angle),
    };
  };

  const polygonPoints = metrics
    .map((m, i) => {
      const p = getPoint(m.value, i);
      return `${p.x},${p.y}`;
    })
    .join(" ");

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="overflow-visible">
        <defs>
          <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#BA68C8" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#BA68C8" stopOpacity="0.05" />
          </radialGradient>
        </defs>

        {rings.map((ring, ringIdx) => {
          const ringPoints = metrics
            .map((_, i) => {
              const p = getPoint(ring * 100, i);
              return `${p.x},${p.y}`;
            })
            .join(" ");
          return (
            <polygon
              key={ringIdx}
              points={ringPoints}
              fill="none"
              stroke="currentColor"
              strokeWidth={ring === 1.0 ? 1.2 : 0.8}
              strokeDasharray={ring < 1.0 ? "2 2" : undefined}
              className="text-zinc-200 dark:text-zinc-800"
            />
          );
        })}

        {metrics.map((_, i) => {
          const outerPoint = getPoint(100, i);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={outerPoint.x}
              y2={outerPoint.y}
              stroke="currentColor"
              strokeWidth="0.8"
              className="text-zinc-200 dark:text-zinc-800"
            />
          );
        })}

        <polygon
          points={polygonPoints}
          fill="url(#radarGlow)"
          stroke="#BA68C8"
          strokeWidth="2"
          className="transition-all duration-700"
        />

        {metrics.map((m, i) => {
          const p = getPoint(m.value, i);
          return (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="3.5"
              className="fill-white dark:fill-zinc-900 stroke-primary stroke-[2]"
            />
          );
        })}

        {metrics.map((m, i) => {
          const labelDist = radius + 22;
          const angle = i * angleStep - Math.PI / 2;
          const lx = center + labelDist * Math.cos(angle);
          const ly = center + labelDist * Math.sin(angle);

          return (
            <text
              key={i}
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-[10px] font-semibold fill-zinc-600 dark:fill-zinc-400"
            >
              {m.label}
              <tspan x={lx} dy="12" className="text-[9px] font-bold fill-primary">
                {m.value}%
              </tspan>
            </text>
          );
        })}
      </svg>
    </div>
  );
}

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}

export function Sparkline({ data, width = 70, height = 24, color = "#BA68C8" }: SparklineProps) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * (width - 4) + 2;
      const y = height - 2 - ((val - min) / range) * (height - 4);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} className="overflow-visible inline-block">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}
