import type { ExcalidrawElementSnapshot } from "../types";

export interface SystemDesignComponentItem {
  id: string;
  type: string;
  name: string;
  category: "Edge & Client" | "Network & Routing" | "Compute" | "Data & Storage" | "Async & Messaging";
  icon: string;
  shape: "rectangle" | "ellipse" | "diamond";
  bgColor: string;
  strokeColor: string;
  width: number;
  height: number;
  description: string;
  defaultTopics?: string[];
}

export const SYSTEM_DESIGN_COMPONENTS: SystemDesignComponentItem[] = [
  // Edge & Client
  {
    id: "client-app",
    type: "client",
    name: "Client (Mobile/Web)",
    category: "Edge & Client",
    icon: "Smartphone",
    shape: "ellipse",
    bgColor: "#d3f9d8",
    strokeColor: "#2b8a3e",
    width: 140,
    height: 70,
    description: "End-user client browser or mobile application emitting requests.",
    defaultTopics: ["HTTP/HTTPS", "WebSocket", "Client-side Caching"],
  },
  {
    id: "dns-service",
    type: "dns",
    name: "DNS (Route 53)",
    category: "Edge & Client",
    icon: "Globe",
    shape: "diamond",
    bgColor: "#eebefa",
    strokeColor: "#862e9c",
    width: 130,
    height: 80,
    description: "Domain Name System resolution and Geo-DNS latency routing.",
    defaultTopics: ["GeoDNS", "Latency Routing", "TTL"],
  },
  {
    id: "cdn-service",
    type: "cdn",
    name: "CDN (Cloudflare)",
    category: "Edge & Client",
    icon: "Cloud",
    shape: "rectangle",
    bgColor: "#ffe066",
    strokeColor: "#e67700",
    width: 150,
    height: 70,
    description: "Edge caching network for static media, assets, and TLS termination.",
    defaultTopics: ["Edge Caching", "DDoS Protection", "Anycast"],
  },

  // Network & Routing
  {
    id: "load-balancer",
    type: "load_balancer",
    name: "Load Balancer (ALB)",
    category: "Network & Routing",
    icon: "Split",
    shape: "diamond",
    bgColor: "#ffec99",
    strokeColor: "#f08c00",
    width: 140,
    height: 80,
    description: "Distributes incoming traffic across application service instances.",
    defaultTopics: ["Round Robin", "Least Connections", "Consistent Hashing", "Health Checks"],
  },
  {
    id: "api-gateway",
    type: "gateway",
    name: "API Gateway (Envoy)",
    category: "Network & Routing",
    icon: "ShieldCheck",
    shape: "diamond",
    bgColor: "#ffd8a8",
    strokeColor: "#d9480f",
    width: 140,
    height: 80,
    description: "Handles authentication, rate limiting, request validation, and routing.",
    defaultTopics: ["Rate Limiting", "Auth Verification", "SSL Termination", "Reverse Proxy"],
  },

  // Compute
  {
    id: "app-service",
    type: "service",
    name: "App Microservice",
    category: "Compute",
    icon: "Server",
    shape: "rectangle",
    bgColor: "#a5d8ff",
    strokeColor: "#1971c2",
    width: 150,
    height: 70,
    description: "Stateless core business logic server running REST/gRPC endpoints.",
    defaultTopics: ["Horizontal Scaling", "Stateless", "Idempotency"],
  },
  {
    id: "auth-service",
    type: "auth",
    name: "Auth Service (OAuth)",
    category: "Compute",
    icon: "KeyRound",
    shape: "rectangle",
    bgColor: "#d0ebff",
    strokeColor: "#1864ab",
    width: 150,
    height: 70,
    description: "Generates and validates JWT tokens and handles user credentials.",
    defaultTopics: ["JWT Signing", "OAuth2", "Session Tokens"],
  },
  {
    id: "worker-task",
    type: "worker",
    name: "Async Worker",
    category: "Compute",
    icon: "Cpu",
    shape: "rectangle",
    bgColor: "#e7f5ff",
    strokeColor: "#1c7ed6",
    width: 140,
    height: 70,
    description: "Background asynchronous consumer processing heavy background jobs.",
    defaultTopics: ["Batch Processing", "Task Queue Consumer", "Retry Policies"],
  },

  // Data & Storage
  {
    id: "sql-database",
    type: "database",
    name: "PostgreSQL DB",
    category: "Data & Storage",
    icon: "Database",
    shape: "rectangle",
    bgColor: "#ffdeeb",
    strokeColor: "#a61e4d",
    width: 150,
    height: 70,
    description: "ACID compliant relational database with primary-replica replication.",
    defaultTopics: ["ACID", "Sharding", "Primary-Replica", "Read Replicas", "Indexing"],
  },
  {
    id: "nosql-database",
    type: "database",
    name: "MongoDB (NoSQL)",
    category: "Data & Storage",
    icon: "Layers",
    shape: "rectangle",
    bgColor: "#e9ecef",
    strokeColor: "#495057",
    width: 150,
    height: 70,
    description: "High-throughput document or wide-column store for semi-structured data.",
    defaultTopics: ["Partition Key", "Horizontal Sharding", "Eventual Consistency"],
  },
  {
    id: "redis-cache",
    type: "cache",
    name: "Redis Cache",
    category: "Data & Storage",
    icon: "Zap",
    shape: "rectangle",
    bgColor: "#ffc9c9",
    strokeColor: "#c92a2a",
    width: 140,
    height: 70,
    description: "Distributed in-memory key-value cache to reduce database read load.",
    defaultTopics: ["Cache-Aside", "Write-Through", "LRU Eviction", "TTL"],
  },
  {
    id: "s3-storage",
    type: "storage",
    name: "Object Storage (S3)",
    category: "Data & Storage",
    icon: "HardDrive",
    shape: "rectangle",
    bgColor: "#d0bfff",
    strokeColor: "#5f3dc4",
    width: 150,
    height: 70,
    description: "Scalable durable blob storage for videos, photos, and static exports.",
    defaultTopics: ["Multipart Uploads", "Presigned URLs", "Lifecycle Policies"],
  },
  {
    id: "search-engine",
    type: "search",
    name: "Elasticsearch",
    category: "Data & Storage",
    icon: "Search",
    shape: "rectangle",
    bgColor: "#c3fae8",
    strokeColor: "#0ca678",
    width: 150,
    height: 70,
    description: "Full-text inverted index engine for fast fuzzy query and log analytics.",
    defaultTopics: ["Inverted Index", "Sharding", "Log Aggregation"],
  },

  // Async & Messaging
  {
    id: "kafka-queue",
    type: "queue",
    name: "Kafka Message Queue",
    category: "Async & Messaging",
    icon: "GitFork",
    shape: "rectangle",
    bgColor: "#ffe8cc",
    strokeColor: "#e8590c",
    width: 160,
    height: 70,
    description: "Distributed commit log messaging broker for high-throughput streaming.",
    defaultTopics: ["Partitions", "Consumer Groups", "At-least-once Delivery", "Backpressure"],
  },
];

function hashSeed(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createComponentElements(
  item: SystemDesignComponentItem,
  x: number,
  y: number,
  customLabel?: string,
  fixedId?: string
): any[] {
  const shapeId = fixedId || `comp-${item.id}`;
  const labelId = `${shapeId}-lbl`;
  const groupId = `group-${shapeId}`;
  const displayLabel = customLabel || item.name;

  const shapeElement = {
    id: shapeId,
    type: item.shape,
    x,
    y,
    width: item.width,
    height: item.height,
    angle: 0,
    strokeColor: item.strokeColor,
    backgroundColor: item.bgColor,
    fillStyle: "solid",
    strokeWidth: 2,
    strokeStyle: "solid",
    roughness: 1,
    opacity: 100,
    groupIds: [groupId],
    frameId: null,
    index: null,
    roundness: item.shape === "rectangle" ? { type: 3 } : { type: 2 },
    seed: hashSeed(shapeId),
    version: 1,
    versionNonce: hashSeed(`${shapeId}-nonce`),
    isDeleted: false,
    boundElements: [{ id: labelId, type: "text" }],
    updated: 1,
    link: null,
    locked: false,
    customData: {
      componentType: item.type,
      componentId: item.id,
      label: displayLabel,
      category: item.category,
      isSystemDesignComponent: true,
    },
  };

  const labelElement = {
    id: labelId,
    type: "text",
    x: x + 8,
    y: y + item.height / 2 - 10,
    width: item.width - 16,
    height: 20,
    angle: 0,
    strokeColor: "#1e1e1e",
    backgroundColor: "transparent",
    fillStyle: "solid",
    strokeWidth: 1,
    strokeStyle: "solid",
    roughness: 0,
    opacity: 100,
    groupIds: [groupId],
    frameId: null,
    index: null,
    roundness: null,
    seed: hashSeed(labelId),
    version: 1,
    versionNonce: hashSeed(`${labelId}-nonce`),
    isDeleted: false,
    boundElements: null,
    updated: 1,
    link: null,
    locked: false,
    text: displayLabel,
    fontSize: 14,
    fontFamily: 1,
    textAlign: "center",
    verticalAlign: "middle",
    containerId: shapeId,
    originalText: displayLabel,
    autoResize: true,
    lineHeight: 1.25,
    customData: {
      parentComponentId: shapeId,
    },
  };

  return [shapeElement, labelElement];
}

// Returns only the 14 individual architecture building blocks (no pre-built flowcharts)
export function getSystemDesignLibraryItems(): any[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return SYSTEM_DESIGN_COMPONENTS.map((item) => {
    const shapeId = `stencil-${item.id}`;
    const labelId = `stencil-${item.id}-lbl`;
    const groupId = `group-${shapeId}`;
    const displayLabel = item.name;

    const shapeElement = {
      id: shapeId,
      type: item.shape,
      x: 0,
      y: 0,
      width: item.width,
      height: item.height,
      angle: 0,
      strokeColor: item.strokeColor,
      backgroundColor: item.bgColor,
      fillStyle: "solid",
      strokeWidth: 2,
      strokeStyle: "solid",
      roughness: 1,
      opacity: 100,
      groupIds: [groupId],
      frameId: null,
      index: null,
      roundness: item.shape === "rectangle" ? { type: 3 } : { type: 2 },
      seed: hashSeed(shapeId),
      version: 1,
      versionNonce: hashSeed(`${shapeId}-nonce`),
      isDeleted: false,
      boundElements: [{ id: labelId, type: "text" }],
      updated: 1,
      link: null,
      locked: false,
      customData: {
        componentType: item.type,
        componentId: item.id,
        label: displayLabel,
        category: item.category,
        isSystemDesignComponent: true,
      },
    };

    const labelElement = {
      id: labelId,
      type: "text",
      x: 8,
      y: item.height / 2 - 10,
      width: item.width - 16,
      height: 20,
      angle: 0,
      strokeColor: "#1e1e1e",
      backgroundColor: "transparent",
      fillStyle: "solid",
      strokeWidth: 1,
      strokeStyle: "solid",
      roughness: 0,
      opacity: 100,
      groupIds: [groupId],
      frameId: null,
      index: null,
      roundness: null,
      seed: hashSeed(labelId),
      version: 1,
      versionNonce: hashSeed(`${labelId}-nonce`),
      isDeleted: false,
      boundElements: null,
      updated: 1,
      link: null,
      locked: false,
      text: displayLabel,
      fontSize: 14,
      fontFamily: 1,
      textAlign: "center",
      verticalAlign: "middle",
      containerId: shapeId,
      originalText: displayLabel,
      autoResize: true,
      lineHeight: 1.25,
      customData: {
        parentComponentId: shapeId,
      },
    };

    return {
      id: `archon-lib-${item.id}`,
      status: "published",
      name: item.name,
      created: 1,
      elements: [shapeElement, labelElement],
    };
  });
}
