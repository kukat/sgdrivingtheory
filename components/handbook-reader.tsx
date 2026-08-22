import { PdfView } from '@kishannareshpal/expo-pdf';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { getLocalHandbookUri } from '@/lib/handbook-file';
import {
  getHandbookProgress,
  setHandbookProgress,
  type HandbookProgress,
} from '@/lib/handbook-progress';
import type { TestId } from '@/lib/tests';
import { useSkin } from '@/theme/skin-provider';

export function HandbookReader({
  testId,
  url,
  onProgress,
}: {
  testId: TestId;
  url: string;
  onProgress: (progress: HandbookProgress | null) => void;
}) {
  const { skin } = useSkin();
  const [uri, setUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const ignoreFirstZero = useRef((getHandbookProgress(testId)?.pageIndex ?? 0) > 0);

  useEffect(() => {
    let cancelled = false;
    onProgress(getHandbookProgress(testId));

    getLocalHandbookUri(testId, url)
      .then((localUri) => {
        if (!cancelled) {
          setUri(localUri);
        }
      })
      .catch((loadError: unknown) => {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to download handbook.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [onProgress, testId, url]);

  if (error) {
    return (
      <View style={{ flex: 1, padding: 22, gap: 8, backgroundColor: skin.colors.background }}>
        <AppText variant="headline">Unable to open handbook</AppText>
        <AppText variant="caption" selectable>
          {error}
        </AppText>
      </View>
    );
  }

  if (!uri) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          backgroundColor: skin.colors.background,
        }}>
        <ActivityIndicator color={skin.colors.accent} />
        <AppText variant="caption">Downloading handbook…</AppText>
      </View>
    );
  }

  return (
    <PdfView
      style={{ flex: 1, backgroundColor: '#F2F2F7' }}
      uri={uri}
      fitMode="width"
      pageGap={12}
      pageColorInverted={false}
      onPageChanged={({ pageIndex, pageCount }) => {
        if (ignoreFirstZero.current && pageIndex === 0) {
          ignoreFirstZero.current = false;
          return;
        }
        ignoreFirstZero.current = false;
        const next = { pageIndex, pageCount };
        setHandbookProgress(testId, next);
        onProgress(next);
      }}
      onLoadComplete={({ pageCount }) => {
        const saved = getHandbookProgress(testId);
        onProgress(
          saved ?? {
            pageIndex: 0,
            pageCount,
          }
        );
      }}
      onError={(event) => {
        setError(event.message);
      }}
    />
  );
}
