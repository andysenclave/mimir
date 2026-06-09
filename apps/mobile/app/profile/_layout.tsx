// Profile sub-screens stack layout (MM-036).
// Each screen slides in from the right (default Stack behaviour).

import { Stack } from 'expo-router';

export default function ProfileStackLayout(): React.JSX.Element {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    />
  );
}
