import type { SortConfig, SortField } from "../types";

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  maxFdv: string;
  onMaxFdvChange: (value: string) => void;
  sortConfig: SortConfig;
  onSortChange: (config: SortConfig) => void;
  resultCount: number;
}

const SORT_OPTIONS: { label: string; field: SortField; direction: "asc" | "desc" }[] = [
  { label: "Market Cap ↓", field: "market_cap", direction: "desc" },
  { label: "Market Cap ↑", field: "market_cap", direction: "asc" },
  { label: "Volume 24h ↓", field: "total_volume", direction: "desc" },
  { label: "Volume 24h ↑", field: "total_volume", direction: "asc" },
];

export default function FilterBar({
  searchQuery,
  onSearchChange,
  maxFdv,
  onMaxFdvChange,
  sortConfig,
  onSortChange,
  resultCount,
}: FilterBarProps) {
  const currentSortValue = `${sortConfig.field}-${sortConfig.direction}`;

  return (
    <div className="bg-card border border-border rounded-xl p-5 mb-6 shadow-xs">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
        {/* Search */}
        <div className="flex-1 min-w-0 w-full lg:w-auto">
          <label
            htmlFor="search-input"
            className="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wider"
          >
            Search
          </label>
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
            <input
              id="search-input"
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-lg text-sm
                         text-text-primary placeholder:text-text-muted
                         focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500
                         transition-all duration-200"
            />
          </div>
        </div>

        {/* Max FDV */}
        <div className="w-full lg:w-56">
          <label
            htmlFor="fdv-input"
            className="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wider"
          >
            Max FDV (USD)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">$</span>
            <input
              id="fdv-input"
              type="number"
              placeholder="e.g. 50000000"
              value={maxFdv}
              onChange={(e) => onMaxFdvChange(e.target.value)}
              className="w-full pl-7 pr-4 py-2.5 bg-surface border border-border rounded-lg text-sm
                         text-text-primary placeholder:text-text-muted
                         focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500
                         transition-all duration-200"
            />
          </div>
        </div>

        {/* Sort */}
        <div className="w-full lg:w-48">
          <label
            htmlFor="sort-select"
            className="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wider"
          >
            Sort by
          </label>
          <select
            id="sort-select"
            value={currentSortValue}
            onChange={(e) => {
              const [field, direction] = e.target.value.split("-") as [SortField, "asc" | "desc"];
              onSortChange({ field, direction });
            }}
            className="w-full px-3 py-2.5 bg-surface border border-border rounded-lg text-sm
                       text-text-primary appearance-none cursor-pointer
                       focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500
                       transition-all duration-200"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={`${opt.field}-${opt.direction}`} value={`${opt.field}-${opt.direction}`}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Result count badge */}
        <div className="flex items-end pb-1">
          <span className="inline-flex items-center px-3 py-2 bg-primary-50 text-primary-700 text-xs font-semibold rounded-lg whitespace-nowrap">
            {resultCount} {resultCount === 1 ? "result" : "results"}
          </span>
        </div>
      </div>
    </div>
  );
}
