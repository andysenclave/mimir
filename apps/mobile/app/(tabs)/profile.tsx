// MM-036 — Profile tab screen (replaces MM-014 placeholder).
// Thin screen: wires useProfile hook to ProfileContent (prompt 20 / prompt 4).
// Sign-out confirmation is inline Alert; MM-059 replaces with bottom sheet in Sprint 4.

import { ProfileContent, ProfileSkeleton, useProfile } from '@/features/profile';
import { ErrorState } from '@/components/layout/ErrorState';

export default function ProfileTab(): React.JSX.Element {
  const { profile, loading, error, refreshing, onRefresh } = useProfile();

  if (loading && !profile) return <ProfileSkeleton />;
  if (error && !profile) return <ErrorState onRetry={() => void onRefresh()} />;

  if (!profile) return <ProfileSkeleton />;

  return (
    <ProfileContent
      profile={profile}
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  );
}
