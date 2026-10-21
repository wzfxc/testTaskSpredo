"""
Pydantic models for the CoinGecko project data.
"""

from pydantic import BaseModel
from typing import Optional


class ProjectResponse(BaseModel):
    """Schema for a single filtered cryptocurrency project returned by the API."""

    id: str
    symbol: str
    name: str
    image: str
    current_price: Optional[float] = None
    market_cap: float
    market_cap_rank: Optional[int] = None
    fully_diluted_valuation: Optional[float] = None
    total_volume: float
    price_change_percentage_24h: Optional[float] = None
    circulating_supply: Optional[float] = None
    total_supply: Optional[float] = None
    max_supply: Optional[float] = None
