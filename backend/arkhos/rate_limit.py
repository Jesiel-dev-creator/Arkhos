"""IP-based rate limiting for generation requests."""

from __future__ import annotations

import logging
import time
from dataclasses import dataclass, field

from arkhos.config import get_settings

logger = logging.getLogger(__name__)


@dataclass
class _IPRecord:
    """Track generation count per IP per day."""

    count: int = 0
    first_request: float = field(default_factory=time.time)


class RateLimiter:
    """In-memory IP-based rate limiter."""

    def __init__(self) -> None:
        self._records: dict[str, _IPRecord] = {}
        self._daily_cost_eur: float = 0.0
        self._daily_reset: float = time.time()

    def _reset_if_new_day(self) -> None:
        """Reset all counters if 24h have passed."""
        if time.time() - self._daily_reset > 86400:
            self._records.clear()
            self._daily_cost_eur = 0.0
            self._daily_reset = time.time()
            logger.info("Rate limiter daily reset")

    def check(self, ip: str) -> tuple[bool, str]:
        """Check if a request from this IP is allowed.

        Returns:
            (allowed, reason) — True if allowed, False with reason if not.
        """
        self._reset_if_new_day()
        settings = get_settings()

        # Global daily budget check
        if self._daily_cost_eur >= settings.global_daily_budget_eur:
            return False, "Global daily budget exceeded. Try again tomorrow."

        # Per-IP limit check
        record = self._records.get(ip)
        if record is None:
            record = _IPRecord()
            self._records[ip] = record

        # Reset per-IP if their window expired (24h)
        if time.time() - record.first_request > 86400:
            record.count = 0
            record.first_request = time.time()

        if record.count >= settings.max_generations_per_ip:
            return (
                False,
                f"Rate limit: {settings.max_generations_per_ip} generations per day.",
            )

        return True, ""

    def record_generation(self, ip: str, cost_eur: float) -> None:
        """Record a completed generation for rate limiting."""
        self._reset_if_new_day()
        record = self._records.get(ip)
        if record is None:
            record = _IPRecord()
            self._records[ip] = record
        record.count += 1
        self._daily_cost_eur += cost_eur
        logger.info(
            "Rate limit: ip=%s count=%d daily_cost=€%.4f",
            ip,
            record.count,
            self._daily_cost_eur,
        )


# Singleton instance
rate_limiter = RateLimiter()
