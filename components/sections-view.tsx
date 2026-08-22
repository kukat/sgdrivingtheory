import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, TextInput, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSections } from '@/hooks/use-sections';
import { TESTS, type TestId, type TheoryTestSection } from '@/lib/tests';
import { useSkin } from '@/theme/skin-provider';

export function SectionsView({ testId }: { testId: TestId }) {
  const { skin } = useSkin();
  const test = TESTS[testId];
  const { sections, isLoading, error } = useSections(testId);
  const [query, setQuery] = useState('');

  const visible = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      return sections;
    }
    return sections.filter((section) => section.title.toLowerCase().includes(trimmed));
  }, [query, sections]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: skin.colors.background }}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}>
      {skin.id !== 'system' ? (
        <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12, gap: 4 }}>
          <AppText variant="kicker">
            {skin.id === 'night' ? `${test.code}  ·  ${sections.length || ''} sections` : test.title}
          </AppText>
          <AppText variant="display" style={skin.id === 'night' ? { fontSize: 36 } : undefined}>
            {skin.id === 'handbook' ? 'Chapters' : 'Sections'}
          </AppText>
        </View>
      ) : null}

      <View
        style={{
          marginHorizontal: 16,
          marginBottom: 14,
          height: 36,
          borderRadius: skin.id === 'night' ? 4 : 10,
          backgroundColor: skin.id === 'handbook' ? 'rgba(80,60,30,0.08)' : skin.colors.surface,
          borderWidth: skin.id === 'system' ? 0 : 0,
          paddingHorizontal: 12,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        }}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={skin.id === 'handbook' ? 'Find a topic' : 'Search'}
          placeholderTextColor={skin.colors.secondary}
          autoCorrect={false}
          autoCapitalize="none"
          style={{
            flex: 1,
            color: skin.colors.label,
            fontSize: 17,
            paddingVertical: 0,
          }}
        />
      </View>

      {isLoading ? (
        <View style={{ padding: 24, alignItems: 'center', gap: 10 }}>
          <ActivityIndicator color={skin.colors.accent} />
          <AppText variant="caption">Loading sections…</AppText>
        </View>
      ) : null}

      {error ? (
        <View style={{ paddingHorizontal: 22, gap: 6 }}>
          <AppText variant="headline">Unable to load sections</AppText>
          <AppText variant="caption" selectable>
            {error}
          </AppText>
        </View>
      ) : null}

      {!isLoading && !error && visible.length === 0 ? (
        <AppText variant="caption" style={{ paddingHorizontal: 22 }}>
          No sections match.
        </AppText>
      ) : null}

      {skin.id === 'system' && visible.length > 0 ? (
        <View
          style={{
            marginHorizontal: 16,
            backgroundColor: skin.colors.card,
            borderRadius: skin.radius.card,
            borderCurve: 'continuous',
            overflow: 'hidden',
          }}>
          {visible.map((section, index) => (
            <SectionRow
              key={section.id}
              testId={testId}
              section={section}
              index={index}
              last={index === visible.length - 1}
            />
          ))}
        </View>
      ) : null}

      {skin.id !== 'system'
        ? visible.map((section, index) => (
            <SectionRow
              key={section.id}
              testId={testId}
              section={section}
              index={index}
              last={index === visible.length - 1}
            />
          ))
        : null}
    </ScrollView>
  );
}

function SectionRow({
  testId,
  section,
  index,
  last,
}: {
  testId: TestId;
  section: TheoryTestSection;
  index: number;
  last: boolean;
}) {
  const { skin } = useSkin();
  const number = String(index + 1).padStart(2, '0');
  const disabled = !section.formId;

  function open() {
    if (!section.formId) {
      return;
    }
    router.push({
      pathname: '/quiz/[formId]',
      params: { formId: section.formId, title: section.title, testId },
    });
  }

  if (skin.id === 'handbook') {
    return (
      <Pressable
        accessibilityRole="button"
        disabled={disabled}
        onPress={open}
        style={({ pressed }) => ({
          marginHorizontal: 20,
          paddingVertical: 14,
          flexDirection: 'row',
          alignItems: 'baseline',
          gap: 14,
          borderBottomWidth: last ? 0 : 1,
          borderBottomColor: skin.colors.separator,
          opacity: disabled ? 0.45 : pressed ? 0.65 : 1,
        })}>
        <AppText
          variant="body"
          style={{
            width: 28,
            fontStyle: 'italic',
            color: skin.colors.accent,
            fontVariant: ['tabular-nums'],
          }}>
          {number}
        </AppText>
        <AppText variant="headline" style={{ flex: 1 }}>
          {section.title}
        </AppText>
      </Pressable>
    );
  }

  if (skin.id === 'night') {
    return (
      <Pressable
        accessibilityRole="button"
        disabled={disabled}
        onPress={open}
        style={({ pressed }) => ({
          marginHorizontal: 16,
          paddingVertical: 15,
          paddingHorizontal: 8,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
          borderBottomWidth: 1,
          borderBottomColor: skin.colors.separator,
          opacity: disabled ? 0.45 : pressed ? 0.65 : 1,
        })}>
        <View
          style={{
            width: 36,
            height: 28,
            borderRadius: 2,
            backgroundColor: skin.colors.accent,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <AppText
            variant="caption"
            style={{ color: '#111', fontWeight: '800', fontVariant: ['tabular-nums'] }}>
            {number}
          </AppText>
        </View>
        <AppText variant="headline" style={{ flex: 1 }}>
          {section.title}
        </AppText>
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={open}
      style={({ pressed }) => ({
        minHeight: 52,
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        opacity: disabled ? 0.45 : pressed ? 0.65 : 1,
        borderBottomWidth: last ? 0 : 0.33,
        borderBottomColor: skin.colors.separator,
      })}>
      <AppText variant="body" style={{ flex: 1 }}>
        {section.title}
      </AppText>
      <AppText variant="caption" style={{ color: skin.colors.accent, fontWeight: '700' }}>
        {section.formId ? '' : 'Unavailable'}
      </AppText>
      {section.formId ? (
        <IconSymbol name="chevron.right" size={16} color={skin.colors.secondary} />
      ) : null}
    </Pressable>
  );
}
