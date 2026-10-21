import type { Project, SortConfig, SortField } from "../types";
import { formatCurrency, formatPercentage } from "../utils";

interface ProjectTableProps {
  projects: Project[];
  sortConfig: SortConfig;
  onSortChange: (config: SortConfig) => void;
}

function SortIcon({ field, sortConfig }: { field: SortField; sortConfig: SortConfig }) {
  const isActive = sortConfig.field === field;

  return (
    <span className={`inline-flex ml-1 ${isActive ? "text-primary-600" : "text-text-muted"}`}>
      {isActive ? (sortConfig.direction === "asc" ? "↑" : "↓") : "↕"}
    </span>
  );
}

export default function ProjectTable({ projects, sortConfig, onSortChange }: ProjectTableProps) {
  function handleHeaderClick(field: SortField) {
    if (sortConfig.field === field) {
      onSortChange({
        field,
        direction: sortConfig.direction === "asc" ? "desc" : "asc",
      });
    } else {
      onSortChange({ field, direction: "desc" });
    }
  }

  if (projects.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-12 text-center shadow-xs">
        <div className="text-5xl mb-4">📭</div>
        <h3 className="text-lg font-semibold text-text-primary mb-2">No projects found</h3>
        <p className="text-sm text-text-secondary">
          Try adjusting your filters or search query.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface/50">
              <th className="text-left px-4 py-3.5 font-semibold text-text-secondary text-xs uppercase tracking-wider w-10">
                #
              </th>
              <th className="text-left px-4 py-3.5 font-semibold text-text-secondary text-xs uppercase tracking-wider">
                Name
              </th>
              <th className="text-right px-4 py-3.5 font-semibold text-text-secondary text-xs uppercase tracking-wider">
                Price
              </th>
              <th className="text-right px-4 py-3.5 font-semibold text-text-secondary text-xs uppercase tracking-wider">
                24h %
              </th>
              <th
                className="text-right px-4 py-3.5 font-semibold text-text-secondary text-xs uppercase tracking-wider cursor-pointer hover:text-primary-600 transition-colors select-none"
                onClick={() => handleHeaderClick("market_cap")}
              >
                Market Cap
                <SortIcon field="market_cap" sortConfig={sortConfig} />
              </th>
              <th
                className="text-right px-4 py-3.5 font-semibold text-text-secondary text-xs uppercase tracking-wider cursor-pointer hover:text-primary-600 transition-colors select-none"
                onClick={() => handleHeaderClick("total_volume")}
              >
                Volume (24h)
                <SortIcon field="total_volume" sortConfig={sortConfig} />
              </th>
              <th className="text-right px-4 py-3.5 font-semibold text-text-secondary text-xs uppercase tracking-wider">
                FDV
              </th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project, index) => {
              const change = formatPercentage(project.price_change_percentage_24h);

              return (
                <tr
                  key={project.id}
                  className="border-b border-border/50 last:border-b-0 hover:bg-primary-50/30 transition-colors duration-150"
                >
                  {/* Rank */}
                  <td className="px-4 py-3.5 text-text-muted font-medium">
                    {index + 1}
                  </td>

                  {/* Name + Icon */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <img
                        src={project.image}
                        alt={project.name}
                        className="w-7 h-7 rounded-full ring-1 ring-border"
                        loading="lazy"
                      />
                      <div>
                        <span className="font-semibold text-text-primary">
                          {project.name}
                        </span>
                        <span className="ml-2 text-xs text-text-muted uppercase">
                          {project.symbol}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="px-4 py-3.5 text-right font-medium text-text-primary tabular-nums">
                    {project.current_price != null
                      ? `$${project.current_price.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 6,
                        })}`
                      : "—"}
                  </td>

                  {/* 24h Change */}
                  <td
                    className={`px-4 py-3.5 text-right font-semibold tabular-nums ${
                      change.isPositive ? "text-positive" : "text-negative"
                    }`}
                  >
                    {change.text}
                  </td>

                  {/* Market Cap */}
                  <td className="px-4 py-3.5 text-right text-text-primary tabular-nums">
                    {formatCurrency(project.market_cap)}
                  </td>

                  {/* Volume */}
                  <td className="px-4 py-3.5 text-right text-text-primary tabular-nums">
                    {formatCurrency(project.total_volume)}
                  </td>

                  {/* FDV */}
                  <td className="px-4 py-3.5 text-right text-text-secondary tabular-nums">
                    {formatCurrency(project.fully_diluted_valuation)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
