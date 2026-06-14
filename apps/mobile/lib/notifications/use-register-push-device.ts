// MM-018 — request push permission, fetch the Expo push token, register
// with the backend. Called explicitly from the soft-prompt accept handler
// (MM-042) — never on app boot, never silently. Per CLAUDE.md §10.

import { gql, useMutation } from '@apollo/client';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { useCallback, useState } from 'react';
import { Platform } from 'react-native';

const REGISTER_PUSH_DEVICE = gql`
  mutation RegisterPushDevice($input: RegisterPushDeviceInput!) {
    registerPushDevice(input: $input) {
      id
      platform
      registeredAt
    }
  }
`;

interface UseRegisterPushDeviceResult {
  request: () => Promise<'granted' | 'denied' | 'undetermined'>;
  loading: boolean;
}

function platformLabel(): 'IOS' | 'ANDROID' | 'WEB' {
  switch (Platform.OS) {
    case 'ios':
      return 'IOS';
    case 'android':
      return 'ANDROID';
    default:
      return 'WEB';
  }
}

export function useRegisterPushDevice(): UseRegisterPushDeviceResult {
  const [mutate, { loading }] = useMutation(REGISTER_PUSH_DEVICE);
  const [, setStatus] = useState<'idle' | 'granted' | 'denied'>('idle');

  const request = useCallback(async (): Promise<'granted' | 'denied' | 'undetermined'> => {
    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;

    if (existing !== 'granted') {
      const { status: requested } = await Notifications.requestPermissionsAsync();
      finalStatus = requested;
    }

    if (finalStatus !== 'granted') {
      setStatus('denied');
      return 'denied';
    }

    const projectId =
      Constants.expoConfig?.extra?.['eas']?.projectId ??
      (Constants.easConfig as { projectId?: string } | undefined)?.projectId;

    const token = await Notifications.getExpoPushTokenAsync(
      projectId !== undefined ? { projectId } : undefined,
    );

    await mutate({
      variables: {
        input: {
          expoPushToken: token.data,
          platform: platformLabel(),
          appVersion: Constants.expoConfig?.version ?? null,
        },
      },
    });

    setStatus('granted');
    return 'granted';
  }, [mutate]);

  return { request, loading };
}
