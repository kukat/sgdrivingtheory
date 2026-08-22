import { type Href, router, Stack, useLocalSearchParams } from 'expo-router';
import { Pressable } from 'react-native';

import { SectionsView } from '@/components/sections-view';
import { AppText } from '@/components/ui/app-text';
import { isTestId, TESTS } from '@/lib/tests';
import { useSkin } from '@/theme/skin-provider';

function getParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default function TestScreen() {
  const { skin } = useSkin();
  const params = useLocalSearchParams<{ testId?: string }>();
  const testId = getParam(params.testId);

  if (!isTestId(testId)) {
    return (
      <>
        <Stack.Screen options={{ title: 'Practice' }} />
        <AppText variant="body" style={{ padding: 22 }}>
          Unknown test.
        </AppText>
      </>
    );
  }

  const test = TESTS[testId];
  const handbookLabel = skin.id === 'night' ? 'PDF' : 'Handbook';

  return (
    <>
      <SectionsView testId={testId} />
      <Stack.Screen
        options={{
          title: test.shortTitle,
          headerLargeTitle: skin.id === 'system',
          headerBackTitle: 'Practice',
          headerRight: () => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open handbook"
              onPress={() =>
                router.push(`/handbook/${testId}` as Href)
              }
              hitSlop={8}>
              <AppText variant="body" style={{ color: skin.colors.accent, fontStyle: skin.id === 'handbook' ? 'italic' : 'normal' }}>
                {handbookLabel}
              </AppText>
            </Pressable>
          ),
        }}
      />
    </>
  );
}
