import type { QuizDeck, QuizQuestion } from "./types";

export const DAILY_CHALLENGE_QUESTION: QuizQuestion = {
  id: "daily-1",
  question: "How should you design an Idempotent Payment Webhook Processing pipeline to handle duplicate events?",
  scenario:
    "Stripe sends payment_intent.succeeded webhooks with potential duplicates under network retries. Your backend needs to credit the user's wallet exactly once.",
  topicTag: "Distributed Transactions",
  options: [
    {
      id: "opt-1",
      text: "Store webhook event_id in a unique index in SQL, verify state inside a serializable transaction before debit/credit.",
      isCorrect: true,
      explanation:
        "Correct! An atomic unique constraint on event_id or an idempotency key table ensures that concurrent duplicate webhook deliveries encounter a constraint violation and are safely acknowledged with HTTP 200 without double-crediting.",
    },
    {
      id: "opt-2",
      text: "Check Redis cache for event_id, if not found then credit wallet and set Redis key with TTL.",
      isCorrect: false,
      explanation:
        "Incorrect. Redis without distributed locking has race conditions (check-then-act) between concurrent workers, and Redis eviction could result in duplicate credits.",
    },
    {
      id: "opt-3",
      text: "Rely on client application to send a single request without retrying on HTTP 500 errors.",
      isCorrect: false,
      explanation:
        "Incorrect. In distributed payment systems, webhook providers guarantee at-least-once delivery, so duplicate transmissions are inevitable.",
    },
    {
      id: "opt-4",
      text: "Delay all incoming webhook events in Kafka for 5 minutes before sequential single-threaded execution.",
      isCorrect: false,
      explanation:
        "Incorrect. Artificially introducing high latency harms user experience and still does not guarantee idempotency across restarts.",
    },
  ],
};

export const MOCK_QUIZ_DECKS: QuizDeck[] = [
  {
    id: "deck-cap",
    title: "CAP Theorem & Distributed Consistency",
    description: "Master CP vs AP trade-offs, PACELC theorem, quorum consensus (R+W > N), and read repair.",
    difficulty: "senior",
    questionCount: 4,
    estMinutes: 8,
    iconName: "Shield",
    category: "Distributed Systems",
    completedPercent: 75,
    questions: [
      {
        id: "cap-q1",
        question: "In a leaderless Dynamo-style cluster with replication factor N=3, which configuration guarantees strong consistency?",
        scenario: "You want read-after-write consistency (strict serializability or monotonic reads) in an active-active setup.",
        topicTag: "Quorum",
        options: [
          {
            id: "cap-q1-o1",
            text: "Write Quorum W=2, Read Quorum R=2",
            isCorrect: true,
            explanation:
              "Correct. Because W + R > N (2 + 2 = 4 > 3), the write set and read set must overlap on at least one up-to-date replica node, ensuring strong consistency.",
          },
          {
            id: "cap-q1-o2",
            text: "Write Quorum W=1, Read Quorum R=1",
            isCorrect: false,
            explanation: "Incorrect. W + R (2) <= N (3), leading to stale reads and split-brain anomalies.",
          },
          {
            id: "cap-q1-o3",
            text: "Write Quorum W=3, Read Quorum R=1",
            isCorrect: false,
            explanation: "While W+R > N, this compromises write availability if even a single node goes down, making writes fragile.",
          },
          {
            id: "cap-q1-o4",
            text: "Write Quorum W=1, Read Quorum R=3",
            isCorrect: false,
            explanation: "Reads will fail completely if any single node is unreachable.",
          },
        ],
      },
      {
        id: "cap-q2",
        question: "When a network partition occurs in a distributed database, what does the PACELC theorem state about normal operating latency?",
        scenario: "Evaluating latency versus consistency trade-offs when no network partitions are present.",
        topicTag: "PACELC",
        options: [
          {
            id: "cap-q2-o1",
            text: "Else (without partitions), you choose between Latency (L) and Consistency (C).",
            isCorrect: true,
            explanation:
              "Correct! PACELC states: if Partition (P), choose Availability (A) or Consistency (C); Else (E), choose Latency (L) or Consistency (C).",
          },
          {
            id: "cap-q2-o2",
            text: "Else, the cluster automatically defaults to strong linearizability with zero latency cost.",
            isCorrect: false,
            explanation: "Linearizability always introduces synchronization latency across replicas.",
          },
          {
            id: "cap-q2-o3",
            text: "Else, all reads bypass replicas and read exclusively from the leader.",
            isCorrect: false,
            explanation: "PACELC is a theoretical trade-off model, not an implementation protocol.",
          },
        ],
      },
    ],
  },
  {
    id: "deck-caching",
    title: "Distributed Caching & Eviction",
    description: "Cache-Aside, Write-Through, Write-Behind, Cache Stampede (Thundering Herd), and Redis Cluster.",
    difficulty: "intermediate",
    questionCount: 3,
    estMinutes: 6,
    iconName: "Zap",
    category: "Performance",
    completedPercent: 100,
    questions: [
      {
        id: "cache-q1",
        question: "How do you most effectively prevent a 'Cache Stampede' (Thundering Herd) when an ultra-popular hot key expires?",
        scenario: "A breaking news article key with 100,000 QPS suddenly expires in Redis, threatening to overwhelm the backend SQL database.",
        topicTag: "Cache Stampede",
        options: [
          {
            id: "c1",
            text: "Use Mutual Exclusion (Mutex / Singleflight) or Probabilistic Early Expiration (XFetch algorithm).",
            isCorrect: true,
            explanation:
              "Correct! Singleflight ensures only one worker queries the database to repopulate the cache while others wait. Probabilistic early expiration recomputes values in the background before hard expiry.",
          },
          {
            id: "c2",
            text: "Increase Redis memory allocation and disable TTL entirely.",
            isCorrect: false,
            explanation: "Disabling TTL causes stale data retention and unbounded memory leakage.",
          },
          {
            id: "c3",
            text: "Add 10 Read Replicas to the SQL database without caching.",
            isCorrect: false,
            explanation: "100k QPS will still saturate connection pools and disk I/O.",
          },
        ],
      },
    ],
  },
  {
    id: "deck-sharding",
    title: "Database Partitioning & Sharding",
    description: "Consistent hashing, virtual nodes, shard keys, resharding strategies, and cross-shard queries.",
    difficulty: "senior",
    questionCount: 4,
    estMinutes: 10,
    iconName: "Database",
    category: "Data Systems",
    completedPercent: 50,
    questions: [
      {
        id: "shard-q1",
        question: "Why do systems like Cassandra and DynamoDB use 'Virtual Nodes' (VNodes) on consistent hash rings?",
        scenario: "Distributing keys across heterogeneous hardware nodes with uniform variance.",
        topicTag: "Consistent Hashing",
        options: [
          {
            id: "s1",
            text: "To minimize variance in key distribution and balance load evenly without hot spots.",
            isCorrect: true,
            explanation:
              "Correct! Assigning multiple virtual positions per physical server smooths out variance according to the Law of Large Numbers and enables gradual rebalancing when nodes join or leave.",
          },
          {
            id: "s2",
            text: "To encrypt keys using virtual private networks.",
            isCorrect: false,
            explanation: "Virtual nodes are a hashing distribution mechanism, not an encryption layer.",
          },
          {
            id: "s3",
            text: "To ensure all database writes execute on every physical machine.",
            isCorrect: false,
            explanation: "Replicating to all machines would eliminate horizontal partitioning benefits.",
          },
        ],
      },
    ],
  },
  {
    id: "deck-ratelimit",
    title: "Rate Limiting & Traffic Shaping",
    description: "Token Bucket, Leaky Bucket, Fixed Window, Sliding Window Log, and Sliding Window Counter.",
    difficulty: "intermediate",
    questionCount: 3,
    estMinutes: 7,
    iconName: "Sliders",
    category: "Networking & Security",
    completedPercent: 33,
    questions: [
      {
        id: "rl-q1",
        question: "Which rate-limiting algorithm provides memory efficiency while smoothing out boundary burst spikes?",
        scenario: "API Gateway handling millions of requests per second where memory and burst tolerance are both critical.",
        topicTag: "Rate Limiting",
        options: [
          {
            id: "rl1",
            text: "Sliding Window Counter (combining current and previous window proportions)",
            isCorrect: true,
            explanation:
              "Correct! Sliding Window Counter consumes only two counters per client/time-unit while approximating the true sliding window with high accuracy, preventing 2x traffic bursts at window boundaries.",
          },
          {
            id: "rl2",
            text: "Sliding Window Log (storing timestamp of every request in Redis Sorted Set)",
            isCorrect: false,
            explanation: "Sliding Window Log is highly memory-expensive because it stores every single request timestamp.",
          },
          {
            id: "rl3",
            text: "Fixed Window Counter",
            isCorrect: false,
            explanation: "Fixed Window allows twice the allowed quota across the boundary border (e.g. 59s and 01s).",
          },
        ],
      },
    ],
  },
];
