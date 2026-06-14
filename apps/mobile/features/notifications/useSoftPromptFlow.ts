// MM-042 — soft-prompt permission flow.
// Called from useInvestScreen after a successful trade.
// Checks permission status + deferral before showing the native prompt.
// Deferral key: 'push_prompt_deferred_until' in SecureStore (ISO date string).

import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useCallback, useState } from 'react';

import { useAnalytics } from '@/lib/analytics/use-analytics';
import { useRegisterPushDevice } from '@/lib/notifications/use-register-push-device';

const DEFERRAL_KEY = 'push_prompt_deferred_until';
const DEFERRAL_DAYS = 30;

export interface UseSoftPromptFlowResult {
  visible: boolean;
  promptSymbol: string;
  onAccept: () => Promise<void>;
  onDefer: () => void;
  // Called after a successful trade; shows prompt or navigates immediately.
  triggerAfterTrade: (symbol: string, isFirstTrade: boolean) => Promise<void>;
}

export function useSoftPromptFlow(): UseSoftPromptFlowResult {
  const [visible, setVisible] = useState(false);
  const [promptSymbol, setPromptSymbol] = useState('');
  const { track } = useAnalytics();
  const { request: requestPushDevice } = useRegisterPushDevice();

  const checkEligible = useCallback(async (): Promise<boolean> => {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'undetermined') return false;

    const deferredUntil = await SecureStore.getItemAsync(DEFERRAL_KEY);
    if (deferredUntil !== null) {
      const deferDate = new Date(deferredUntil);
      if (new Date() < deferDate) return false;
    }

    return true;
  }, []);

  const triggerAfterTrade = useCallback(
    async (symbol: string, isFirstTrade: boolean): Promise<void> => {
      if (isFirstTrade) {
        track({ name: 'first_trade', props: { symbol, type: 'BUY' } });
      }

      const eligible = await checkEligible();
      if (!eligible) {
        router.replace('/(tabs)/portfolio');
        return;
      }

      setPromptSymbol(symbol);
      setVisible(true);
      track({ name: 'soft_prompt_shown', props: { symbol } });
    },
    [checkEligible, track],
  );

  const onAccept = useCallback(async (): Promise<void> => {
    track({ name: 'soft_prompt_accepted', props: {} });
    const result = await requestPushDevice();
    if (result === 'granted') {
      track({ name: 'native_permission_granted', props: {} });
    } else {
      track({ name: 'native_permission_denied', props: {} });
    }
    setVisible(false);
    router.replace('/(tabs)/portfolio');
  }, [requestPushDevice, track]);

  const onDefer = useCallback((): void => {
    track({ name: 'soft_prompt_declined', props: {} });
    const deferUntil = new Date();
    deferUntil.setDate(deferUntil.getDate() + DEFERRAL_DAYS);
    void SecureStore.setItemAsync(DEFERRAL_KEY, deferUntil.toISOString());
    setVisible(false);
    router.replace('/(tabs)/portfolio');
  }, [track]);

  return { visible, promptSymbol, onAccept, onDefer, triggerAfterTrade };
}
