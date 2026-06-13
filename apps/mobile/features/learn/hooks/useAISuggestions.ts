// MM-052 — data hook for AI learning suggestions on the Learn tab.
// Errors degrade to an empty list — the section hides silently (spec: never an error toast).

import { router } from 'expo-router';
import { useCallback } from 'react';

import { useAiSuggestionsQuery } from '@/graphql/generated';
import { useAnalytics } from '@/lib/analytics/use-analytics';

export interface AISuggestionItem {
  id: string;
  title: string;
  body: string;
  ctaLink: string;
}

interface UseAISuggestionsResult {
  suggestions: AISuggestionItem[];
  loading: boolean;
  onSuggestionPress: (ctaLink: string) => void;
}

export function useAISuggestions(): UseAISuggestionsResult {
  const { data, loading, error } = useAiSuggestionsQuery({
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  });
  const { track } = useAnalytics();

  const onSuggestionPress = useCallback(
    (ctaLink: string) => {
      track({ name: 'ai_suggestion_tapped', props: { ctaLink } });

      const [kind, id] = ctaLink.split(':');
      if (kind === 'course' && id !== undefined && id.length > 0) {
        router.push(`/course/${id}`);
      }
      // "concept:<id>" — concept sheet isn't built yet; tap is a silent no-op
      // beyond the analytics event (per MM-052 AC).
    },
    [track],
  );

  return {
    suggestions: error !== undefined ? [] : (data?.aiSuggestions ?? []),
    loading,
    onSuggestionPress,
  };
}
