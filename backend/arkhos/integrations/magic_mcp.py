"""Magic MCP integration for 21st.dev inspiration at runtime.

Calls the FetchUiTool to get premium component patterns.
Falls back gracefully if MCP unavailable.
"""

import logging
import httpx
import json
from typing import Optional, Dict, Any
from pydantic import BaseModel

logger = logging.getLogger(__name__)


class MCPResponse(BaseModel):
    """Response model for MCP API calls."""
    success: bool
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


class MagicMCP:
    """Magic MCP client for parallel agent coordination."""
    
    def __init__(self, base_url: str = "https://api.21st.dev/mcp", api_key: Optional[str] = None):
        self.base_url = base_url
        self.api_key = api_key
        self.client = httpx.AsyncClient(
            headers={
                "Content-Type": "application/json",
                "Accept": "application/json",
            }
        )
        if self.api_key:
            self.client.headers["Authorization"] = f"Bearer {self.api_key}"
    
    async def fetch_inspiration(self, query: str, timeout: int = 10) -> str:
        """Fetch UI inspiration from 21st.dev Magic MCP.
        
        Args:
            query: The design inspiration query
            timeout: Request timeout in seconds
            
        Returns:
            Component pattern reference as string, or empty string on failure
        """
        try:
            payload = {
                "query": query,
                "source": "arkhosai",
                "format": "react_tailwind"
            }
            
            response = await self.client.post(
                f"{self.base_url}/fetch-ui",
                json=payload,
                timeout=timeout
            )
            
            if response.status_code == 200:
                data = response.json()
                return data.get("pattern", "")
            else:
                logger.warning("MCP request failed with status %s: %s", 
                             response.status_code, response.text)
                return ""
                
        except httpx.HTTPError as e:
            logger.debug("MCP unavailable (DNS/network): %s", str(e))
            return ""
        except json.JSONDecodeError as e:
            logger.warning("MCP JSON decode error: %s", str(e))
            return ""
        except Exception as e:
            logger.warning("MCP unexpected error: %s", str(e))
            return ""
    
    async def parallel_agent_coordination(self, agents: list, tasks: list) -> Dict[str, Any]:
        """Coordinate multiple agents in parallel using MCP.
        
        Args:
            agents: List of agent identifiers
            tasks: List of tasks to execute in parallel
            
        Returns:
            Dictionary with agent results
        """
        try:
            payload = {
                "agents": agents,
                "tasks": tasks,
                "strategy": "parallel"
            }
            
            response = await self.client.post(
                f"{self.base_url}/coordinate",
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                logger.warning("MCP coordination failed with status %s: %s", 
                             response.status_code, response.text)
                return {"success": False, "error": "Coordination failed"}
                
        except Exception as e:
            logger.debug("MCP coordination unavailable: %s", str(e))
            return {"success": False, "error": str(e)}
    
    async def close(self):
        """Close the HTTP client."""
        await self.client.aclose()


# Global instance for convenience
mcp_client = MagicMCP()


async def fetch_inspiration(query: str) -> str:
    """Fetch UI inspiration from 21st.dev Magic MCP.

    Returns component pattern reference as string.
    Falls back gracefully if MCP unavailable.
    """
    return await mcp_client.fetch_inspiration(query)


async def coordinate_agents(agents: list, tasks: list) -> Dict[str, Any]:
    """Coordinate multiple agents using MCP.
    
    Args:
        agents: List of agent identifiers
        tasks: List of tasks to execute
        
    Returns:
        Coordination results
    """
    return await mcp_client.parallel_agent_coordination(agents, tasks)
