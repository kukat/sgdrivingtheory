import { Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { View } from 'react-native';

import { HandbookReader } from '@/components/handbook-reader';
import { AppText } from '@/components/ui/app-text';
import { getHandbookProgress, progressPercent, type HandbookProgress } from '@/lib/handbook-progress';
import { isTestId, TESTS } from '@/lib/tests';
import { useSkin } from '@/theme/skin-provider';

function getParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default function HandbookScreen() {
  const { skin } = useSkin();
  const params = useLocalSearchParams<{ testId?: string }>();
  const testId = getParam(params.testId);
  const [progress, setProgress] = useState<HandbookProgress | null>(() =>
    isTestId(testId) ? getHandbookProgress(testId) : null
  );

  const onProgress = useCallback((next: HandbookProgress | null) => {
    setProgress(next);
  }, []);

  if (!isTestId(testId)) {
    return (
      <>
        <Stack.Screen options={{ title: 'Handbook' }} />
        <AppText variant="body" style={{ padding: 22 }}>
          Unknown test.
        </AppText>
      </>
    );
  }

  const test = TESTS[testId];
  const percent = progressPercent(progress);
  const pageLabel =
    progress && progress.pageCount > 0
      ? `${progress.pageIndex + 1} / ${progress.pageCount}`
      : '';

  return (
    <View style={{ flex: 1, backgroundColor: skin.colors.background }}>
      <Stack.Screen
        options={{
          title: test.shortTitle,
          headerLargeTitle: false,
          headerBackTitle: test.shortTitle,
          presentation: 'card',
          gestureEnabled: true,
          fullScreenGestureEnabled: false,
          headerRight: () =>
            progress ? (
              <AppText
                variant="caption"
                style={{
                  color: skin.colors.accent,
                  fontWeight: '700',
                  fontVariant: ['tabular-nums'],
                }}>
                {percent}%
              </AppText>
            ) : null,
        }}
      />
      {pageLabel ? (
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderBottomWidth: 0.33,
            borderBottomColor: skin.colors.separator,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <AppText variant="caption" style={{ fontVariant: ['tabular-nums'] }}>
            {pageLabel}
          </AppText>
          <AppText variant="caption">{percent}% read</AppText>
        </View>
      ) : null}
      <View
        style={{
          height: 3,
          backgroundColor: skin.colors.progressTrack,
        }}>
        <View
          style={{
            width: `${percent}%`,
            height: '100%',
            backgroundColor: skin.colors.accent,
          }}
        />
      </View>
      <HandbookReader testId={testId} url={test.handbookUrl} onProgress={onProgress} />
    </View>
  );
}
