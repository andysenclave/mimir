// MM-036 — User identity card at the top of the Profile tab.
// Avatar is initials-based (no upload in Phase 1). Member since formatted as "Jun 2026".

import { View, Text } from 'react-native';

import type { ProfileData } from './hooks/useProfile';

import { StreakPill } from '@/components/ui/StreakPill';

interface ProfileUserCardProps {
  profile: ProfileData;
}

function getInitials(displayName?: string, email?: string): string {
  if (displayName && displayName.length > 0) {
    const parts = displayName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
    }
    return parts[0]!.slice(0, 2).toUpperCase();
  }
  return email ? email[0]!.toUpperCase() : '?';
}

function formatMemberSince(unixMs: number): string {
  return new Date(unixMs).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
}

export function ProfileUserCard({ profile }: ProfileUserCardProps): React.JSX.Element {
  const initials = getInitials(profile.displayName ?? undefined, profile.email);
  const name = profile.displayName ?? profile.email.split('@')[0] ?? profile.email;

  return (
    <View className="flex-row items-center gap-4 px-4 py-5">
      {/* Avatar */}
      <View className="h-16 w-16 items-center justify-center rounded-2xl bg-accent/20">
        <Text className="text-xl font-bold text-accent">{initials}</Text>
      </View>

      {/* Identity */}
      <View className="flex-1 gap-0.5">
        <Text className="text-lg font-bold text-text-primary" numberOfLines={1}>
          {name}
        </Text>
        <Text className="text-sm text-text-secondary" numberOfLines={1}>
          {profile.email}
        </Text>
        <Text className="text-xs text-text-tertiary">
          Member since {formatMemberSince(profile.memberSince)}
        </Text>
      </View>

      <StreakPill count={profile.streakCount} />
    </View>
  );
}
