import { Directory, File, Paths } from 'expo-file-system';

import type { TestId } from '@/lib/tests';

function fileName(testId: TestId, url: string) {
  const stamp = url.replace(/[^a-zA-Z0-9]/g, '').slice(-24);
  return `${testId}-${stamp}.pdf`;
}

export async function getLocalHandbookUri(testId: TestId, url: string): Promise<string> {
  const dir = new Directory(Paths.cache, 'handbooks');
  if (!dir.exists) {
    dir.create();
  }

  const dest = new File(dir, fileName(testId, url));
  if (dest.exists) {
    return dest.uri;
  }

  const downloaded = await File.downloadFileAsync(url, dest, {
    idempotent: true,
    headers: {
      'User-Agent': 'DrivingBible/1.0',
    },
  });
  return downloaded.uri;
}
