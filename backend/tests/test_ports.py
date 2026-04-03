"""Tests for PortManager."""

import pytest
import asyncio
from arkhos.sandbox.ports import PortManager


@pytest.fixture
def pm():
    return PortManager(port_range=range(4010, 4015), ttl_seconds=2)


def test_allocate_returns_port(pm):
    port = pm.allocate("gen-1", "user-1")
    assert port in range(4010, 4015)


def test_allocate_different_gens_get_different_ports(pm):
    p1 = pm.allocate("gen-1", "user-1")
    p2 = pm.allocate("gen-2", "user-2")
    assert p1 != p2


def test_get_port_returns_allocated(pm):
    port = pm.allocate("gen-1", "user-1")
    assert pm.get_port("gen-1") == port


def test_get_port_unknown_returns_none(pm):
    assert pm.get_port("nonexistent") is None


def test_release_frees_port(pm):
    port = pm.allocate("gen-1", "user-1")
    pm.release("gen-1")
    assert pm.get_port("gen-1") is None
    # Port should be reusable
    port2 = pm.allocate("gen-2", "user-2")
    assert port2 == port  # recycled from pool


def test_kill_on_new_generation(pm):
    """When same user starts new gen, previous gen's port is released."""
    p1 = pm.allocate("gen-1", "user-1")
    p2 = pm.allocate("gen-2", "user-1")  # same user
    assert pm.get_port("gen-1") is None  # old gen released
    assert pm.get_port("gen-2") == p2
    # The old port should be released and available for reuse
    # p1 and p2 might be the same if the released port is reallocated
    # This is correct behavior - ports are recycled


def test_pool_exhaustion_raises(pm):
    """Pool of 5 ports should exhaust after 5 allocations."""
    for i in range(5):
        pm.allocate(f"gen-{i}", f"user-{i}")
    with pytest.raises(RuntimeError, match="No free ports"):
        pm.allocate("gen-5", "user-5")


def test_get_expired(pm):
    """After TTL, ports show as expired."""
    import time
    pm.allocate("gen-1", "user-1")
    time.sleep(2.1)  # TTL is 2s in test fixture
    expired = pm.get_expired()
    assert len(expired) == 1
    assert expired[0][0] == "gen-1"


def test_touch_resets_ttl(pm):
    """Touching a port resets its TTL."""
    import time
    pm.allocate("gen-1", "user-1")
    time.sleep(1.5)
    pm.touch("gen-1")
    time.sleep(1.0)  # 1.0s after touch, still within 2s TTL
    expired = pm.get_expired()
    assert len(expired) == 0
