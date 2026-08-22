import { Stack } from 'expo-router';

import { LegalDocView } from '@/components/legal-doc-view';
import { LICENSE_BODY } from '@/lib/legal';

export default function LicensesScreen() {
  return (
    <>
      <LegalDocView body={LICENSE_BODY} />
      <Stack.Screen
        options={{
          title: 'Licenses',
          headerShown: true,
          headerLargeTitle: false,
          headerBackVisible: true,
        }}
      />
    </>
  );
}
