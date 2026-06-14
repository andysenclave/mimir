// MM-025 — Performance vs benchmarks card.
// Fetches its own data (self-contained leaf component per prompt 16).
// Hides gracefully on error — never shows an error state (AC: "hidden gracefully").
// All % values in font-mono per CLAUDE.md §14.

import clsx from 'clsx';
import { Text, View } from 'react-native';

import { Skeleton } from '@/components/ui/Skeleton';
import { usePortfolioPerformanceQuery } from '@/graphql/generated';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatChangePct(pct: number | null | undefined): string {
  if (pct === null || pct === undefined) return '—';
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct.toFixed(2)}%`;
}

function pctColor(pct: number | null | undefined): string {
  if (pct === null || pct === undefined) return 'text-text-tertiary';
  if (pct > 0) return 'text-gain';
  if (pct < 0) return 'text-loss';
  return 'text-text-secondary';
}

// ─── Row ──────────────────────────────────────────────────────────────────────

interface BenchmarkRowProps {
  label: string;
  pct: number | null | undefined;
  isPortfolio?: boolean;
}

function BenchmarkRow({ label, pct, isPortfolio = false }: BenchmarkRowProps): React.JSX.Element {
  return (
    <View className="flex-row items-center justify-between py-2">
      <Text
        className={clsx(
          'font-sans text-sm',
          isPortfolio ? 'font-semibold text-text-primary' : 'text-text-secondary',
        )}
      >
        {label}
      </Text>
      <Text className={clsx('font-mono text-sm font-medium', pctColor(pct))}>
        {formatChangePct(pct)}
      </Text>
    </View>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function CardSkeleton(): React.JSX.Element {
  return (
    <View className="mx-4 rounded-xl bg-bg-secondary px-4 py-4">
      <Skeleton width={120} height={13} className="mb-4" />
      <View className="gap-3">
        <View className="flex-row justify-between">
          <Skeleton width={80} height={13} />
          <Skeleton width={48} height={13} />
        </View>
        <View className="h-px bg-border-subtle" />
        <View className="flex-row justify-between">
          <Skeleton width={60} height={13} />
          <Skeleton width={48} height={13} />
        </View>
        <View className="flex-row justify-between">
          <Skeleton width={60} height={13} />
          <Skeleton width={48} height={13} />
        </View>
      </View>
      <Skeleton width={200} height={12} className="mt-4" />
    </View>
  );
}

// ─── Public ───────────────────────────────────────────────────────────────────

export function PerformanceBenchmarkCard(): React.JSX.Element | null {
  const { data, loading } = usePortfolioPerformanceQuery({
    fetchPolicy: 'cache-and-network',
    // Silently hide on error — error prop intentionally ignored (AC: hidden gracefully).
    errorPolicy: 'ignore',
  });

  if (loading && data === undefined) return <CardSkeleton />;

  // Hide gracefully on error or missing data (network failure, etc.)
  const perf = data?.portfolioPerformance;
  if (!perf) return null;

  return (
    <View className="mx-4 rounded-xl bg-bg-secondary px-4 py-4">
      <Text className="mb-1 font-sans text-xs font-semibold uppercase tracking-wide text-text-tertiary">
        Today vs Benchmarks
      </Text>

      <View className="mt-2">
        {/* Portfolio row — only shown when user has holdings */}
        {perf.hasHoldings && (
          <>
            <BenchmarkRow label="Your Portfolio" pct={perf.portfolioChangePct} isPortfolio />
            <View className="h-px bg-border-subtle" />
          </>
        )}

        <BenchmarkRow label="NIFTY 50" pct={perf.niftyChangePct} />
        {perf.sp500ChangePct !== null && <BenchmarkRow label="S&P 500" pct={perf.sp500ChangePct} />}
      </View>

      {/* Template-based copy — never LLM-generated (CLAUDE.md §9) */}
      <Text className="mt-3 font-sans text-xs text-text-tertiary">{perf.copy}</Text>
    </View>
  );
}
