// MM-036 — Profile tab screen (replaces MM-014 placeholder).
// Thin screen: wires useProfile hook to ProfileContent (prompt 20 / prompt 4).
// MM-059 — wrapped in SheetProvider so the sign-out confirmation bottom sheet works.

import { ErrorState } from '@/components/layout/ErrorState';
import { ProfileContent, ProfileSkeleton, useProfile } from '@/features/profile';
import { SheetProvider } from '@/features/sheets/SheetProvider';

export default function ProfileTab(): React.JSX.Element {
  const { profile, loading, error, refreshing, onRefresh } = useProfile();

  if (loading && !profile) return <ProfileSkeleton />;
  if (error && !profile) return <ErrorState onRetry={() => void onRefresh()} />;

  if (!profile) return <ProfileSkeleton />;

  return (
    <SheetProvider>
      <ProfileContent profile={profile} refreshing={refreshing} onRefresh={onRefresh} />
    </SheetProvider>
  );
}
