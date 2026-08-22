import { useEffect, useState } from 'react';

import { loadSections, type TestId, type TheoryTestSection } from '@/lib/tests';

export function useSections(testId: TestId) {
  const [sections, setSections] = useState<TheoryTestSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        setIsLoading(true);
        const next = await loadSections(testId);
        if (isMounted) {
          setSections(next);
          setError(null);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load sections.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, [testId]);

  return { sections, isLoading, error };
}

export function useSectionCounts() {
  const [counts, setCounts] = useState<Partial<Record<TestId, number>>>({});

  useEffect(() => {
    let isMounted = true;
    const ids: TestId[] = ['btt', 'ftt', 'rtt'];

    ids.forEach(async (id) => {
      try {
        const sections = await loadSections(id);
        if (isMounted) {
          setCounts((current) => ({ ...current, [id]: sections.length }));
        }
      } catch {
        if (isMounted) {
          setCounts((current) => ({ ...current, [id]: undefined }));
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return counts;
}
