"""Tests for fleet profiles and adaptive budget reallocation."""

from __future__ import annotations

import pytest

from arkhos.pipeline import (
    PROFILES,
    AdaptiveBudgetManager,
    FleetProfile,
    ProfileConfig,
)


class TestAdaptiveBudgetManager:
    """Tests for the AdaptiveBudgetManager class."""

    def test_budget_allocates_correctly(self) -> None:
        """Allocations are tracked and returned."""
        mgr = AdaptiveBudgetManager(total=0.25)
        assert mgr.allocate("planner", 0.02) == 0.02
        assert mgr.allocate("designer", 0.05) == 0.05
        assert mgr._allocations["planner"] == 0.02
        assert mgr._allocations["designer"] == 0.05

    def test_adaptive_gives_surplus_to_builder(self) -> None:
        """Unspent budget from prior agents flows to Builder."""
        mgr = AdaptiveBudgetManager(total=1.00)
        # Allocate per spec percentages
        mgr.allocate("planner", 0.08)  # 8%
        mgr.allocate("designer", 0.20)  # 20%
        mgr.allocate("architect", 0.20)  # 20%

        # Planner barely spent anything, designer/architect used half
        mgr.record_spend("planner", 0.001)
        mgr.record_spend("designer", 0.10)
        mgr.record_spend("architect", 0.10)

        builder_base = 0.40  # 40% of 1.00
        # Verify cap is applied (unspent would push past 65% cap)
        assert mgr.builder_budget(builder_base) == pytest.approx(1.00 * 0.65, abs=1e-6)

        # Unspent: (0.08-0.001) + (0.20-0.10) + (0.20-0.10) = 0.079 + 0.10 + 0.10 = 0.279
        # base + unspent = 0.40 + 0.279 = 0.679, cap = 1.00 * 0.65 = 0.65
        # So effective should be capped at 0.65
        # Use smaller surplus to test without hitting cap:
        mgr2 = AdaptiveBudgetManager(total=1.00)
        mgr2.allocate("planner", 0.08)
        mgr2.allocate("designer", 0.20)
        mgr2.allocate("architect", 0.20)
        mgr2.record_spend("planner", 0.07)
        mgr2.record_spend("designer", 0.18)
        mgr2.record_spend("architect", 0.18)

        # Unspent: 0.01 + 0.02 + 0.02 = 0.05
        effective2 = mgr2.builder_budget(0.40)
        assert effective2 == pytest.approx(0.45, abs=1e-6)
        assert effective2 < 1.00 * 0.65  # below cap

    def test_fixed_mode_no_redistribution(self) -> None:
        """In fixed mode, Builder gets exactly its base allocation."""
        mgr = AdaptiveBudgetManager(total=0.25, fixed=True)
        mgr.allocate("planner", 0.02)
        mgr.allocate("designer", 0.05)
        mgr.allocate("architect", 0.05)

        mgr.record_spend("planner", 0.001)
        mgr.record_spend("designer", 0.001)
        mgr.record_spend("architect", 0.001)

        builder_base = 0.10
        effective = mgr.builder_budget(builder_base)
        assert effective == builder_base

    def test_builder_cap_respected(self) -> None:
        """Builder budget never exceeds 65% of total."""
        mgr = AdaptiveBudgetManager(total=0.25)
        mgr.allocate("planner", 0.02)
        mgr.allocate("designer", 0.05)
        mgr.allocate("architect", 0.05)

        # All prior agents spent nothing — maximum surplus
        mgr.record_spend("planner", 0.0)
        mgr.record_spend("designer", 0.0)
        mgr.record_spend("architect", 0.0)

        builder_base = 0.10
        effective = mgr.builder_budget(builder_base)
        cap = 0.25 * 0.65  # €0.1625
        assert effective == pytest.approx(cap, abs=1e-6)

    def test_profiles_exist_and_valid(self) -> None:
        """All three fleet profiles exist with required fields."""
        assert len(PROFILES) == 3
        for profile_key in FleetProfile:
            cfg = PROFILES[profile_key]
            assert isinstance(cfg, ProfileConfig)
            assert cfg.total_budget_eur > 0
            assert cfg.planner_model
            assert cfg.designer_model
            assert cfg.architect_model
            assert cfg.builder_model
            assert cfg.reviewer_model
            assert 0 < cfg.builder_temp <= 1.0
            assert cfg.label
            assert cfg.est_cost.startswith("~")
            assert cfg.est_time.startswith("~")

        # Budget ordering: BUDGET < BALANCED < QUALITY
        budget = PROFILES[FleetProfile.BUDGET].total_budget_eur
        balanced = PROFILES[FleetProfile.BALANCED].total_budget_eur
        quality = PROFILES[FleetProfile.QUALITY].total_budget_eur
        assert budget < balanced < quality
