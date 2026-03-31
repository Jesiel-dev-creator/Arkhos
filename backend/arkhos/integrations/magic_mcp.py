"""Magic MCP integration for 21st.dev inspiration at runtime.

Calls the FetchUiTool to get premium component patterns.
Falls back gracefully if MCP unavailable.
"""

import logging

logger = logging.getLogger(__name__)


async def fetch_inspiration(query: str) -> str:
    """Fetch UI inspiration from 21st.dev Magic MCP.

    Returns component pattern reference as string.
    Falls back gracefully if MCP unavailable.
    """
    # The actual MCP call happens via Claude Code's MCP context.
    # In production (Scaleway), this will be called via the MCP server URL.
    # For now, return empty string — pre-built templates handle this.
    # TODO: wire to 21st.dev MCP server endpoint when deployed
    return ""
