import { Stack } from 'expo-router';

import { LegalDocView } from '@/components/legal-doc-view';
import { PRIVACY_BODY } from '@/lib/legal';

export default function PrivacyScreen() {
  return (
    <>
      <LegalDocView body={PRIVACY_BODY} />
      <Stack.Screen
        options={{
          title: 'Privacy policy',
          headerShown: true,
          headerLargeTitle: false,
          headerBackVisible: true,
        }}
      />
    </>
  );
}
