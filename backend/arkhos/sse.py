"""SSE event types and formatting for agent streaming."""

from __future__ import annotations

import json
import logging
from enum import StrEnum
from typing import Any

logger = logging.getLogger(__name__)


class SSEEventType(StrEnum):
    """SSE event types for the generation stream."""

    AGENT_START = "agent_start"
    AGENT_OUTPUT = "agent_output"
    AGENT_COMPLETE = "agent_complete"
    PREVIEW_READY = "preview_ready"
    GENERATION_COMPLETE = "generation_complete"
    PLAN_READY = "plan_ready"
    ERROR = "error"


def format_sse(event: SSEEventType | str, data: dict[str, Any]) -> str:
    """Format a Server-Sent Event string.

    Args:
        event: The SSE event type.
        data: The event payload (will be JSON-serialized).

    Returns:
        Formatted SSE string ready to send over HTTP.
    """
    event_name = event.value if isinstance(event, SSEEventType) else event
    json_data = json.dumps(data, ensure_ascii=False)
    return f"event: {event_name}\ndata: {json_data}\n\n"
