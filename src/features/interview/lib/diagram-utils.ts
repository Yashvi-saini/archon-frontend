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

export function shapeToNodeType(
  excalidrawType: string,
  label: string,
  customType?: string
): string {
  if (customType) return customType;

  const l = label.toLowerCase();
  if (
    l.includes("database") ||
    l.includes("db") ||
    l.includes("postgres") ||
    l.includes("mysql") ||
    l.includes("mongo") ||
    l.includes("cassandra") ||
    l.includes("dynamo") ||
    l.includes("cockroach") ||
    l.includes("oracle") ||
    l.includes("rds") ||
    l.includes("sqlite")
  ) {
    return "database";
  }

  if (
    l.includes("cache") ||
    l.includes("redis") ||
    l.includes("memcache") ||
    l.includes("aerospike") ||
    l.includes("varnish")
  ) {
    return "cache";
  }

  if (
    l.includes("queue") ||
    l.includes("kafka") ||
    l.includes("rabbit") ||
    l.includes("sqs") ||
    l.includes("pulsar") ||
    l.includes("event") ||
    l.includes("pubsub") ||
    l.includes("pub/sub") ||
    l.includes("nats")
  ) {
    return "queue";
  }

  if (
    l.includes("load balancer") ||
    l.includes("lb") ||
    l.includes("nginx") ||
    l.includes("haproxy") ||
    l.includes("alb") ||
    l.includes("nlb") ||
    l.includes("traefik")
  ) {
    return "load_balancer";
  }

  if (
    l.includes("gateway") ||
    l.includes("api gateway") ||
    l.includes("kong") ||
    l.includes("envoy") ||
    l.includes("apigw")
  ) {
    return "gateway";
  }

  if (
    l.includes("cdn") ||
    l.includes("cloudflare") ||
    l.includes("cloudfront") ||
    l.includes("fastly") ||
    l.includes("akamai")
  ) {
    return "cdn";
  }

  if (
    l.includes("dns") ||
    l.includes("route 53") ||
    l.includes("route53") ||
    l.includes("bind") ||
    l.includes("nameserver")
  ) {
    return "dns";
  }

  if (
    l.includes("storage") ||
    l.includes("s3") ||
    l.includes("blob") ||
    l.includes("minio") ||
    l.includes("bucket") ||
    l.includes("gcs") ||
    l.includes("hdfs")
  ) {
    return "storage";
  }

  if (
    l.includes("search") ||
    l.includes("elastic") ||
    l.includes("opensearch") ||
    l.includes("solr") ||
    l.includes("meilisearch") ||
    l.includes("geohash") ||
    l.includes("quadtree") ||
    l.includes("spatial") ||
    l.includes("google s2") ||
    l.includes("s2 geometry")
  ) {
    return "search";
  }

  if (
    l.includes("routing") ||
    l.includes("osrm") ||
    l.includes("navigation")
  ) {
    return "service";
  }

  if (
    l.includes("vector") ||
    l.includes("pinecone") ||
    l.includes("qdrant") ||
    l.includes("milvus") ||
    l.includes("embedding")
  ) {
    return "database";
  }

  if (
    l.includes("coordinator") ||
    l.includes("zookeeper") ||
    l.includes("etcd") ||
    l.includes("consul")
  ) {
    return "service";
  }

  if (
    l.includes("waf") ||
    l.includes("firewall") ||
    l.includes("shield") ||
    l.includes("rate limiter") ||
    l.includes("token bucket")
  ) {
    return "gateway";
  }

  if (
    l.includes("monitor") ||
    l.includes("prometheus") ||
    l.includes("grafana") ||
    l.includes("metrics")
  ) {
    return "service";
  }

  if (
    l.includes("logging") ||
    l.includes("loki") ||
    l.includes("logstash")
  ) {
    return "storage";
  }

  if (
    l.includes("auth") ||
    l.includes("cognito") ||
    l.includes("keycloak") ||
    l.includes("jwt") ||
    l.includes("oauth") ||
    l.includes("okta")
  ) {
    return "auth";
  }

  if (
    l.includes("worker") ||
    l.includes("consumer") ||
    l.includes("batch") ||
    l.includes("cron") ||
    l.includes("celery") ||
    l.includes("executor")
  ) {
    return "worker";
  }

  if (
    l.includes("client") ||
    l.includes("user") ||
    l.includes("browser") ||
    l.includes("mobile") ||
    l.includes("app") ||
    l.includes("frontend") ||
    l.includes("device") ||
    l.includes("customer")
  ) {
    return "client";
  }

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
  if (type === "gateway" || type === "load_balancer" || type === "dns") return "diamond";
  return "rectangle";
}

function nodeBackground(type: string): string {
  if (type === "client") return "#d3f9d8";
  if (type === "gateway") return "#ffd8a8";
  if (type === "load_balancer") return "#ffec99";
  if (type === "dns") return "#eebefa";
  if (type === "cdn") return "#ffe066";
  if (type === "database") return "#ffdeeb";
  if (type === "cache") return "#ffc9c9";
  if (type === "queue") return "#ffe8cc";
  if (type === "storage") return "#d0bfff";
  if (type === "search") return "#c3fae8";
  if (type === "auth") return "#d0ebff";
  if (type === "worker") return "#e7f5ff";
  return "#a5d8ff";
}

function nodeStroke(type: string): string {
  if (type === "client") return "#2b8a3e";
  if (type === "gateway") return "#d9480f";
  if (type === "load_balancer") return "#f08c00";
  if (type === "dns") return "#862e9c";
  if (type === "cdn") return "#e67700";
  if (type === "database") return "#a61e4d";
  if (type === "cache") return "#c92a2a";
  if (type === "queue") return "#e8590c";
  if (type === "storage") return "#5f3dc4";
  if (type === "search") return "#0ca678";
  if (type === "auth") return "#1864ab";
  if (type === "worker") return "#1c7ed6";
  return "#1971c2";
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
    strokeColor: nodeStroke(node.type),
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
    customData: {
      componentType: node.type,
      label: node.label,
    },
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createLabelElement(node: DiagramNode): any {
  return {
    id: `${node.id}-label`,
    type: "text",
    x: node.x + 8,
    y: node.y + NODE_HEIGHT / 2 - 10,
    width: NODE_WIDTH - 16,
    height: 20,
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
    fontSize: 14,
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
  // 1. Direct customData label
  const custom = el.customData;
  if (custom?.label && typeof custom.label === "string") return custom.label;
  if (custom?.name && typeof custom.name === "string") return custom.name;

  // 2. Direct text element
  if (el.type === "text") return el.text ?? "";

  // 3. Bound text element by containerId or boundElements reference
  const boundText = allElements.find(
    (e) =>
      !e.isDeleted &&
      e.type === "text" &&
      (e.containerId === el.id || el.boundElements?.some((b) => b.id === e.id))
  );
  if (boundText?.text) return boundText.text;

  // 4. Same group ID (common in library items)
  if (el.groupIds && el.groupIds.length > 0) {
    const groupText = allElements.find(
      (e) =>
        !e.isDeleted &&
        e.type === "text" &&
        e.groupIds?.some((g) => el.groupIds?.includes(g))
    );
    if (groupText?.text) return groupText.text;
  }

  // 5. Geometric containment: text element located inside or overlapping the shape bounding box
  const containedText = allElements.find(
    (e) =>
      !e.isDeleted &&
      e.type === "text" &&
      e.x >= el.x - 15 &&
      e.x <= el.x + el.width + 15 &&
      e.y >= el.y - 15 &&
      e.y <= el.y + el.height + 15
  );
  if (containedText?.text) return containedText.text;

  return "";
}

export interface DetectedArchitectureSummary {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  componentCounts: Record<string, number>;
  totalComponents: number;
  jsonPayload: {
    total_nodes: number;
    total_edges: number;
    components_breakdown: Record<string, number>;
    nodes: DiagramNode[];
    edges: DiagramEdge[];
  };
}

export function getDetectedArchitectureSummary(
  elements: readonly ExcalidrawElementSnapshot[]
): DetectedArchitectureSummary {
  const nodes: DiagramNode[] = [];
  const edges: DiagramEdge[] = [];
  const componentCounts: Record<string, number> = {};

  const activeElements = elements.filter((el) => !el.isDeleted);
  const seenGroups = new Set<string>();

  for (const el of activeElements) {
    // Skip decorative caps or sub-elements to prevent double counting
    if (el.customData?.isDecorative || el.customData?.isSubElement) {
      continue;
    }

    // If part of a grouped composite stencil, only count the primary shape once
    if (el.groupIds && el.groupIds.length > 0) {
      const primaryGroup = el.groupIds[0];
      if (seenGroups.has(primaryGroup)) {
        continue;
      }
      seenGroups.add(primaryGroup);
    }

    if (NODE_SHAPE_TYPES.has(el.type)) {
      const label = getElementLabel(el, activeElements);
      const customType = el.customData?.componentType;
      const type = shapeToNodeType(el.type, label, customType);
      const nodeLabel = label || `${type}-${el.id.slice(0, 6)}`;

      nodes.push({
        id: el.id,
        type,
        label: nodeLabel,
        x: Math.round(el.x),
        y: Math.round(el.y),
      });

      componentCounts[type] = (componentCounts[type] || 0) + 1;
    } else if (EDGE_SHAPE_TYPES.has(el.type)) {
      const sourceId = el.startBinding?.elementId;
      const targetId = el.endBinding?.elementId;
      if (sourceId && targetId) {
        const label = getElementLabel(el, activeElements);
        edges.push({
          id: el.id,
          source: sourceId,
          target: targetId,
          type: inferEdgeProtocol(label),
        });
      }
    }
  }

  return {
    nodes,
    edges,
    componentCounts,
    totalComponents: nodes.length,
    jsonPayload: {
      total_nodes: nodes.length,
      total_edges: edges.length,
      components_breakdown: componentCounts,
      nodes,
      edges,
    },
  };
}
