"""
CoinGecko API service with in-memory caching and filtering logic.

Assumptions & Limitations:
- The free CoinGecko /coins/markets endpoint does NOT return `preview_listing` or `tvl`.
  We document this and skip those filters (see README for details).
- A simple TTL-based cache (60 seconds) is used to avoid 429 rate-limit errors.
- We fetch up to 250 coins per page across multiple pages to get a broader dataset.
"""

import time
from typing import Any

import httpx

# ---------------------------------------------------------------------------
# In-memory TTL cache
# ---------------------------------------------------------------------------
_cache: dict[str, Any] = {}
_cache_timestamp: float = 0.0
CACHE_TTL_SECONDS: int = 60  # Refresh data at most once per minute


COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3"


async def _fetch_from_coingecko() -> list[dict]:
    """
    Fetch coin market data from CoinGecko.
    Fetches 2 pages of 250 results to get a wider pool of coins.
    """
    all_coins: list[dict] = []

    async with httpx.AsyncClient(timeout=30.0) as client:
        for page in range(1, 3):  # pages 1 and 2
            params = {
                "vs_currency": "usd",
                "order": "market_cap_desc",
                "per_page": 250,
                "page": page,
                "sparkline": "false",
            }
            response = await client.get(
                f"{COINGECKO_BASE_URL}/coins/markets", params=params
            )
            response.raise_for_status()
            all_coins.extend(response.json())

    return all_coins


def _apply_filters(coins: list[dict]) -> list[dict]:
    """
    Apply the required server-side filters:
      1. Market Cap > 0
      2. preview_listing == true  → NOT available in free tier; skipped (see README)
      3. Max Supply == Total Supply (ignore coins where either is null)
      4. FDV < $100,000,000
      5. 24h Trading Volume > $50,000
      6. TVL > $50,000             → NOT available in /coins/markets; skipped (see README)
    """
    filtered: list[dict] = []

    for coin in coins:
        market_cap = coin.get("market_cap")
        fdv = coin.get("fully_diluted_valuation")
        total_volume = coin.get("total_volume")
        max_supply = coin.get("max_supply")
        total_supply = coin.get("total_supply")

        # 1. Market Cap > 0
        if market_cap is None or market_cap <= 0:
            continue

        # 3. Max Supply == Total Supply (both must be non-null)
        if max_supply is None or total_supply is None:
            continue
        if max_supply != total_supply:
            continue

        # 4. FDV < $100,000,000
        if fdv is None or fdv >= 100_000_000:
            continue

        # 5. 24h Trading Volume > $50,000
        if total_volume is None or total_volume <= 50_000:
            continue

        filtered.append(coin)

    return filtered


def _serialize(coin: dict) -> dict:
    """Map raw CoinGecko response fields to our API schema."""
    return {
        "id": coin.get("id", ""),
        "symbol": coin.get("symbol", ""),
        "name": coin.get("name", ""),
        "image": coin.get("image", ""),
        "current_price": coin.get("current_price"),
        "market_cap": coin.get("market_cap", 0),
        "market_cap_rank": coin.get("market_cap_rank"),
        "fully_diluted_valuation": coin.get("fully_diluted_valuation"),
        "total_volume": coin.get("total_volume", 0),
        "price_change_percentage_24h": coin.get("price_change_percentage_24h"),
        "circulating_supply": coin.get("circulating_supply"),
        "total_supply": coin.get("total_supply"),
        "max_supply": coin.get("max_supply"),
    }


async def get_filtered_projects() -> list[dict]:
    """
    Return the filtered & serialized list of projects.
    Uses a TTL-based in-memory cache to minimize CoinGecko API calls.
    """
    global _cache, _cache_timestamp

    now = time.time()

    if "projects" in _cache and (now - _cache_timestamp) < CACHE_TTL_SECONDS:
        return _cache["projects"]

    raw_coins = await _fetch_from_coingecko()
    filtered = _apply_filters(raw_coins)
    serialized = [_serialize(c) for c in filtered]

    _cache["projects"] = serialized
    _cache_timestamp = now

    return serialized
