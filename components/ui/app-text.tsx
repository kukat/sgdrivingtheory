import { Text, type TextProps, type TextStyle } from 'react-native';

import { useSkin } from '@/theme/skin-provider';
import type { ResolvedSkin } from '@/theme/skins';

type Variant = keyof ResolvedSkin['type'];

export function AppText({
  variant = 'body',
  style,
  ...props
}: TextProps & { variant?: Variant }) {
  const { skin } = useSkin();
  return <Text style={[skin.type[variant] as TextStyle, style]} {...props} />;
}
