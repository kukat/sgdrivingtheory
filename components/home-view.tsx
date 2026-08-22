import { router } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSectionCounts } from '@/hooks/use-sections';
import { TEST_IDS, TESTS, type TestId } from '@/lib/tests';
import { useSkin } from '@/theme/skin-provider';

function countLabel(count: number | undefined) {
  if (count == null) {
    return 'Sections';
  }
  return `${count} section${count === 1 ? '' : 's'}`;
}

function padCount(count: number | undefined) {
  if (count == null) {
    return '—';
  }
  return String(count).padStart(2, '0');
}

export function HomeView() {
  const { skin } = useSkin();
  const counts = useSectionCounts();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: skin.colors.background }}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ paddingBottom: 40, gap: 12 }}
      showsVerticalScrollIndicator={false}>
      {skin.id !== 'system' ? (
        <View style={{ paddingHorizontal: 20, paddingTop: 8, gap: 4 }}>
          <AppText variant="kicker">{skin.id === 'night' ? 'Singapore' : 'Driving Bible'}</AppText>
          <AppText variant="display">Practice</AppText>
        </View>
      ) : (
        <AppText variant="kicker" style={{ paddingHorizontal: 32, paddingTop: 8 }}>
          Singapore theory tests
        </AppText>
      )}

      {skin.id === 'night' ? (
        <View
          style={{
            flexDirection: 'row',
            gap: 8,
            paddingHorizontal: 20,
            marginVertical: 4,
          }}>
          {Array.from({ length: 12 }).map((_, index) => (
            <View
              key={index}
              style={{
                width: 18,
                height: 7,
                borderRadius: 1,
                backgroundColor: skin.colors.accent,
                opacity: 0.7,
              }}
            />
          ))}
        </View>
      ) : null}

      {skin.id === 'system' ? (
        <View
          style={{
            marginHorizontal: 16,
            backgroundColor: skin.colors.card,
            borderRadius: skin.radius.card,
            borderCurve: 'continuous',
            overflow: 'hidden',
          }}>
          {TEST_IDS.map((id, index) => (
            <SystemRow
              key={id}
              testId={id}
              count={counts[id]}
              last={index === TEST_IDS.length - 1}
            />
          ))}
        </View>
      ) : null}

      {skin.id === 'handbook'
        ? TEST_IDS.map((id) => <HandbookTile key={id} testId={id} count={counts[id]} />)
        : null}

      {skin.id === 'night'
        ? TEST_IDS.map((id) => <NightPlate key={id} testId={id} count={counts[id]} />)
        : null}

      <AppText
        variant="caption"
        style={{ paddingHorizontal: 22, marginTop: 8, lineHeight: 18, width: '100%' }}>
        Not an official Singapore Police Force or Traffic Police app. Confirm you are studying the
        current handbook before sitting the test.
      </AppText>
    </ScrollView>
  );
}

function openTest(testId: TestId) {
  router.push({ pathname: '/test/[testId]', params: { testId } });
}

function SystemRow({
  testId,
  count,
  last,
}: {
  testId: TestId;
  count: number | undefined;
  last: boolean;
}) {
  const { skin } = useSkin();
  const test = TESTS[testId];
  const tint = skin.colors.testTint[testId];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={test.title}
      onPress={() => openTest(testId)}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        minHeight: 56,
        opacity: pressed ? 0.65 : 1,
        borderBottomWidth: last ? 0 : StyleHairline,
        borderBottomColor: skin.colors.separator,
      })}>
      <View
        style={{
          width: 30,
          height: 30,
          borderRadius: skin.radius.glyph,
          borderCurve: 'continuous',
          backgroundColor: tint,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <IconSymbol name={test.icon} size={16} color="#FFFFFF" />
      </View>
      <View style={{ flex: 1 }}>
        <AppText variant="body">{test.title}</AppText>
        <AppText variant="caption">{countLabel(count)}</AppText>
      </View>
      <IconSymbol name="chevron.right" size={16} color={skin.colors.secondary} />
    </Pressable>
  );
}

const StyleHairline = 0.33;

function HandbookTile({ testId, count }: { testId: TestId; count: number | undefined }) {
  const { skin } = useSkin();
  const test = TESTS[testId];
  const tint = skin.colors.testTint[testId];
  const index = TEST_IDS.indexOf(testId) + 1;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => openTest(testId)}
      style={({ pressed }) => ({
        marginHorizontal: 22,
        backgroundColor: skin.colors.card,
        borderRadius: skin.radius.card,
        overflow: 'hidden',
        paddingVertical: 18,
        paddingHorizontal: 18,
        paddingLeft: 22,
        opacity: pressed ? 0.8 : 1,
      })}>
      <View
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          backgroundColor: tint,
        }}
      />
      <AppText variant="caption" style={{ letterSpacing: 1.4, fontWeight: '700' }}>
        {String(index).padStart(2, '0')}  ·  {test.code}
      </AppText>
      <AppText variant="title" style={{ marginTop: 4 }}>
        {test.shortTitle}
      </AppText>
      <AppText variant="caption" style={{ marginTop: 4 }}>
        {test.subtitle}
      </AppText>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 14,
        }}>
        <AppText variant="caption" style={{ color: skin.colors.accent, fontWeight: '600' }}>
          {countLabel(count)}
        </AppText>
        <AppText variant="caption" style={{ color: skin.colors.accent, fontWeight: '600' }}>
          Open →
        </AppText>
      </View>
    </Pressable>
  );
}

function NightPlate({ testId, count }: { testId: TestId; count: number | undefined }) {
  const { skin } = useSkin();
  const test = TESTS[testId];
  const tint = skin.colors.testTint[testId];

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => openTest(testId)}
      style={({ pressed }) => ({
        marginHorizontal: 16,
        backgroundColor: skin.colors.card,
        borderRadius: skin.radius.card,
        borderLeftWidth: 6,
        borderLeftColor: tint,
        paddingVertical: 18,
        paddingHorizontal: 18,
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        opacity: pressed ? 0.8 : 1,
      })}>
      <View style={{ flex: 1, gap: 4 }}>
        <AppText variant="caption" style={{ letterSpacing: 3, fontWeight: '700' }}>
          {test.code}
        </AppText>
        <AppText variant="title">{test.title}</AppText>
      </View>
      <AppText
        variant="display"
        style={{ fontSize: 40, letterSpacing: -1, fontVariant: ['tabular-nums'] }}>
        {padCount(count)}
      </AppText>
    </Pressable>
  );
}
