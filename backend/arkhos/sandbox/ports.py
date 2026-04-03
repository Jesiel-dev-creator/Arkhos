"""Port allocation manager for per-generation Vite dev servers."""

from __future__ import annotations

import logging
import time
import threading

logger = logging.getLogger(__name__)

DEFAULT_PORT_RANGE = range(3010, 3061)  # 50 slots
DEFAULT_TTL = 900  # 15 minutes


class PortManager:
    """Manages dynamic port allocation for sandbox Vite servers.

    Features:
    - Allocates ports from a fixed pool
    - Maps generation_id → port and user_id → generation_id
    - Kill-on-new-generation: same user starting new gen releases previous
    - TTL tracking: get_expired() returns ports idle longer than ttl_seconds
    - Thread-safe via threading.Lock
    """

    def __init__(
        self,
        port_range: range = DEFAULT_PORT_RANGE,
        ttl_seconds: int = DEFAULT_TTL,
    ) -> None:
        self._lock = threading.Lock()
        self._pool: list[int] = list(reversed(list(port_range)))  # stack, pop from end
        self._gen_to_port: dict[str, int] = {}
        self._user_to_gen: dict[str, str] = {}
        self._last_access: dict[str, float] = {}
        self._ttl = ttl_seconds

    def allocate(self, gen_id: str, user_id: str) -> int:
        """Allocate a port for a generation. Kills user's previous gen if any."""
        with self._lock:
            # Kill-on-new-generation
            if user_id in self._user_to_gen:
                old_gen = self._user_to_gen[user_id]
                old_port = self._gen_to_port.pop(old_gen, None)
                if old_port is not None:
                    self._pool.append(old_port)
                    logger.info("Killed previous gen %s for user %s", old_gen, user_id)
                self._last_access.pop(old_gen, None)

            if not self._pool:
                raise RuntimeError("No free ports available")

            port = self._pool.pop()
            self._gen_to_port[gen_id] = port
            self._user_to_gen[user_id] = gen_id
            self._last_access[gen_id] = time.monotonic()
            logger.info("Allocated port %d for gen %s (user %s)", port, gen_id, user_id)
            return port

    def release(self, gen_id: str) -> None:
        """Release a port back to the pool."""
        with self._lock:
            self._release_locked(gen_id)

    def _release_locked(self, gen_id: str, user_id: str | None = None) -> None:
        """Internal release — caller must hold lock."""
        port = self._gen_to_port.pop(gen_id, None)
        if port is not None:
            self._pool.append(port)
            logger.info("Released port %d for gen %s", port, gen_id)
        self._last_access.pop(gen_id, None)
        # Clean user mapping
        for uid, gid in list(self._user_to_gen.items()):
            if gid == gen_id:
                del self._user_to_gen[uid]
                break

    def get_port(self, gen_id: str) -> int | None:
        """Get the port for a generation, or None if not allocated."""
        return self._gen_to_port.get(gen_id)

    def touch(self, gen_id: str) -> None:
        """Reset the TTL for a generation (called on each preview request)."""
        if gen_id in self._last_access:
            self._last_access[gen_id] = time.monotonic()

    def get_expired(self) -> list[tuple[str, int]]:
        """Return list of (gen_id, port) for generations idle past TTL."""
        now = time.monotonic()
        expired = []
        with self._lock:
            for gen_id, last in list(self._last_access.items()):
                if now - last > self._ttl:
                    port = self._gen_to_port.get(gen_id)
                    if port is not None:
                        expired.append((gen_id, port))
        return expired
