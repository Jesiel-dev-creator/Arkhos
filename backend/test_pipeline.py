"""Quick test: run the pipeline and save output HTML.

Usage:
    cd arkhos/backend
    cp .env.example .env  # add your MISTRAL_API_KEY
    pip install -e .
    python test_pipeline.py           # non-streaming test
    python test_pipeline.py --stream  # SSE streaming test
"""

from __future__ import annotations

import asyncio
import json
import logging
import sys
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()  # Load .env before any Tramontane imports

# Configure logging before any imports that use it
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
    datefmt="%H:%M:%S",
)

logger = logging.getLogger("arkhos.test")

TEST_PROMPT = (
    "A landing page for a French bakery in Paris called 'Le Petit Four'. "
    "Modern and warm design with earth tones. Sections: hero with bakery photo, "
    "our story (about us), menu highlights with 3 signature pastries, "
    "and a contact section with address and opening hours. "
    "Mobile responsive. Locale: French."
)


async def main() -> None:
    """Run a test generation and save the output."""
    from arkhos.pipeline import run_pipeline

    logger.info("=" * 60)
    logger.info("ArkhosAI Pipeline Test (non-streaming)")
    logger.info("=" * 60)
    logger.info("Prompt: %s", TEST_PROMPT[:80] + "...")
    logger.info("Starting pipeline...")

    result = await run_pipeline(prompt=TEST_PROMPT, locale="fr")

    logger.info("=" * 60)
    logger.info("RESULTS")
    logger.info("=" * 60)
    logger.info("Success: %s", result.success)

    if result.error:
        logger.error("Error: %s", result.error)
        sys.exit(1)

    logger.info("Total cost: EUR%.4f", result.total_cost_eur)
    logger.info("Total duration: %.1fs", result.total_duration_s)
    logger.info("Models used: %s", result.models_used)

    # Save output
    output_path = Path("test_output.html")
    output_path.write_text(result.html, encoding="utf-8")
    logger.info("HTML saved to: %s (%d bytes)", output_path, len(result.html))
    logger.info("Open in browser: file://%s", output_path.resolve())


async def test_streaming() -> None:
    """Test the SSE streaming pipeline."""
    from arkhos.pipeline import run_pipeline_streaming

    logger.info("=" * 60)
    logger.info("ArkhosAI SSE Streaming Test")
    logger.info("=" * 60)
    logger.info("Prompt: %s", TEST_PROMPT[:80] + "...")

    event_count = 0
    final_html = ""

    async for sse_event in run_pipeline_streaming(TEST_PROMPT, "fr"):
        event_count += 1
        # Print first 200 chars of each event for readability
        preview = sse_event[:200].replace("\n", " | ")
        logger.info("SSE Event #%d: %s", event_count, preview)

        # Capture final HTML for saving
        for line in sse_event.split("\n"):
            if not line.startswith("data: "):
                continue
            try:
                data = json.loads(line[6:])
                if data.get("stage") == "final" and "html" in data:
                    final_html = data["html"]
            except (json.JSONDecodeError, KeyError):
                pass

    logger.info("Total SSE events: %d", event_count)

    if final_html:
        output_path = Path("test_output.html")
        output_path.write_text(final_html, encoding="utf-8")
        logger.info("HTML saved to: %s (%d bytes)", output_path, len(final_html))
        logger.info("Open in browser: file://%s", output_path.resolve())


if __name__ == "__main__":
    if "--stream" in sys.argv:
        asyncio.run(test_streaming())
    else:
        asyncio.run(main())
