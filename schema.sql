-- Cloudflare D1 Database Schema for 10ms Certificate Project

CREATE TABLE IF NOT EXISTS result_submissions (
    id TEXT PRIMARY KEY,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    certificate_name TEXT NOT NULL,
    class_name TEXT,
    school_name TEXT NOT NULL,
    preparation_type TEXT NOT NULL,
    exam_name TEXT NOT NULL,
    total_marks REAL NOT NULL,
    exam_total_marks REAL,
    class_position INTEGER NOT NULL,
    result_card_url TEXT,
    student_phone TEXT,
    student_email TEXT,
    external_user_id TEXT
);

-- Index for gallery queries sorted by creation date
CREATE INDEX IF NOT EXISTS idx_result_submissions_created_at ON result_submissions(created_at DESC);
