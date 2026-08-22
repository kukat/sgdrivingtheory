import { Stack } from 'expo-router';

import { SettingsView } from '@/components/settings-view';
import { useSkin } from '@/theme/skin-provider';

export default function SettingsScreen() {
  const { skin } = useSkin();

  return (
    <>
      <SettingsView />
      <Stack.Screen
        options={{
          title: 'Settings',
          headerShown: true,
          headerLargeTitle: skin.id === 'system',
          headerBackVisible: true,
        }}
      />
    </>
  );
}
