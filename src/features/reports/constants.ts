import type { DetailedReport } from "./types";

export const MOCK_REPORTS: DetailedReport[] = [
  {
    id: "rep-1",
    sessionId: "7a2b9e11-401d-40aa-b921-12f86f7aa001",
    title: "Design WhatsApp (Real-time Messaging)",
    difficulty: "senior",
    overallScore: 84,
    percentile: 88,
    duration: "42 mins",
    date: "Yesterday at 6:30 PM",
    interviewerSummary:
      "Demonstrated strong command of persistent WebSocket connections, message acknowledgements, and distributed queuing. Solid understanding of SQLite on-device vs DynamoDB offline storage.",
    rubrics: [
      {
        name: "Requirements & Scope",
        score: 90,
        weight: 15,
        summary: "Clearly differentiated 1-on-1 vs group chat throughput assumptions and message retention.",
        feedbackPoints: [
          "Calculated peak QPS (500k msg/sec) accurately.",
          "Addressed multi-device sync and end-to-end encryption constraints early.",
        ],
      },
      {
        name: "High-Level Architecture",
        score: 86,
        weight: 25,
        summary: "Clean separation between WebSocket Gateway, Session Service, and Storage cluster.",
        feedbackPoints: [
          "Utilized Redis Pub/Sub for routing messages to active connection sockets.",
          "Properly isolated media transfer to S3/CloudFront with pre-signed URLs.",
        ],
      },
      {
        name: "Data Modeling & Storage",
        score: 82,
        weight: 20,
        summary: "Cassandra schema keyed by chat_id and timeuuid for sequential retrieval.",
        feedbackPoints: [
          "Prevented hot-spotting on group chats by salting partition keys.",
          "Correctly identified ephemeral nature of delivered messages.",
        ],
      },
      {
        name: "Scalability & Bottlenecks",
        score: 80,
        weight: 25,
        summary: "Handled user disconnection storms and reconnection backoffs effectively.",
        feedbackPoints: [
          "Introduced exponential backoff with jitter on client reconnection.",
          "Could have discussed Kafka partition rebalancing latency under gateway node failure.",
        ],
      },
      {
        name: "Trade-offs & Articulation",
        score: 85,
        weight: 15,
        summary: "Clear verbal articulation of trade-offs between push vs long-polling.",
        feedbackPoints: [
          "Strong justification for TCP WebSockets over HTTP/2 Server-Sent Events.",
          "Articulated consistency trade-offs in message delivery receipts.",
        ],
      },
    ],
    strengths: [
      "Excellent back-of-the-envelope capacity estimation for 100M DAU.",
      "Thorough explanation of WebSocket gateway connection tracking with Redis hash rings.",
      "Clear strategy for media uploads via object storage to keep chat broker latency low.",
    ],
    weaknesses: [
      "Did not detail Kafka consumer lag handling during sudden viral group chat bursts.",
      "Missed addressing presence status ('last seen' / typing indicators) heartbeating overhead at scale.",
    ],
    recommendations: [
      "Review presence server architectures (e.g. Discord's Elixir/BEAM approach to ephemeral states).",
      "Practice edge-case failure modes when gateway proxies terminate abruptly.",
    ],
    diagramComponents: ["WebSocket Gateway", "Kafka Cluster", "Redis Session Store", "Cassandra Chat DB", "S3 / CDN"],
  },
  {
    id: "rep-2",
    sessionId: "3f11c872-9b62-4214-a951-8a43923ee002",
    title: "Design Uber (Geospatial Ride Matching)",
    difficulty: "senior",
    overallScore: 76,
    percentile: 72,
    duration: "38 mins",
    date: "3 days ago",
    interviewerSummary:
      "Good conceptual grasp of geospatial indexing with QuadTrees and H3/S2 cells. Needs deeper explanation of write-heavy driver location updates and distributed lock contention during ride matching.",
    rubrics: [
      {
        name: "Requirements & Scope",
        score: 82,
        weight: 15,
        summary: "Established 2-second match SLA and 4-second driver location heartbeat cadence.",
        feedbackPoints: [
          "Recognized the disparity between read-heavy rider requests and write-heavy driver pings.",
        ],
      },
      {
        name: "High-Level Architecture",
        score: 75,
        weight: 25,
        summary: "Location Ingestion Service -> Redis Geospatial -> Dispatch Matching Engine.",
        feedbackPoints: [
          "Good use of WebSockets for continuous driver telemetry.",
          "Dispatch service needs clearer distributed locking to avoid double-dispatching drivers.",
        ],
      },
      {
        name: "Data Modeling & Storage",
        score: 78,
        weight: 20,
        summary: "In-memory geospatial index backed by persistent historical trip ledger.",
        feedbackPoints: [
          "Correctly avoided relational database writes for raw GPS breadcrumbs.",
        ],
      },
      {
        name: "Scalability & Bottlenecks",
        score: 70,
        weight: 25,
        summary: "Memory bottleneck on QuadTree updates under rapid city traffic.",
        feedbackPoints: [
          "Static QuadTree causes dynamic rebalancing overhead; S2/H3 hexagonal indexing would be superior.",
        ],
      },
      {
        name: "Trade-offs & Articulation",
        score: 78,
        weight: 15,
        summary: "Articulated consistency vs availability for ride offers.",
        feedbackPoints: [
          "Strong defense of eventual consistency for nearby driver map visualization.",
        ],
      },
    ],
    strengths: [
      "Quick identification of driver location update volume (1M drivers * 0.25 Hz = 250k QPS).",
      "Pragmatic separation of ephemeral tracking vs permanent ride billing.",
    ],
    weaknesses: [
      "Over-relied on dynamic QuadTree without addressing lock contention on cell splits.",
      "Did not detail the two-phase commit or optimistic locking for ride acceptance.",
    ],
    recommendations: [
      "Deep dive into Uber's H3 geospatial hierarchical hexagonal spatial index.",
      "Review atomic booking transactions using Redis Lua scripts or distributed locks (Redlock).",
    ],
    diagramComponents: ["Location Service", "Redis Geospatial Ring", "Dispatch Broker", "Postgres Trips", "Notification APNS"],
  },
  {
    id: "rep-3",
    sessionId: "8c91a723-5e3a-4428-9844-0bbf9134a003",
    title: "Design a Distributed Cache (Consistent Hashing)",
    difficulty: "intermediate",
    overallScore: 89,
    percentile: 94,
    duration: "31 mins",
    date: "May 28 at 4:15 PM",
    interviewerSummary:
      "Outstanding performance. Fluid explanation of virtual nodes on a consistent hash ring, cache invalidation protocols, and thundering herd mitigation.",
    rubrics: [
      {
        name: "Requirements & Scope",
        score: 95,
        weight: 15,
        summary: "Defined sub-5ms read latencies, LRU eviction, and master-replica replication.",
        feedbackPoints: ["Clarified memory bounds and eviction policies upfront."],
      },
      {
        name: "High-Level Architecture",
        score: 90,
        weight: 25,
        summary: "Client library router with MD5 hash ring, partitioned storage nodes, write-through sync.",
        feedbackPoints: ["Virtual nodes (100+ per physical host) prevented hash hotspots."],
      },
      {
        name: "Data Modeling & Storage",
        score: 88,
        weight: 20,
        summary: "Doubly linked list + Hash map for O(1) LRU eviction in C++/Go.",
        feedbackPoints: ["Discussed TTL expiration with passive vs active sweeps."],
      },
      {
        name: "Scalability & Bottlenecks",
        score: 85,
        weight: 25,
        summary: "Addressed cache stampede via single-flight mutexes and probabilistic early expiration.",
        feedbackPoints: ["Single-flight pattern effectively eliminated backend stampedes."],
      },
      {
        name: "Trade-offs & Articulation",
        score: 90,
        weight: 15,
        summary: "Precise trade-off analysis between Write-Through, Write-Behind, and Cache-Aside.",
        feedbackPoints: ["Articulated consistency hazards in Write-Behind queues."],
      },
    ],
    strengths: [
      "Exceptional grasp of consistent hashing mechanics and virtual node distributions.",
      "Proactively brought up thundering herd solutions (single-flight and early refresh).",
      "Very structured whiteboard diagram.",
    ],
    weaknesses: [
      "Could have elaborated on gossip protocols for node discovery across cluster nodes.",
    ],
    recommendations: [
      "Review Memcached vs Redis clustering protocol trade-offs for interview question variations.",
    ],
    diagramComponents: ["Client Router Ring", "Consistent Hash Ring", "LRU Cache Node", "Backend Database", "Replica Slave"],
  },
];
