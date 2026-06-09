// MM-032 — AI Insight card on the invest/[symbol] screen.
// Shows AI-generated educational context. Hidden (returns null) when:
//   - query loading with no cached data
//   - resolver returns null (kill switch off, quota exceeded, validation failed)
//   - insight body is empty
// Never shows an error toast — silent absence per CLAUDE.md §9.

import { View, Text, Alert } from 'react-native';
import { useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react-native';
import { useAiInsightQuery } from '@/graphql/generated';
import { tokens } from '@/theme/tokens';

interface AIInsightCardProps {
  symbol: string;
}

export function AIInsightCard({ symbol }: AIInsightCardProps): React.JSX.Element | null {
  const { data, loading } = useAiInsightQuery({
    variables: { symbol },
    skip: symbol.length === 0,
    fetchPolicy: 'cache-first',
  });

  const insight = data?.aiInsight;
  const warnedRef = useRef(false);

  // MM-034 AC: alert user when they've exceeded the soft cap (>5 on-demand calls today).
  // Fire once per component mount; ref prevents re-alerting on background refetch.
  useEffect(() => {
    if (insight?.quotaWarning && !warnedRef.current) {
      warnedRef.current = true;
      Alert.alert(
        'AI insight limit running low',
        "You've used most of today's AI insight requests. You have 15 remaining.",
        [{ text: 'Got it' }],
      );
    }
  }, [insight?.quotaWarning]);

  // Don't mount the card until we have data — avoids layout shift.
  // Once we have data, never hide it (even during background refetch).
  if (loading && !insight) return null;
  if (!insight) return null;

  return (
    <View className="mx-4 mt-4 rounded-2xl bg-surface-elevated border border-border-subtle p-4 gap-3">
      {/* Header */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Sparkles size={14} color={tokens.accent} strokeWidth={1.75} />
          <Text className="text-accent text-xs font-semibold uppercase tracking-wide">
            AI Insight
          </Text>
        </View>
      </View>

      {/* Body */}
      <Text className="text-text-secondary text-sm leading-relaxed">
        {insight.body}
      </Text>

      {/* Compliance footer — CLAUDE.md §19 */}
      <Text className="text-text-tertiary text-xs">
        Educational context only. Not investment advice.
      </Text>
    </View>
  );
}
