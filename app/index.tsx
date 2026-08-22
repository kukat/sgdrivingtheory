import { router, Stack } from 'expo-router';
import { Pressable } from 'react-native';

import { HomeView } from '@/components/home-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSkin } from '@/theme/skin-provider';

export default function HomeScreen() {
  const { skin } = useSkin();

  return (
    <>
      <HomeView />
      <Stack.Screen
        options={{
          title: 'Practice',
          headerLargeTitle: skin.id === 'system',
          headerTitle: skin.id === 'system' ? undefined : () => null,
          headerRight: () => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Settings"
              onPress={() => router.push('/settings')}
              hitSlop={12}
              style={{ paddingHorizontal: 4 }}>
              <IconSymbol name="gearshape" size={22} color={skin.colors.accent} />
            </Pressable>
          ),
        }}
      />
    </>
  );
}
