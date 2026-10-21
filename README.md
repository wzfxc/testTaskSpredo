# Crypto Screener

A full-stack cryptocurrency screening application that fetches, filters, and displays crypto project data from the **CoinGecko API**. The backend pre-filters coins based on specific market criteria, while the frontend provides additional client-side filtering, searching, and sorting.

---

## Tech Stack

| Layer    | Technology                          |
| -------- | ----------------------------------- |
| Backend  | Python 3.10+, FastAPI, httpx        |
| Frontend | React 19, Vite, TypeScript, Tailwind CSS v4 |
| API      | CoinGecko REST API (free tier)      |

---

## Project Structure

```
├── backend/
│   ├── main.py                  # FastAPI app, CORS, /api/projects endpoint
│   ├── services/
│   │   └── coingecko.py         # CoinGecko API client, caching, filtering logic
│   ├── models/
│   │   └── schemas.py           # Pydantic response schemas
│   └── requirements.txt         # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── App.tsx              # Root component, state management
│   │   ├── api.ts               # API client (calls backend)
│   │   ├── types.ts             # TypeScript interfaces
│   │   ├── utils.ts             # Formatting utilities
│   │   └── components/
│   │       ├── FilterBar.tsx    # Search, FDV filter, sort dropdown
│   │       └── ProjectTable.tsx # Data table with sortable headers
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
└── README.md
```

---

## Setup Instructions

### Prerequisites

- **Python 3.10+** with `pip`
- **Node.js 18+** with `npm`

### 1. Backend

```bash
cd backend

# Create and activate a virtual environment (recommended)
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the server (runs on http://localhost:8000)
uvicorn main:app --reload
```

Once running, visit **http://localhost:8000/docs** for the auto-generated Swagger UI.

### 2. Frontend

```bash
cd frontend

# Install dependencies
npm install --legacy-peer-deps

# Start the dev server (runs on http://localhost:5173)
npm run dev
```

Open **http://localhost:5173** in your browser.

> **Note:** Start the backend first so the frontend can fetch data from `http://localhost:8000/api/projects`.

---

## Completed Features

### Backend
- [x] CoinGecko `/coins/markets` API integration (fetches up to 500 coins)
- [x] In-memory TTL cache (60 seconds) to respect rate limits
- [x] Server-side filtering:
  - [x] Market Cap > 0
  - [x] Max Supply == Total Supply (both non-null)
  - [x] FDV < $100,000,000
  - [x] 24h Volume > $50,000
  - [ ] `preview_listing == true` (not available — see Assumptions)
  - [ ] TVL > $50,000 (not available — see Assumptions)
- [x] Single REST endpoint: `GET /api/projects`
- [x] CORS enabled for `localhost:5173`
- [x] Auto-generated Swagger docs at `/docs`
- [x] Health check endpoint at `/health`

### Frontend
- [x] Fetch pre-filtered data from backend on mount
- [x] Client-side search by name/symbol (case-insensitive partial match)
- [x] Client-side max FDV filter
- [x] Sort by Market Cap (asc/desc) via dropdown or header click
- [x] Sort by 24h Volume (asc/desc) via dropdown or header click
- [x] Loading skeleton during data fetch
- [x] Error state with retry button
- [x] Empty state when no results match
- [x] Clean, bright, professional light theme (Notion-inspired)
- [x] Responsive layout

---

## Assumptions & Limitations

### 1. `preview_listing` field
The CoinGecko free-tier `/coins/markets` endpoint **does not return** a `preview_listing` field. This filter is **documented but not applied**. If this field becomes available (e.g., via a paid plan or a different endpoint), it can be added as a one-line check in `services/coingecko.py → _apply_filters()`.

### 2. TVL (Total Value Locked)
The `/coins/markets` endpoint does not include TVL data. Fetching TVL would require individual `/coins/{id}` calls for each coin, which is prohibitively slow for 500 coins on the free tier (rate-limited to ~10-30 req/min). This filter is **documented but not applied**. A production implementation could:
- Use a paid CoinGecko API plan with higher rate limits.
- Fetch TVL data asynchronously and cache it separately.
- Use CoinGecko's `/coins/markets` with the `category` parameter to narrow results first.

### 3. Rate Limiting
The free CoinGecko API allows roughly 10-30 requests per minute. We mitigate this with a **60-second in-memory TTL cache** — the backend makes at most 2 API calls per minute (for 2 pages of 250 coins each). If the cache is fresh, no external calls are made.

### 4. Data Freshness
Cached data may be up to 60 seconds stale. For a real-time trading application, a WebSocket connection or shorter TTL would be needed.

### 5. Max Supply == Total Supply Filter
Some coins report `max_supply` and `total_supply` as floating-point numbers. We use a direct equality check (`==`). In practice, this works because CoinGecko typically returns these as whole numbers or identical values.

---

## AI Workflow Explanation

### Tools Used
- **[Tool Name]**: [e.g., Cursor, GitHub Copilot, Claude 3.5 Sonnet]

### How They Were Used
- **Generating boilerplate**: [e.g., FastAPI project structure, Vite + React scaffolding, Tailwind configuration]
- **Data mapping logic**: [e.g., Mapping CoinGecko API response fields to the internal schema]
- **UI implementation**: [e.g., Creating the table component, filter bar, responsive layout]

### Where They Helped Most
- [e.g., Rapidly scaffolding the FastAPI endpoints and Vite setup, reducing setup time from ~30 minutes to ~5 minutes]
- [e.g., Generating the CoinGecko API integration with proper error handling and caching]

### Manual Reviews & Corrections
- [e.g., Adjusted the CoinGecko API filtering logic to handle missing/null fields (`max_supply`, `total_supply`) to prevent runtime crashes]
- [e.g., Refined the UI away from standard AI-generated dark themes to a clean, professional light theme]
- [e.g., Verified that the cache TTL strategy effectively prevents 429 rate-limit errors]
- [e.g., Tested edge cases: empty search results, API failures, coins with null FDV values]

---

## API Documentation

### `GET /api/projects`

Returns a pre-filtered list of cryptocurrency projects.

**Response** `200 OK`:
```json
[
  {
    "id": "example-coin",
    "symbol": "exc",
    "name": "Example Coin",
    "image": "https://assets.coingecko.com/...",
    "current_price": 1.23,
    "market_cap": 45000000,
    "market_cap_rank": 150,
    "fully_diluted_valuation": 50000000,
    "total_volume": 120000,
    "price_change_percentage_24h": 2.45,
    "circulating_supply": 40000000,
    "total_supply": 50000000,
    "max_supply": 50000000
  }
]
```

**Error** `502 Bad Gateway`:
```json
{
  "detail": "Failed to fetch data from CoinGecko: ..."
}
```

### `GET /health`

Health check endpoint.

**Response** `200 OK`:
```json
{
  "status": "ok"
}
```

---

## License

This project was built as a technical assessment.
