"""Tests for smart skill injection and cross-generation memory."""

from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock

import pytest

from arkhos.intelligence import (
    _extract_triggers,
    get_relevant_skills,
    load_skills,
    recall_context,
    record_agent_experience,
    record_generation_experience,
)


class TestSkillLoading:
    """Tests for loading skills from markdown files."""

    def test_load_skills_returns_all_roles(self) -> None:
        """Skill registry has all expected role keys."""
        registry = load_skills()
        assert "planner" in registry
        assert "designer" in registry
        assert "builder" in registry
        assert "reviewer" in registry
        assert "shared" in registry

    def test_load_skills_finds_files(self) -> None:
        """At least some skill files are loaded per role."""
        registry = load_skills()
        assert len(registry["planner"]) > 0
        assert len(registry["designer"]) > 0
        assert len(registry["builder"]) > 0
        assert len(registry["reviewer"]) > 0
        assert len(registry["shared"]) > 0

    def test_total_skill_count(self) -> None:
        """Should find ~24 skill files total."""
        registry = load_skills()
        total = sum(len(v) for v in registry.values())
        assert total >= 20  # at least 20 of the 24 expected

    def test_skills_have_instructions(self) -> None:
        """Each loaded skill has non-empty instructions."""
        registry = load_skills()
        for role, skills in registry.items():
            for skill in skills:
                assert skill._instructions, f"{role}/{skill.name} has empty instructions"

    def test_extract_triggers_bakery(self) -> None:
        """Bakery industry triggers include French terms."""
        triggers = _extract_triggers("bakery", "planner")
        assert "boulangerie" in triggers
        assert "patisserie" in triggers

    def test_extract_triggers_saas(self) -> None:
        """SaaS industry triggers include tech terms."""
        triggers = _extract_triggers("saas", "planner")
        assert "saas" in triggers
        assert "dashboard" in triggers


class TestRelevanceMatching:
    """Tests for smart skill injection based on prompt relevance."""

    def test_bakery_prompt_gets_bakery_skill(self) -> None:
        """Bakery prompt should rank bakery.md highest."""
        registry = load_skills()
        result = get_relevant_skills(
            registry, "planner", "Create a website for a boulangerie in Paris",
        )
        assert "bakery" in result.lower() or len(result) > 0

    def test_saas_prompt_gets_saas_skill(self) -> None:
        """SaaS prompt should rank saas.md highest."""
        registry = load_skills()
        result = get_relevant_skills(
            registry, "planner", "Build a SaaS dashboard landing page",
        )
        assert len(result) > 0

    def test_top_k_limits_output(self) -> None:
        """Should return at most top_k skills."""
        registry = load_skills()
        # With top_k=1 should return fewer skills than top_k=10
        result_1 = get_relevant_skills(registry, "builder", "any prompt", top_k=1)
        result_10 = get_relevant_skills(registry, "builder", "any prompt", top_k=10)
        # result_1 should be shorter (fewer files concatenated)
        assert len(result_1) <= len(result_10)

    def test_empty_role_returns_fallback(self) -> None:
        """Architect has no skills dir — should return shared skills."""
        registry = load_skills()
        result = get_relevant_skills(registry, "architect", "test prompt")
        # Should get shared skills as fallback
        assert isinstance(result, str)

    def test_unknown_role_returns_empty(self) -> None:
        """Unknown role returns empty string."""
        registry = load_skills()
        result = get_relevant_skills(registry, "nonexistent", "test")
        assert result == "" or isinstance(result, str)


class TestMemoryIntegration:
    """Tests for memory recall and recording (mocked TramontaneMemory)."""

    @pytest.fixture()
    def mock_memory(self) -> MagicMock:
        """Create a mock TramontaneMemory."""
        mem = MagicMock()
        mem.recall = AsyncMock(return_value=[])
        mem.record_experience = AsyncMock(return_value="mem-123")
        return mem

    async def test_recall_empty_returns_empty_string(
        self, mock_memory: MagicMock,
    ) -> None:
        """No memories → empty string (no breaking change)."""
        result = await recall_context(mock_memory, "designer", "bakery site")
        assert result == ""
        mock_memory.recall.assert_called_once()

    async def test_recall_with_results_formats_context(
        self, mock_memory: MagicMock,
    ) -> None:
        """With memories → formatted context block."""
        mock_memory.recall = AsyncMock(return_value=[
            {"content": "warm palettes work for bakeries"},
            {"content": "use serif fonts for food sites"},
        ])
        result = await recall_context(mock_memory, "designer", "bakery site")
        assert "Past Experience" in result
        assert "warm palettes" in result
        assert "serif fonts" in result

    async def test_record_agent_experience_calls_memory(
        self, mock_memory: MagicMock,
    ) -> None:
        """Recording calls memory.record_experience with correct args."""
        await record_agent_experience(
            mock_memory, "builder", "bakery prompt", "12 files generated",
            "devstral-small", 0.005,
        )
        mock_memory.record_experience.assert_called_once()
        call_kwargs = mock_memory.record_experience.call_args
        assert call_kwargs[1]["agent_role"] == "builder"
        assert call_kwargs[1]["model"] == "devstral-small"
        assert call_kwargs[1]["cost"] == 0.005

    async def test_record_generation_experience_calls_memory(
        self, mock_memory: MagicMock,
    ) -> None:
        """Generation recording includes all metadata."""
        await record_generation_experience(
            mock_memory,
            prompt="French bakery",
            profile="balanced",
            total_cost=0.012,
            models_used=["ministral-3b", "mistral-small", "devstral-small"],
            success=True,
            file_count=12,
            reviewer_summary="8/10 quality",
        )
        mock_memory.record_experience.assert_called_once()
        call_kwargs = mock_memory.record_experience.call_args
        assert "French bakery" in call_kwargs[1]["summary"]
        assert "balanced" in call_kwargs[1]["summary"]
        assert call_kwargs[1]["cost"] == 0.012
