/**
 * Number & currency formatting utilities.
 */

/**
 * Format a number as a compact USD currency string.
 * e.g., 1_500_000 → "$1.50M"
 */
export function formatCurrency(value: number | null | undefined): string {
  if (value == null) return "—";

  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(2)}B`;
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(2)}K`;
  }
  return `$${value.toFixed(2)}`;
}

/**
 * Format a number with locale-aware thousand separators.
 */
export function formatNumber(value: number | null | undefined): string {
  if (value == null) return "—";
  return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

/**
 * Format a percentage with a + or – sign and color class.
 */
export function formatPercentage(value: number | null | undefined): {
  text: string;
  isPositive: boolean;
} {
  if (value == null) return { text: "—", isPositive: true };
  const isPositive = value >= 0;
  return {
    text: `${isPositive ? "+" : ""}${value.toFixed(2)}%`,
    isPositive,
  };
}
