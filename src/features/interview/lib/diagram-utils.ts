import type { DiagramEdge, DiagramNode, ExcalidrawElementSnapshot } from "../types";

const NODE_WIDTH = 140;
const NODE_HEIGHT = 70;

function hashSeed(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function shapeToNodeType(excalidrawType: string, label: string): string {
  const l = label.toLowerCase();
  if (l.includes("database") || l.includes("db") || l.includes("postgres") || l.includes("mysql") || l.includes("mongo")) return "database";
  if (l.includes("cache") || l.includes("redis") || l.includes("memcache")) return "cache";
  if (l.includes("queue") || l.includes("kafka") || l.includes("rabbit") || l.includes("sqs")) return "queue";
  if (l.includes("load balancer") || l.includes("lb") || l.includes("nginx") || l.includes("gateway")) return "load_balancer";
  if (l.includes("cdn")) return "cdn";
  if (l.includes("client") || l.includes("user") || l.includes("browser") || l.includes("mobile")) return "client";
  if (l.includes("storage") || l.includes("s3") || l.includes("blob")) return "storage";
  if (excalidrawType === "ellipse") return "client";
  if (excalidrawType === "diamond") return "gateway";
  return "service";
}

export function inferEdgeProtocol(label: string): string {
  const l = label.toLowerCase();
  if (l.includes("grpc")) return "grpc";
  if (l.includes("tcp")) return "tcp";
  if (l.includes("pubsub") || l.includes("pub/sub")) return "pubsub";
  if (l.includes("ws") || l.includes("websocket")) return "ws";
  return "http";
}

function nodeTypeToShape(type: string): "rectangle" | "ellipse" | "diamond" {
  if (type === "client") return "ellipse";
  if (type === "gateway" || type === "load_balancer") return "diamond";
  return "rectangle";
}

function nodeBackground(type: string): string {
  if (type === "client") return "#b2f2bb";
  if (type === "gateway" || type === "load_balancer") return "#ffec99";
  if (type === "database") return "#ffc9c9";
  if (type === "cache") return "#d0bfff";
  if (type === "queue") return "#ffd8a8";
  return "#a5d8ff";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createShapeElement(node: DiagramNode): any {
  const shape = nodeTypeToShape(node.type);
  return {
    id: node.id,
    type: shape,
    x: node.x,
    y: node.y,
    width: NODE_WIDTH,
    height: NODE_HEIGHT,
    angle: 0,
    strokeColor: "#1e1e1e",
    backgroundColor: nodeBackground(node.type),
    fillStyle: "solid",
    strokeWidth: 2,
    strokeStyle: "solid",
    roughness: 1,
    opacity: 100,
    groupIds: [],
    frameId: null,
    roundness: shape === "rectangle" ? { type: 3 } : { type: 2 },
    seed: hashSeed(node.id),
    version: 1,
    versionNonce: hashSeed(`${node.id}-v`),
    isDeleted: false,
    boundElements: [{ id: `${node.id}-label`, type: "text" }],
    updated: 1,
    link: null,
    locked: false,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createLabelElement(node: DiagramNode): any {
  return {
    id: `${node.id}-label`,
    type: "text",
    x: node.x + 12,
    y: node.y + NODE_HEIGHT / 2 - 12,
    width: NODE_WIDTH - 24,
    height: 24,
    angle: 0,
    strokeColor: "#1e1e1e",
    backgroundColor: "transparent",
    fillStyle: "solid",
    strokeWidth: 1,
    strokeStyle: "solid",
    roughness: 0,
    opacity: 100,
    groupIds: [],
    frameId: null,
    roundness: null,
    seed: hashSeed(`${node.id}-label`),
    version: 1,
    versionNonce: hashSeed(`${node.id}-label-v`),
    isDeleted: false,
    boundElements: null,
    updated: 1,
    link: null,
    locked: false,
    text: node.label,
    fontSize: 16,
    fontFamily: 1,
    textAlign: "center",
    verticalAlign: "middle",
    containerId: node.id,
    originalText: node.label,
    autoResize: true,
    lineHeight: 1.25,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createArrowElement(edge: DiagramEdge, nodesById: Map<string, DiagramNode>): any | null {
  const source = nodesById.get(edge.source);
  const target = nodesById.get(edge.target);
  if (!source || !target) return null;

  const sx = source.x + NODE_WIDTH / 2;
  const sy = source.y + NODE_HEIGHT / 2;
  const tx = target.x + NODE_WIDTH / 2;
  const ty = target.y + NODE_HEIGHT / 2;
  const dx = tx - sx;
  const dy = ty - sy;

  return {
    id: edge.id,
    type: "arrow",
    x: sx,
    y: sy,
    width: dx,
    height: dy,
    angle: 0,
    strokeColor: "#1e1e1e",
    backgroundColor: "transparent",
    fillStyle: "solid",
    strokeWidth: 2,
    strokeStyle: "solid",
    roughness: 1,
    opacity: 100,
    groupIds: [],
    frameId: null,
    roundness: { type: 2 },
    seed: hashSeed(edge.id),
    version: 1,
    versionNonce: hashSeed(`${edge.id}-v`),
    isDeleted: false,
    boundElements: null,
    updated: 1,
    link: null,
    locked: false,
    points: [
      [0, 0],
      [dx, dy],
    ],
    lastCommittedPoint: null,
    startBinding: { elementId: edge.source, focus: 0, gap: 8 },
    endBinding: { elementId: edge.target, focus: 0, gap: 8 },
    startArrowhead: null,
    endArrowhead: "arrow",
  };
}

/** Convert backend diagram nodes/edges into Excalidraw scene elements for restore. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function diagramToExcalidrawElements(nodes: DiagramNode[], edges: DiagramEdge[]): any[] {
  const nodesById = new Map(nodes.map((n) => [n.id, n]));
  const elements: unknown[] = [];

  for (const node of nodes) {
    elements.push(createShapeElement(node));
    if (node.label) {
      elements.push(createLabelElement(node));
    }
  }

  for (const edge of edges) {
    const arrow = createArrowElement(edge, nodesById);
    if (arrow) elements.push(arrow);
  }

  return elements;
}

/** Build a snapshot map from Excalidraw elements for diff baseline after restore. */
export function buildElementSnapshotMap(
  elements: readonly ExcalidrawElementSnapshot[]
): Map<string, ExcalidrawElementSnapshot> {
  const map = new Map<string, ExcalidrawElementSnapshot>();
  for (const el of elements) {
    map.set(el.id, el);
  }
  return map;
}

export const NODE_SHAPE_TYPES = new Set(["rectangle", "ellipse", "diamond"]);
export const EDGE_SHAPE_TYPES = new Set(["arrow", "line"]);

export function getElementLabel(
  el: ExcalidrawElementSnapshot,
  allElements: readonly ExcalidrawElementSnapshot[]
): string {
  if (el.type === "text") return el.text ?? "";
  const boundText = allElements.find(
    (e) => !e.isDeleted && e.type === "text" && e.containerId === el.id
  );
  return boundText?.text ?? "";
}
