// MM-059 — sign-out confirmation bottom sheet.
// Replaces the native Alert (prompt 23 / @gorhom/bottom-sheet).
// On confirm: caller's onConfirm clears tokens + routes to login; sheet then closes.

import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { LogOut } from 'lucide-react-native';
import { useCallback, useRef, useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { tokens } from '@/theme/tokens';

interface SignOutSheetProps {
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
}

export function SignOutSheet({ onConfirm, onCancel }: SignOutSheetProps): React.JSX.Element {
  const sheetRef = useRef<BottomSheet>(null);
  const [signingOut, setSigningOut] = useState(false);

  const handleConfirm = useCallback(async () => {
    setSigningOut(true);
    try {
      await onConfirm();
    } finally {
      // Tokens are cleared; the auth-aware redirect takes over. Closing here is
      // belt-and-braces in case the route stays mounted briefly.
      sheetRef.current?.close();
    }
  }, [onConfirm]);

  return (
    <BottomSheet
      ref={sheetRef}
      index={0}
      enableDynamicSizing
      onClose={onCancel}
      handleIndicatorStyle={{ backgroundColor: tokens.border.strong }}
      backgroundStyle={{ backgroundColor: tokens.bg.secondary }}
    >
      <BottomSheetView style={{ paddingHorizontal: 16, paddingBottom: 40, paddingTop: 8, gap: 16 }}>
        <View className="items-center gap-3 pt-2">
          <View className="h-14 w-14 items-center justify-center rounded-full bg-bg-tertiary">
            <LogOut size={26} color={tokens.loss} strokeWidth={1.75} />
          </View>
          <Text className="text-text-primary font-sans font-semibold text-lg text-center">
            Sign out?
          </Text>
          <Text className="text-text-secondary font-sans text-sm text-center leading-5">
            You&apos;ll need to sign in again to access your portfolio.
          </Text>
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Button variant="secondary" onPress={onCancel} disabled={signingOut}>
              Cancel
            </Button>
          </View>
          <View className="flex-1">
            <Button variant="loss" onPress={() => void handleConfirm()} loading={signingOut}>
              Sign Out
            </Button>
          </View>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}
