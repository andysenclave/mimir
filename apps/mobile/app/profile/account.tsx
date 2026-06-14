// MM-058 — Account settings.
// Display name is editable; email is read-only (managed by the auth provider —
// Heimdal email-change flow lands with the SDK swap). Delete Account soft-deletes
// (DPDP §19) and signs out.

import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SettingsHeader } from '@/features/profile/SettingsHeader';
import { SheetProvider, useSheet } from '@/features/sheets/SheetProvider';
import {
  useProfileQuery,
  useRequestAccountDeletionMutation,
  useUpdateDisplayNameMutation,
} from '@/graphql/generated';
import { useAuth } from '@/lib/auth/AuthProvider';

function AccountSettings(): React.JSX.Element {
  const { signOut } = useAuth();
  const { openSheet } = useSheet();
  const { data } = useProfileQuery();

  const profile = data?.profile;
  const [name, setName] = useState<string>('');
  const [initialised, setInitialised] = useState(false);
  const [saved, setSaved] = useState(false);

  // Seed the field once the profile arrives.
  if (!initialised && profile !== undefined) {
    setName(profile.displayName ?? '');
    setInitialised(true);
  }

  const [updateDisplayName, { loading: saving }] = useUpdateDisplayNameMutation();
  const [requestDeletion] = useRequestAccountDeletionMutation();

  const trimmed = name.trim();
  const dirty = profile !== undefined && trimmed.length > 0 && trimmed !== (profile.displayName ?? '');

  async function onSave(): Promise<void> {
    if (!dirty) return;
    await updateDisplayName({ variables: { name: trimmed } });
    setSaved(true);
  }

  function onDelete(): void {
    openSheet({
      type: 'confirm',
      title: 'Delete account?',
      message:
        "Your profile, portfolio, and history will be erased within 30 days. This can't be undone.",
      confirmLabel: 'Delete',
      onConfirm: async () => {
        await requestDeletion();
        await signOut();
      },
    });
  }

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <SettingsHeader title="Account" />

      <ScrollView contentContainerStyle={{ padding: 16, gap: 20 }}>
        <View className="gap-3">
          <Input
            label="Display name"
            value={name}
            onChangeText={(t) => {
              setName(t);
              setSaved(false);
            }}
            placeholder="Your name"
            maxLength={40}
            autoCapitalize="words"
          />
          <Input label="Email" value={profile?.email ?? ''} editable={false} hint="Managed by your sign-in. Contact support to change it." />
          <Button onPress={() => void onSave()} disabled={!dirty} loading={saving}>
            {saved && !dirty ? 'Saved' : 'Save changes'}
          </Button>
        </View>

        <View className="h-px bg-border-subtle" />

        <View className="gap-2">
          <Text className="text-sm font-semibold text-text-primary">Delete account</Text>
          <Text className="text-xs leading-5 text-text-secondary">
            This removes your profile, portfolio, and history. Your data is fully erased within 30
            days, in line with the DPDP Act. This can&apos;t be undone.
          </Text>
          <View className="mt-1">
            <Button variant="loss" onPress={onDelete} fullWidth={false}>
              Delete my account
            </Button>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

export default function AccountSettingsScreen(): React.JSX.Element {
  return (
    <SheetProvider>
      <AccountSettings />
    </SheetProvider>
  );
}
