import { ScrollView } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { useSkin } from '@/theme/skin-provider';

export function LegalDocView({ body }: { body: string }) {
  const { skin } = useSkin();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: skin.colors.background }}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 48 }}
      showsVerticalScrollIndicator={false}>
      <AppText
        variant="body"
        selectable
        style={{
          fontSize: 16,
          lineHeight: 24,
          color: skin.colors.label,
        }}>
        {body}
      </AppText>
    </ScrollView>
  );
}
