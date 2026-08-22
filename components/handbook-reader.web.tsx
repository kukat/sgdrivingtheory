import { useEffect } from 'react';
import { View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { getHandbookProgress, type HandbookProgress } from '@/lib/handbook-progress';
import { openUrl } from '@/lib/open-handbook';
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

  useEffect(() => {
    onProgress(getHandbookProgress(testId));
    openUrl(url);
  }, [onProgress, testId, url]);

  return (
    <View style={{ flex: 1, padding: 22, backgroundColor: skin.colors.background }}>
      <AppText variant="body">
        The native PDF reader is not available on web. Opening the handbook in the browser.
      </AppText>
    </View>
  );
}
