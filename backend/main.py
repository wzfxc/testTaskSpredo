"""
FastAPI application — exposes /api/projects with CORS enabled.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from models.schemas import ProjectResponse
from services.coingecko import get_filtered_projects

app = FastAPI(
    title="Crypto Screener API",
    description="Pre-filtered cryptocurrency data powered by CoinGecko",
    version="1.0.0",
)

# ---------------------------------------------------------------------------
# CORS — allow the Vite dev server (default port 5173)
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/projects", response_model=list[ProjectResponse])
async def list_projects():
    """
    Return the pre-filtered list of cryptocurrency projects.
    Filters are applied server-side (see services/coingecko.py).
    """
    try:
        projects = await get_filtered_projects()
        return projects
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch data from CoinGecko: {str(exc)}",
        )


@app.get("/health")
async def health_check():
    """Simple health-check endpoint."""
    return {"status": "ok"}
