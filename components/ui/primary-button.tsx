import { Pressable, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { useSkin } from '@/theme/skin-provider';

export function PrimaryButton({
  title,
  onPress,
  disabled,
  variant = 'solid',
  style,
}: {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  variant?: 'solid' | 'ghost';
  style?: StyleProp<ViewStyle>;
}) {
  const { skin } = useSkin();
  const solid = variant === 'solid';

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        {
          height: 50,
          borderRadius: skin.radius.button,
          borderCurve: 'continuous',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: solid ? skin.colors.button : 'transparent',
          borderWidth: solid ? 0 : 1,
          borderColor: skin.colors.ghostBorder,
          opacity: disabled ? 0.35 : pressed ? 0.75 : 1,
        },
        style,
      ]}>
      <AppText
        variant="headline"
        style={{
          color: solid ? skin.colors.onButton : skin.colors.label,
          fontWeight: skin.id === 'night' ? '800' : '600',
          letterSpacing: skin.id === 'night' ? 1.2 : 0,
          textTransform: skin.id === 'night' ? 'uppercase' : 'none',
        }}>
        {title}
      </AppText>
    </Pressable>
  );
}
