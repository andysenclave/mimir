// MM-017 — analytics hook.
// Manual events per CLAUDE.md §15: order_placed, notification_clicked,
// ai_insight_viewed, etc. Never log PII; pass slim, structured props.

import { useCallback } from 'react';

import { getPostHog } from './init';

export type AnalyticsEvent =
  | { name: 'order_placed'; props: { symbol: string; type: 'BUY' | 'SELL'; quantity: number } }
  | { name: 'first_trade'; props: { symbol: string; type: 'BUY' | 'SELL' } }
  | { name: 'notification_clicked'; props: { category: string; route: string } }
  | { name: 'ai_insight_viewed'; props: { symbol: string; cached: boolean } }
  | { name: 'screen_view'; props: { screen: string } }
  | { name: 'auth_signup_completed'; props: Record<string, never> }
  | { name: 'auth_login_completed'; props: Record<string, never> }
  | { name: 'onboarding_completed'; props: { tier: string } }
  | { name: 'soft_prompt_shown'; props: { symbol: string } }
  | { name: 'soft_prompt_accepted'; props: Record<string, never> }
  | { name: 'soft_prompt_declined'; props: Record<string, never> }
  | { name: 'native_permission_granted'; props: Record<string, never> }
  | { name: 'native_permission_denied'; props: Record<string, never> };

interface AnalyticsAPI {
  track: (event: AnalyticsEvent) => void;
}

export function useAnalytics(): AnalyticsAPI {
  const track = useCallback((event: AnalyticsEvent) => {
    const ph = getPostHog();
    if (ph === null) return;
    ph.capture(event.name, event.props);
  }, []);

  return { track };
}
