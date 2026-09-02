# Archon Backend — API Implementation Guide & Specification

This guide outlines the backend architecture, database schemas, Go structs, and REST endpoints required to power the **Archon** System Design Interview Prep frontend:
1. **Dashboard** (`/dashboard`)
2. **Reports** (`/reports`)
3. **Analytics** (`/analytics`)
4. **Quiz Trainer** (`/quiz`)
5. **Workspace Settings** (`/settings`)

---

## 1. Architectural Standards & Conventions

- **Server Framework**: Go / Gin (`github.com/gin-gonic/gin`)
- **Database**: PostgreSQL (UUIDs, indexed Foreign Keys, and JSONB)
- **Cache**: Redis
- **Auth**: JWT Bearer token via `Authorization: Bearer <token>`
- **Response Wrapper**:
  ```json
  {
    "success": true,
    "data": { ... }
  }
  ```
- **Error Format**:
  ```json
  {
    "success": false,
    "error": "Error description message"
  }
  ```

---

## 2. Database Migrations (PostgreSQL)

Create migration file `Archon/migrations/000009_create_dashboard_quiz_settings_tables.up.sql`:

```sql
-- 1. Candidate Workspace & Settings
CREATE TABLE IF NOT EXISTS user_settings (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    target_level VARCHAR(50) DEFAULT 'senior',
    years_of_experience INTEGER DEFAULT 4,
    primary_stack VARCHAR(50) DEFAULT 'Go',
    target_companies TEXT[] DEFAULT ARRAY['Google', 'Meta', 'Stripe'],
    interviewer_strictness VARCHAR(50) DEFAULT 'standard',
    feedback_style VARCHAR(50) DEFAULT 'socratic',
    enable_proactive_hints BOOLEAN DEFAULT TRUE,
    enable_voice_interview BOOLEAN DEFAULT FALSE,
    canvas_grid_type VARCHAR(20) DEFAULT 'dots',
    snap_to_grid BOOLEAN DEFAULT TRUE,
    auto_save_interval_seconds INTEGER DEFAULT 15,
    export_format VARCHAR(10) DEFAULT 'svg',
    weekly_interview_target INTEGER DEFAULT 3,
    email_notifications BOOLEAN DEFAULT TRUE,
    weekly_report_digest BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. System Design Quiz Decks
CREATE TABLE IF NOT EXISTS quiz_decks (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    difficulty VARCHAR(50) NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'senior', 'staff')),
    question_count INTEGER DEFAULT 0,
    est_minutes INTEGER DEFAULT 10,
    category VARCHAR(100) NOT NULL,
    icon_name VARCHAR(50) DEFAULT 'Layers',
    created_at TIMESTAMP DEFAULT NOW()
);

-- 3. System Design Quiz Questions
CREATE TABLE IF NOT EXISTS quiz_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deck_id VARCHAR(50) REFERENCES quiz_decks(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    scenario TEXT,
    topic_tag VARCHAR(100) NOT NULL,
    options JSONB NOT NULL, -- Array of { id: string, text: string, is_correct: bool, explanation: string }
    is_daily BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_quiz_questions_deck_id ON quiz_questions(deck_id);
CREATE INDEX idx_quiz_questions_is_daily ON quiz_questions(is_daily);

-- 4. User Quiz Attempts
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    deck_id VARCHAR(50) REFERENCES quiz_decks(id) ON DELETE CASCADE,
    score_percent INTEGER NOT NULL,
    correct_count INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    time_spent_seconds INTEGER DEFAULT 0,
    answers JSONB NOT NULL, -- Map of { [question_id]: selected_option_id }
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_deck_id ON quiz_attempts(deck_id);
```

---

## 3. Go Models (`internal/models/`)

### `dashboard.go`
```go
package models

import "time"

type DashboardStats struct {
	ReadinessScore      int       `json:"readiness_score"`
	ReadinessChange     float64   `json:"readiness_change"`
	CompletedInterviews int       `json:"completed_interviews"`
	TotalQuizzesTaken   int       `json:"total_quizzes_taken"`
	QuizAccuracy        int       `json:"quiz_accuracy"`
	StreakDays          int       `json:"streak_days"`
	ScoreHistory        []int     `json:"score_history"`
}

type RecommendedScenario struct {
	ID         string   `json:"id"`
	Title      string   `json:"title"`
	Desc       string   `json:"desc"`
	Difficulty string   `json:"difficulty"`
	EstTime    string   `json:"est_time"`
	Topics     []string `json:"topics"`
}

type CompetencyMetric struct {
	Label string `json:"label"`
	Value int    `json:"value"`
}

type RecentInterviewSummary struct {
	ID         string    `json:"id"`
	SessionID  string    `json:"session_id"`
	Title      string    `json:"title"`
	Difficulty string    `json:"difficulty"`
	Score      *int      `json:"score"`
	Status     string    `json:"status"` // "completed" | "evaluating"
	Date       time.Time `json:"date"`
	Duration   string    `json:"duration"`
}

type RoadmapTopic struct {
	ID               string `json:"id"`
	Title            string `json:"title"`
	Category         string `json:"category"`
	CompletedLessons int    `json:"completed_lessons"`
	TotalLessons     int    `json:"total_lessons"`
	Mastery          int    `json:"mastery"` // 0-100%
	Status           string `json:"status"`  // "completed" | "in_progress" | "locked"
}

type DashboardOverviewResponse struct {
	Stats               DashboardStats           `json:"stats"`
	RecommendedScenario RecommendedScenario      `json:"recommended_scenario"`
	Competencies        []CompetencyMetric       `json:"competencies"`
	RecentInterviews    []RecentInterviewSummary `json:"recent_interviews"`
	Roadmap             []RoadmapTopic           `json:"roadmap"`
}
```

### `report.go`
```go
package models

import "time"

type RubricCategory struct {
	Name           string   `json:"name"`
	Score          int      `json:"score"`
	Weight         int      `json:"weight"`
	Summary        string   `json:"summary"`
	FeedbackPoints []string `json:"feedback_points"`
}

type DetailedReportResponse struct {
	SessionID          string           `json:"session_id"`
	Title              string           `json:"title"`
	Difficulty         string           `json:"difficulty"`
	OverallScore       int              `json:"overall_score"`
	Percentile         int              `json:"percentile"`
	Duration           string           `json:"duration"`
	StartedAt          time.Time        `json:"started_at"`
	EndedAt            *time.Time       `json:"ended_at"`
	InterviewerSummary string           `json:"interviewer_summary"`
	Rubrics            []RubricCategory `json:"rubrics"`
	Strengths          []string         `json:"strengths"`
	Weaknesses         []string         `json:"weaknesses"`
	Recommendations    []string         `json:"recommendations"`
	DiagramComponents  []string         `json:"diagram_components"`
}

type ReportListItem struct {
	ID                 string    `json:"id"`
	SessionID          string    `json:"session_id"`
	Title              string    `json:"title"`
	Difficulty         string    `json:"difficulty"`
	OverallScore       int       `json:"overall_score"`
	Percentile         int       `json:"percentile"`
	Duration           string    `json:"duration"`
	Date               time.Time `json:"date"`
	InterviewerSummary string    `json:"interviewer_summary"`
}

type ReportsSummary struct {
	TotalReports int `json:"total_reports"`
	AverageScore int `json:"average_score"`
	HighestScore int `json:"highest_score"`
}

type ReportsListResponse struct {
	Summary ReportsSummary   `json:"summary"`
	Reports []ReportListItem `json:"reports"`
}
```

### `analytics.go`
```go
package models

type TrendPoint struct {
	Label string `json:"label"`
	Value int    `json:"value"`
}

type DomainMastery struct {
	Domain         string `json:"domain"`
	Score          int    `json:"score"`
	Benchmark      int    `json:"benchmark"`
	QuestionsCount int    `json:"questions_count"`
}

type HeatmapDay struct {
	Date  string `json:"date"`  // "YYYY-MM-DD"
	Count int    `json:"count"` // number of sessions
}

type PitfallInsight struct {
	ID          string `json:"id"`
	Category    string `json:"category"` // "critical" | "warning" | "tip"
	Title       string `json:"title"`
	Description string `json:"description"`
	Impact      string `json:"impact"`
	Frequency   string `json:"frequency"`
}

type AnalyticsResponse struct {
	ReadinessScore    int              `json:"readiness_score"`
	Percentile        int              `json:"percentile"`
	TotalHoursTrained float64          `json:"total_hours_trained"`
	AvgScore          int              `json:"avg_score"`
	TargetLevel       string           `json:"target_level"`
	Trend             []TrendPoint     `json:"trend"`
	DomainMastery     []DomainMastery  `json:"domain_mastery"`
	HeatmapDays       []HeatmapDay     `json:"heatmap_days"`
	Pitfalls          []PitfallInsight `json:"pitfalls"`
}
```

### `quiz.go`
```go
package models

type QuizOption struct {
	ID          string `json:"id"`
	Text        string `json:"text"`
	IsCorrect   bool   `json:"is_correct,omitempty"`
	Explanation string `json:"explanation,omitempty"`
}

type QuizQuestion struct {
	ID          string       `json:"id"`
	Question    string       `json:"question"`
	Scenario    string       `json:"scenario,omitempty"`
	TopicTag    string       `json:"topic_tag"`
	Options     []QuizOption `json:"options"`
}

type QuizDeckItem struct {
	ID               string `json:"id"`
	Title            string `json:"title"`
	Description      string `json:"description"`
	Difficulty       string `json:"difficulty"`
	QuestionCount    int    `json:"question_count"`
	EstMinutes       int    `json:"est_minutes"`
	IconName         string `json:"icon_name"`
	Category         string `json:"category"`
	CompletedPercent int    `json:"completed_percent"`
}

type VerifyDailyChallengeRequest struct {
	QuestionID       string `json:"question_id" binding:"required"`
	SelectedOptionID string `json:"selected_option_id" binding:"required"`
}

type VerifyDailyChallengeResponse struct {
	IsCorrect       bool   `json:"is_correct"`
	CorrectOptionID string `json:"correct_option_id"`
	Explanation     string `json:"explanation"`
}

type SubmitDeckQuizRequest struct {
	TimeSpentSeconds int               `json:"time_spent_seconds"`
	Answers          map[string]string `json:"answers" binding:"required"` // question_id -> option_id
}

type QuestionReviewItem struct {
	QuestionID      string `json:"question_id"`
	UserOptionID    string `json:"user_option_id"`
	CorrectOptionID string `json:"correct_option_id"`
	IsCorrect       bool   `json:"is_correct"`
	Explanation     string `json:"explanation"`
}

type SubmitDeckQuizResponse struct {
	DeckID         string               `json:"deck_id"`
	TotalQuestions int                  `json:"total_questions"`
	CorrectCount   int                  `json:"correct_count"`
	ScorePercent   int                  `json:"score_percent"`
	Review         []QuestionReviewItem `json:"review"`
}
```

### `settings.go`
```go
package models

type UserSettings struct {
	FullName                string   `json:"full_name"`
	Email                   string   `json:"email"`
	TargetLevel             string   `json:"target_level"`
	YearsOfExperience       int      `json:"years_of_experience"`
	PrimaryStack            string   `json:"primary_stack"`
	TargetCompanies         []string `json:"target_companies"`
	InterviewerStrictness   string   `json:"interviewer_strictness"`
	FeedbackStyle           string   `json:"feedback_style"`
	EnableProactiveHints    bool     `json:"enable_proactive_hints"`
	EnableVoiceInterview    bool     `json:"enable_voice_interview"`
	CanvasGridType          string   `json:"canvas_grid_type"`
	SnapToGrid              bool     `json:"snap_to_grid"`
	AutoSaveIntervalSeconds int      `json:"auto_save_interval_seconds"`
	ExportFormat            string   `json:"export_format"`
	WeeklyInterviewTarget   int      `json:"weekly_interview_target"`
	EmailNotifications      bool     `json:"email_notifications"`
	WeeklyReportDigest      bool     `json:"weekly_report_digest"`
}
```

---

## 4. REST Endpoints Specification

### Group: `/api/v1/dashboard`
Protected by `auth.AuthMiddleware(jwtSecret, userRepo)`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/dashboard/overview` | Returns aggregate metrics, next recommended problem, radar competencies, and recent session logs. |

---

### Group: `/api/v1/reports`
Protected by `auth.AuthMiddleware(jwtSecret, userRepo)`

| Method | Endpoint | Query Params | Description |
|---|---|---|---|
| `GET` | `/api/v1/reports` | `search`, `difficulty`, `page`, `limit` | Returns summary and list of user's past interview evaluations. |
| `GET` | `/api/v1/reports/:id` | — | Returns full 5-axis rubric breakdown and AI evaluation remarks. |

---

### Group: `/api/v1/analytics`
Protected by `auth.AuthMiddleware(jwtSecret, userRepo)`

| Method | Endpoint | Query Params | Description |
|---|---|---|---|
| `GET` | `/api/v1/analytics` | `range` (`7d`, `30d`, `90d`, `all`) | Returns score trajectory, domain mastery vs peers, heatmap, and AI pitfall alerts. |

---

### Group: `/api/v1/quizzes`
Protected by `auth.AuthMiddleware(jwtSecret, userRepo)`

| Method | Endpoint | Payload | Description |
|---|---|---|---|
| `GET` | `/api/v1/quizzes/daily-challenge` | — | Returns today's active daily challenge question. |
| `POST` | `/api/v1/quizzes/daily-challenge/verify` | `{ question_id, selected_option_id }` | Verifies user's selection and returns rationale. |
| `GET` | `/api/v1/quizzes/decks` | — | Returns list of available topic decks and user mastery percentages. |
| `GET` | `/api/v1/quizzes/decks/:id` | — | Returns questions for the selected deck (without revealing `is_correct`). |
| `POST` | `/api/v1/quizzes/decks/:id/submit` | `{ time_spent_seconds, answers }` | Scores the quiz attempt, saves to `quiz_attempts`, and returns reviews. |

---

### Group: `/api/v1/settings`
Protected by `auth.AuthMiddleware(jwtSecret, userRepo)`

| Method | Endpoint | Payload | Description |
|---|---|---|---|
| `GET` | `/api/v1/settings` | — | Returns candidate workspace, level calibration, and canvas preferences. |
| `PUT` | `/api/v1/settings` | `UserSettings` struct | Upserts candidate preferences in `user_settings`. |

---

## 5. Gin Route Registration Example (`internal/server/server.go`)

```go
dashHandler := dashboard.NewHandler(dashService)
reportHandler := reports.NewHandler(reportService)
analyticsHandler := analytics.NewHandler(analyticsService)
quizHandler := quiz.NewHandler(quizService)
settingsHandler := settings.NewHandler(settingsService)

v1 := router.Group("/api/v1")
v1.Use(auth.AuthMiddleware(jwtSecret, userRepo))
{
    // Dashboard
    v1.GET("/dashboard/overview", dashHandler.GetOverview)

    // Reports
    v1.GET("/reports", reportHandler.ListReports)
    v1.GET("/reports/:id", reportHandler.GetReportDetail)

    // Analytics
    v1.GET("/analytics", analyticsHandler.GetAnalytics)

    // Quiz
    v1.GET("/quizzes/daily-challenge", quizHandler.GetDailyChallenge)
    v1.POST("/quizzes/daily-challenge/verify", quizHandler.VerifyDailyChallenge)
    v1.GET("/quizzes/decks", quizHandler.ListDecks)
    v1.GET("/quizzes/decks/:id", quizHandler.GetDeckQuestions)
    v1.POST("/quizzes/decks/:id/submit", quizHandler.SubmitDeckQuiz)

    // Settings
    v1.GET("/settings", settingsHandler.GetSettings)
    v1.PUT("/settings", settingsHandler.UpdateSettings)
}
```

---

## 6. Business Logic Notes for the Backend Developer

1. **Calculating Readiness Score (`Dashboard` & `Analytics`)**:
   - `Readiness = (Avg Mock Interview Score * 0.60) + (Quiz Mastery % * 0.40)`
2. **Calculating Practice Streak**:
   - Count consecutive days backwards from today where `COUNT(interviews) + COUNT(quiz_attempts) >= 1`.
3. **Heatmap Generation**:
   - Run `GROUP BY DATE(created_at)` over the union of `interviews` and `quiz_attempts` within the past 12 weeks.
4. **AI Rubric Evaluation Storage (`interviews.feedback JSONB`)**:
   - When the AI worker finishes grading an interview session, it serializes `{ rubrics: [...], strengths: [...], weaknesses: [...], recommendations: [...] }` directly into the `feedback` JSONB column of `interviews`.
