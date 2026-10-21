import { useEffect, useMemo, useState } from "react";
import { fetchProjects } from "./api";
import FilterBar from "./components/FilterBar";
import ProjectTable from "./components/ProjectTable";
import type { Project, SortConfig } from "./types";

export default function App() {
  // ---- Server data ----
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---- Client-side filters ----
  const [searchQuery, setSearchQuery] = useState("");
  const [maxFdv, setMaxFdv] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: "market_cap",
    direction: "desc",
  });

  // ---- Fetch on mount ----
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchProjects();
        if (!cancelled) setProjects(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // ---- Derived filtered + sorted list ----
  const displayedProjects = useMemo(() => {
    let result = [...projects];

    // Text search (case-insensitive partial match on name)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.symbol.toLowerCase().includes(q)
      );
    }

    // Max FDV filter
    const fdvLimit = parseFloat(maxFdv);
    if (!isNaN(fdvLimit) && fdvLimit > 0) {
      result = result.filter(
        (p) => p.fully_diluted_valuation != null && p.fully_diluted_valuation <= fdvLimit
      );
    }

    // Sort
    result.sort((a, b) => {
      const aVal = a[sortConfig.field] ?? 0;
      const bVal = b[sortConfig.field] ?? 0;
      return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
    });

    return result;
  }, [projects, searchQuery, maxFdv, sortConfig]);

  // ---- Render ----
  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-text-primary tracking-tight">
                Crypto Screener
              </h1>
              <p className="text-sm text-text-secondary mt-0.5">
                Pre-filtered cryptocurrency projects · Powered by CoinGecko
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-text-muted">
              <span className="inline-block w-2 h-2 bg-positive rounded-full animate-pulse" />
              Live data
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <LoadingSkeleton />
        ) : error ? (
          <ErrorCard message={error} onRetry={() => window.location.reload()} />
        ) : (
          <>
            <FilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              maxFdv={maxFdv}
              onMaxFdvChange={setMaxFdv}
              sortConfig={sortConfig}
              onSortChange={setSortConfig}
              resultCount={displayedProjects.length}
            />
            <ProjectTable
              projects={displayedProjects}
              sortConfig={sortConfig}
              onSortChange={setSortConfig}
            />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 mt-12">
        <p className="text-center text-xs text-text-muted">
          Data provided by CoinGecko · Built with FastAPI + React
        </p>
      </footer>
    </div>
  );
}

/* ---------- Sub-components ---------- */

function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Filter bar skeleton */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-xs">
        <div className="flex gap-4">
          <div className="flex-1 h-10 bg-surface rounded-lg" />
          <div className="w-56 h-10 bg-surface rounded-lg" />
          <div className="w-48 h-10 bg-surface rounded-lg" />
        </div>
      </div>
      {/* Table skeleton */}
      <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-4 border-b border-border/50">
            <div className="w-7 h-7 bg-surface rounded-full" />
            <div className="flex-1 h-4 bg-surface rounded" />
            <div className="w-20 h-4 bg-surface rounded" />
            <div className="w-16 h-4 bg-surface rounded" />
            <div className="w-24 h-4 bg-surface rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="bg-card border border-negative/20 rounded-xl p-8 text-center shadow-xs">
      <div className="text-4xl mb-4">⚠️</div>
      <h2 className="text-lg font-semibold text-text-primary mb-2">
        Failed to load data
      </h2>
      <p className="text-sm text-text-secondary mb-6 max-w-md mx-auto">{message}</p>
      <button
        onClick={onRetry}
        className="px-5 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg
                   hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500/50
                   transition-colors duration-200"
      >
        Try again
      </button>
    </div>
  );
}
