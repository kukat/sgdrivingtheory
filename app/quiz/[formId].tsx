import { Stack, useLocalSearchParams } from 'expo-router';

import { QuizView } from '@/components/quiz-view';
import { AppText } from '@/components/ui/app-text';

function getParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default function QuizScreen() {
  const params = useLocalSearchParams<{ formId?: string; title?: string }>();
  const formId = getParam(params.formId);
  const title = getParam(params.title) ?? 'Practice quiz';

  if (!formId) {
    return (
      <>
        <Stack.Screen options={{ title: 'Quiz' }} />
        <AppText variant="body" style={{ padding: 22 }}>
          Missing form ID.
        </AppText>
      </>
    );
  }

  return <QuizView formId={formId} title={title} />;
}
