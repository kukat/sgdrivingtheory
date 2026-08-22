import Constants from 'expo-constants';
import { type Href, router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSkin } from '@/theme/skin-provider';
import { SKIN_IDS, SKIN_META, type SkinId } from '@/theme/skins';

const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';

export function SettingsView() {
  const { skin, skinId, setSkinId } = useSkin();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: skin.colors.background }}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ paddingBottom: 48 }}
      showsVerticalScrollIndicator={false}>
      {skin.id !== 'system' ? (
        <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12, gap: 4 }}>
          <AppText variant="kicker">Driving Bible</AppText>
          <AppText variant="display">Settings</AppText>
        </View>
      ) : null}

      <SectionLabel>Appearance</SectionLabel>
      <Group>
        {SKIN_IDS.map((id, index) => (
          <SkinChoice
            key={id}
            id={id}
            selected={id === skinId}
            onPress={() => setSkinId(id)}
            last={index === SKIN_IDS.length - 1}
          />
        ))}
      </Group>
      <AppText
        variant="caption"
        style={{
          paddingHorizontal: 32,
          paddingTop: 8,
          paddingBottom: 8,
          lineHeight: 18,
          width: '100%',
        }}>
        Skins apply to every screen. System follows the phone light and dark mode.
      </AppText>

      <SectionLabel>Legal</SectionLabel>
      <Group>
        <LinkRow
          label="Privacy policy"
          onPress={() => router.push('/settings/privacy' as Href)}
          last={false}
        />
        <LinkRow label="Licenses" onPress={() => router.push('/settings/licenses' as Href)} last />
      </Group>

      <SectionLabel>About</SectionLabel>
      <Group>
        <InfoRow label="Version" value={APP_VERSION} last />
      </Group>
      <AppText
        variant="caption"
        style={{
          paddingHorizontal: 32,
          paddingTop: 8,
          lineHeight: 18,
          width: '100%',
        }}>
        Not an official Singapore Police Force or Traffic Police app. Confirm you are studying the
        current handbook before sitting the test.
      </AppText>
    </ScrollView>
  );
}

function SectionLabel({ children }: { children: string }) {
  const { skin } = useSkin();
  return (
    <AppText
      variant="kicker"
      style={{
        paddingHorizontal: skin.id === 'system' ? 32 : 22,
        paddingTop: 22,
        paddingBottom: 8,
      }}>
      {children}
    </AppText>
  );
}

function Group({ children }: { children: ReactNode }) {
  const { skin } = useSkin();
  return (
    <View
      style={{
        marginHorizontal: 16,
        backgroundColor: skin.colors.card,
        borderRadius: skin.radius.card,
        borderCurve: 'continuous',
        overflow: 'hidden',
      }}>
      {children}
    </View>
  );
}

function SkinChoice({
  id,
  selected,
  onPress,
  last,
}: {
  id: SkinId;
  selected: boolean;
  onPress: () => void;
  last: boolean;
}) {
  const { skin } = useSkin();
  const meta = SKIN_META[id];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        paddingHorizontal: 16,
        paddingVertical: 14,
        minHeight: 64,
        opacity: pressed ? 0.7 : 1,
        borderBottomWidth: last ? 0 : 0.33,
        borderBottomColor: skin.colors.separator,
      })}>
      <View style={{ flexDirection: 'row', gap: 4 }}>
        {meta.preview.map((color) => (
          <View
            key={color}
            style={{
              width: 12,
              height: 28,
              borderRadius: 3,
              backgroundColor: color,
            }}
          />
        ))}
      </View>
      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        <AppText variant="headline">{meta.name}</AppText>
        <AppText variant="caption">{meta.blurb}</AppText>
      </View>
      {selected ? (
        <AppText variant="headline" style={{ color: skin.colors.accent }}>
          ✓
        </AppText>
      ) : (
        <View style={{ width: 18 }} />
      )}
    </Pressable>
  );
}

function LinkRow({
  label,
  value,
  onPress,
  last,
}: {
  label: string;
  value?: string;
  onPress: () => void;
  last: boolean;
}) {
  const { skin } = useSkin();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 48,
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        opacity: pressed ? 0.65 : 1,
        borderBottomWidth: last ? 0 : 0.33,
        borderBottomColor: skin.colors.separator,
      })}>
      <AppText variant="body" style={{ flex: 1 }}>
        {label}
      </AppText>
      {value ? (
        <AppText variant="caption" numberOfLines={1} style={{ flexShrink: 1, maxWidth: 180 }}>
          {value}
        </AppText>
      ) : null}
      <IconSymbol name="chevron.right" size={16} color={skin.colors.secondary} />
    </Pressable>
  );
}

function InfoRow({ label, value, last }: { label: string; value: string; last: boolean }) {
  const { skin } = useSkin();
  return (
    <View
      style={{
        minHeight: 48,
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderBottomWidth: last ? 0 : 0.33,
        borderBottomColor: skin.colors.separator,
      }}>
      <AppText variant="body" style={{ flex: 1 }}>
        {label}
      </AppText>
      <AppText variant="caption" style={{ fontVariant: ['tabular-nums'] }}>
        {value}
      </AppText>
    </View>
  );
}
