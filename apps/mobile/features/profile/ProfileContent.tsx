// MM-036 — Profile screen assembler (prompt 20: SRP, < 150 lines).

import { ScrollView, RefreshControl, View, Text } from 'react-native';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { ProfileUserCard } from './ProfileUserCard';
import { ProfileStatsRow } from './ProfileStatsRow';
import { ProfileWatchlistSection } from './ProfileWatchlistSection';
import { ProfileSettingsSection } from './ProfileSettingsSection';
import type { ProfileData } from './hooks/useProfile';

const APP_VERSION = process.env.EXPO_PUBLIC_APP_VERSION ?? '1.0.0';

interface ProfileContentProps {
  profile: ProfileData;
  refreshing: boolean;
  onRefresh: () => void;
}

export function ProfileContent({
  profile,
  refreshing,
  onRefresh,
}: ProfileContentProps): React.JSX.Element {
  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <ProfileUserCard profile={profile} />
        <ProfileStatsRow stats={profile.stats} />
        <ProfileWatchlistSection watchlist={profile.watchlist} />
        <ProfileSettingsSection />

        {/* Compliance footer — CLAUDE.md §19 */}
        <View className="mt-8 px-4 items-center gap-1">
          <Text className="text-xs text-text-tertiary text-center">
            Educational simulation. Not investment advice.
          </Text>
          <Text className="text-xs text-text-tertiary">v{APP_VERSION}</Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
