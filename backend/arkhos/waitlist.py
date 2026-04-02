"""Simple waitlist email storage using SQLite."""

from __future__ import annotations

import logging
import sqlite3
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

DB_PATH = "arkhos_waitlist.db"


def _init_db() -> None:
    """Create waitlist table if it doesn't exist."""
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            """CREATE TABLE IF NOT EXISTS waitlist (
                email TEXT PRIMARY KEY,
                created_at TEXT NOT NULL
            )"""
        )


_init_db()


def add_email(email: str) -> bool:
    """Add email to waitlist. Returns True if new, False if already exists."""
    try:
        with sqlite3.connect(DB_PATH) as conn:
            conn.execute(
                "INSERT OR IGNORE INTO waitlist (email, created_at) VALUES (?, ?)",
                (email, datetime.now(timezone.utc).isoformat()),
            )
            return conn.total_changes > 0
    except Exception:
        logger.exception("Failed to add email to waitlist")
        return False
