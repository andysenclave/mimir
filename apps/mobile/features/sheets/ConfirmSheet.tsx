// MM-058 — generic destructive confirmation bottom sheet.
// Used for irreversible actions (e.g. account deletion). prompt 23 / @gorhom/bottom-sheet.

import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { AlertTriangle } from 'lucide-react-native';
import { useCallback, useRef, useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { useThemeTokens } from '@/theme/use-theme-tokens';

interface ConfirmSheetProps {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
}

export function ConfirmSheet({
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}: ConfirmSheetProps): React.JSX.Element {
  const tokens = useThemeTokens();
  const sheetRef = useRef<BottomSheet>(null);
  const [busy, setBusy] = useState(false);

  const handleConfirm = useCallback(async () => {
    setBusy(true);
    try {
      await onConfirm();
    } finally {
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
            <AlertTriangle size={26} color={tokens.loss} strokeWidth={1.75} />
          </View>
          <Text className="text-text-primary font-sans font-semibold text-lg text-center">
            {title}
          </Text>
          <Text className="text-text-secondary font-sans text-sm text-center leading-5">
            {message}
          </Text>
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Button variant="secondary" onPress={onCancel} disabled={busy}>
              Cancel
            </Button>
          </View>
          <View className="flex-1">
            <Button variant="loss" onPress={() => void handleConfirm()} loading={busy}>
              {confirmLabel}
            </Button>
          </View>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}
