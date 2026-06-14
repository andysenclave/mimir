// MM-041 — Notification preferences screen.
// Replaces the MM-036 placeholder with a real settings UI.
//
// Sections:
//   A. Per-category toggles (TRANSACTIONAL is read-only / always on)
//   B. Quiet hours (start + end time pickers in HH:MM)
//   C. Daily cap selector (1–3)
//   D. Send test notification button
//
// Auto-saves: changes call updateNotificationPreferences immediately (no Save button).
// Prompt 30 (mobile-screen-scaffold): < 150 lines of screen code — logic in hooks.

import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { ArrowLeft, Lock } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { View, Text, Pressable, Switch, ScrollView, Alert, TextInput } from 'react-native';

import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  useNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
} from '@/graphql/generated';
import { useThemeTokens } from '@/theme/use-theme-tokens';

export default function NotificationSettingsScreen(): React.JSX.Element {
  const router = useRouter();
  const tokens = useThemeTokens();

  const { data, loading } = useNotificationPreferencesQuery({
    fetchPolicy: 'cache-and-network',
  });

  const prefs = data?.notificationPreferences;

  const [updatePrefs] = useUpdateNotificationPreferencesMutation();

  // Local state mirrors server prefs for immediate UI responsiveness.
  const [streakEnabled, setStreakEnabled] = useState(true);
  const [budgetEnabled, setBudgetEnabled] = useState(true);
  const [priceAlertsEnabled, setPriceAlertsEnabled] = useState(true);
  const [portfolioEvtEnabled, setPortfolioEvtEnabled] = useState(true);
  const [educationalEnabled, setEducationalEnabled] = useState(true);
  const [quietHoursStart, setQuietHoursStart] = useState('22:00');
  const [quietHoursEnd, setQuietHoursEnd] = useState('07:00');
  const [dailyCap, setDailyCap] = useState(2);

  useEffect(() => {
    if (!prefs) return;
    setStreakEnabled(prefs.streakEnabled);
    setBudgetEnabled(prefs.budgetEnabled);
    setPriceAlertsEnabled(prefs.priceAlertsEnabled);
    setPortfolioEvtEnabled(prefs.portfolioEvtEnabled);
    setEducationalEnabled(prefs.educationalEnabled);
    setQuietHoursStart(prefs.quietHoursStart);
    setQuietHoursEnd(prefs.quietHoursEnd);
    setDailyCap(prefs.dailyCap);
  }, [prefs]);

  function save(input: Record<string, unknown>): void {
    void updatePrefs({ variables: { input } }).catch((err: unknown) => {
      if (__DEV__) console.warn('updateNotificationPreferences failed', err);
    });
  }

  function handleSendTest(): void {
    void Notifications.scheduleNotificationAsync({
      content: {
        title: 'Test notification',
        body: 'Your Mimir notifications are working correctly.',
        data: { type: 'transactional', route: '/(tabs)/portfolio' },
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 1 },
    }).then(() => {
      Alert.alert('Sent', 'Test notification will appear shortly.');
    });
  }

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      {/* Header */}
      <View className="flex-row items-center gap-3 px-4 py-4 border-b border-border-subtle">
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <ArrowLeft color={tokens.text.primary} size={22} strokeWidth={1.75} />
        </Pressable>
        <Text className="text-lg font-bold text-text-primary">Notifications</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {loading && !prefs ? (
          <View className="px-4 pt-4 gap-3">
            <Skeleton className="w-40 h-3 rounded" />
            <View className="bg-surface-elevated rounded-2xl overflow-hidden">
              {[0, 1, 2, 3].map((i) => (
                <View
                  key={i}
                  className="flex-row items-center justify-between px-4 py-4 border-b border-border-subtle"
                >
                  <Skeleton className="w-32 h-4 rounded" />
                  <Skeleton className="w-10 h-6 rounded-full" />
                </View>
              ))}
            </View>
          </View>
        ) : (
          <>
            {/* ── Category toggles ────────────────────────────────────────── */}
            <SectionHeader title="Notification types" />
            <View className="mx-4 bg-surface-elevated rounded-2xl overflow-hidden">
              <CategoryRow
                label="Streak reminder"
                description="Daily nudge if you haven't opened the app"
                value={streakEnabled}
                onChange={(v) => {
                  setStreakEnabled(v);
                  save({ streakEnabled: v });
                }}
              />
              <CategoryRow
                label="Budget alerts"
                description="When your monthly budget is running low"
                value={budgetEnabled}
                onChange={(v) => {
                  setBudgetEnabled(v);
                  save({ budgetEnabled: v });
                }}
              />
              <CategoryRow
                label="Price alerts"
                description="When a watchlisted stock moves ±3%"
                value={priceAlertsEnabled}
                onChange={(v) => {
                  setPriceAlertsEnabled(v);
                  save({ priceAlertsEnabled: v });
                }}
              />
              <CategoryRow
                label="Portfolio events"
                description="When your portfolio moves ±5% in a day"
                value={portfolioEvtEnabled}
                onChange={(v) => {
                  setPortfolioEvtEnabled(v);
                  save({ portfolioEvtEnabled: v });
                }}
              />
              <CategoryRow
                label="Learning"
                description="Course milestones and quiz results"
                value={educationalEnabled}
                onChange={(v) => {
                  setEducationalEnabled(v);
                  save({ educationalEnabled: v });
                }}
              />
              {/* TRANSACTIONAL — always on, read-only */}
              <View className="flex-row items-start justify-between px-4 py-3.5 opacity-50">
                <View className="flex-1 mr-4">
                  <View className="flex-row items-center gap-1.5 mb-0.5">
                    <Text className="text-sm font-medium text-text-primary">Order fills</Text>
                    <Lock size={11} color={tokens.text.tertiary} strokeWidth={2} />
                  </View>
                  <Text className="text-xs text-text-tertiary">
                    Confirmed when a trade executes — can't be disabled
                  </Text>
                </View>
                <Switch value={true} disabled />
              </View>
            </View>

            {/* ── Quiet hours ─────────────────────────────────────────────── */}
            <SectionHeader title="Quiet hours (IST)" />
            <View className="mx-4 bg-surface-elevated rounded-2xl overflow-hidden">
              <TimeInputRow
                label="Start"
                value={quietHoursStart}
                onChange={(v) => {
                  setQuietHoursStart(v);
                }}
                onBlur={(v) => save({ quietHoursStart: v })}
              />
              <TimeInputRow
                label="End"
                value={quietHoursEnd}
                onChange={(v) => {
                  setQuietHoursEnd(v);
                }}
                onBlur={(v) => save({ quietHoursEnd: v })}
              />
              <View className="px-4 py-2.5">
                <Text className="text-xs text-text-tertiary">
                  No non-transactional pushes between these times. Order fill notifications always
                  deliver.
                </Text>
              </View>
            </View>

            {/* ── Daily cap ───────────────────────────────────────────────── */}
            <SectionHeader title="Daily limit" />
            <View className="mx-4 bg-surface-elevated rounded-2xl overflow-hidden px-4 py-3.5">
              <Text className="text-sm text-text-secondary mb-2">Max notifications per day</Text>
              <View className="flex-row gap-3">
                {([1, 2, 3] as const).map((n) => (
                  <Pressable
                    key={n}
                    onPress={() => {
                      setDailyCap(n);
                      save({ dailyCap: n });
                    }}
                    className={`flex-1 py-2 rounded-xl items-center ${dailyCap === n ? 'bg-accent' : 'bg-bg-tertiary'}`}
                  >
                    <Text
                      className={`text-sm font-semibold ${dailyCap === n ? 'text-white' : 'text-text-secondary'}`}
                    >
                      {n}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* ── Test notification ───────────────────────────────────────── */}
            <View className="mx-4 mt-6">
              <Pressable
                onPress={handleSendTest}
                className="bg-surface-elevated border border-border-subtle rounded-2xl py-3.5 items-center"
              >
                <Text className="text-sm font-medium text-text-primary">
                  Send test notification
                </Text>
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }): React.JSX.Element {
  return (
    <Text className="text-xs font-medium uppercase tracking-wide text-text-tertiary px-4 pt-5 pb-2">
      {title}
    </Text>
  );
}

interface CategoryRowProps {
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
}

function CategoryRow({ label, description, value, onChange }: CategoryRowProps): React.JSX.Element {
  return (
    <View className="flex-row items-center justify-between px-4 py-3.5 border-b border-border-subtle">
      <View className="flex-1 mr-4">
        <Text className="text-sm font-medium text-text-primary mb-0.5">{label}</Text>
        <Text className="text-xs text-text-tertiary">{description}</Text>
      </View>
      <Switch value={value} onValueChange={onChange} />
    </View>
  );
}

interface TimeInputRowProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur: (v: string) => void;
}

function TimeInputRow({ label, value, onChange, onBlur }: TimeInputRowProps): React.JSX.Element {
  return (
    <View className="flex-row items-center justify-between px-4 py-3.5 border-b border-border-subtle">
      <Text className="text-sm text-text-secondary">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        onBlur={() => onBlur(value)}
        placeholder="HH:MM"
        keyboardType="numbers-and-punctuation"
        maxLength={5}
        className="text-text-primary text-sm font-mono w-16 text-right"
      />
    </View>
  );
}
