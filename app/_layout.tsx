import { ThemeProvider, DarkTheme, DefaultTheme } from 'expo-router/react-navigation';
import { Stack } from 'expo-router/stack';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { SkinProvider, useSkin } from '@/theme/skin-provider';

export default function RootLayout() {
  return (
    <SkinProvider>
      <Navigation />
    </SkinProvider>
  );
}

function Navigation() {
  const { skin } = useSkin();

  return (
    <ThemeProvider value={skin.scheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerBackVisible: true,
          headerBackButtonDisplayMode: 'minimal',
          headerShadowVisible: false,
          headerLargeTitleShadowVisible: false,
          headerStyle: { backgroundColor: skin.colors.background },
          headerTintColor: skin.colors.accent,
          headerTitleStyle: { color: skin.colors.label },
          headerLargeStyle: { backgroundColor: skin.colors.background },
          contentStyle: { backgroundColor: skin.colors.background },
        }}
      />
      <StatusBar style={skin.scheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}
