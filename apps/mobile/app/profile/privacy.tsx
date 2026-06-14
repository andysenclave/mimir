// MM-058 — Privacy settings (DPDP Act 2023).
// Data residency note, data-export request, links to the legal documents, and a
// route to account deletion (the destructive flow lives on the Account screen).

import { useRouter } from 'expo-router';
import { ChevronRight, Download, FileText, MapPin } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, Text, View, Pressable } from 'react-native';

import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { SettingsHeader } from '@/features/profile/SettingsHeader';
import { useRequestDataExportMutation } from '@/graphql/generated';
import { tokens } from '@/theme/tokens';

export default function PrivacySettingsScreen(): React.JSX.Element {
  const router = useRouter();
  const [requestExport, { loading }] = useRequestDataExportMutation();
  const [requested, setRequested] = useState(false);

  async function onExport(): Promise<void> {
    await requestExport();
    setRequested(true);
  }

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <SettingsHeader title="Privacy" />

      <ScrollView contentContainerStyle={{ padding: 16, gap: 24 }}>
        {/* Data residency */}
        <View className="flex-row gap-3 rounded-xl border border-border-subtle bg-bg-secondary p-4">
          <MapPin size={18} color={tokens.text.tertiary} strokeWidth={1.75} />
          <View className="flex-1 gap-1">
            <Text className="text-sm font-semibold text-text-primary">Your data stays in India</Text>
            <Text className="text-xs leading-5 text-text-secondary">
              All your data is stored in the ap-south-1 (Mumbai) region, in line with the Digital
              Personal Data Protection Act, 2023.
            </Text>
          </View>
        </View>

        {/* Data export */}
        <View className="gap-2">
          <Text className="text-sm font-semibold text-text-primary">Export your data</Text>
          <Text className="text-xs leading-5 text-text-secondary">
            Request a copy of your profile, portfolio, and trade history. We&apos;ll prepare it and
            email you a download link.
          </Text>
          <View className="mt-1 flex-row items-center gap-2">
            <Button onPress={() => void onExport()} loading={loading} fullWidth={false} variant="secondary">
              <View className="flex-row items-center gap-2">
                <Download size={16} color={tokens.text.primary} strokeWidth={1.75} />
                <Text className="text-sm font-medium text-text-primary">
                  {requested ? 'Request received' : 'Request data export'}
                </Text>
              </View>
            </Button>
          </View>
          {requested && (
            <Text className="text-xs text-text-tertiary">
              We&apos;ll email your export link within a few days.
            </Text>
          )}
        </View>

        {/* Legal links */}
        <View className="gap-2">
          <Text className="text-sm font-semibold text-text-primary">Legal</Text>
          <View className="rounded-xl bg-surface-elevated overflow-hidden">
            <LegalRow label="Privacy Policy" onPress={() => router.push('/(legal)/privacy')} />
            <LegalRow label="Terms of Service" onPress={() => router.push('/(legal)/terms')} />
          </View>
        </View>

        {/* Account deletion entry point */}
        <View className="gap-2">
          <Text className="text-sm font-semibold text-text-primary">Delete account</Text>
          <Text className="text-xs leading-5 text-text-secondary">
            Manage account deletion from the Account screen. Your data is fully erased within 30 days.
          </Text>
          <View className="mt-1">
            <Button variant="secondary" onPress={() => router.push('/profile/account')} fullWidth={false}>
              Go to Account
            </Button>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function LegalRow({ label, onPress }: { label: string; onPress: () => void }): React.JSX.Element {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 px-4 py-4 border-b border-border-subtle active:bg-surface-hover"
    >
      <FileText color={tokens.text.secondary} size={18} strokeWidth={1.75} />
      <Text className="flex-1 text-sm font-medium text-text-primary">{label}</Text>
      <ChevronRight color={tokens.text.tertiary} size={16} strokeWidth={1.75} />
    </Pressable>
  );
}
