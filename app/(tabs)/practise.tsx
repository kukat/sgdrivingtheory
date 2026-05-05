import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import { findFormId, getFormFields, type FormField } from '@/lib/form-gov';
import { useColorScheme } from '@/hooks/use-color-scheme';

const FORM_ENDPOINT = 'https://form.gov.sg/api/v3/forms/67317e882e2ffcb14032e4a2';

type PractiseSection = {
  id: string;
  title: string;
  formId?: string;
};

function toPractiseSections(fields: FormField[]): PractiseSection[] {
  return fields
    .filter((field) => typeof field.title === 'string' && field.title.trim().length > 0)
    .map((field, index) => ({
      id: field._id ?? `${field.title}-${index}`,
      title: field.title?.trim() ?? `Section ${index + 1}`,
      formId: findFormId(field),
    }));
}

export default function PractiseScreen() {
  const [sections, setSections] = useState<PractiseSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    let isMounted = true;

    async function loadPractiseSections() {
      try {
        const response = await fetch(FORM_ENDPOINT);

        if (!response.ok) {
          throw new Error(`Form request failed with status ${response.status}`);
        }

        const payload: unknown = await response.json();
        const nextSections = toPractiseSections(getFormFields(payload));

        if (isMounted) {
          setSections(nextSections);
          setError(null);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load sections.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadPractiseSections();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#F7D9A8', dark: '#3D2B13' }}
      showsVerticalScrollIndicator={false}
      headerImage={
        <IconSymbol
          size={300}
          color="#D69B2D"
          name="graduationcap.fill"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText
          type="title"
          style={{
            fontFamily: Fonts.rounded,
          }}>
          Practise
        </ThemedText>
      </ThemedView>
      <ThemedText>Choose a section to start a Basic Theory Test practice quiz.</ThemedText>

      {isLoading ? (
        <ThemedView style={styles.statusContainer}>
          <ActivityIndicator />
          <ThemedText>Loading sections...</ThemedText>
        </ThemedView>
      ) : null}

      {error ? (
        <ThemedView style={styles.statusContainer}>
          <ThemedText type="subtitle">Unable to load sections</ThemedText>
          <ThemedText>{error}</ThemedText>
        </ThemedView>
      ) : null}

      {!isLoading && !error && sections.length === 0 ? (
        <ThemedView style={styles.statusContainer}>
          <ThemedText type="subtitle">No sections found</ThemedText>
          <ThemedText>The form did not return any usable form_fields titles.</ThemedText>
        </ThemedView>
      ) : null}

      {!isLoading && !error && sections.length > 0 ? (
        <View style={styles.grid}>
          {sections.map((section) => (
            <Pressable
              key={section.id}
              disabled={!section.formId}
              onPress={() => {
                if (section.formId) {
                  router.push({
                    pathname: '/quiz/[formId]',
                    params: { formId: section.formId, title: section.title },
                  });
                }
              }}
              style={({ pressed }) => [
                styles.card,
                section.formId
                  ? isDark
                    ? styles.cardEnabledDark
                    : styles.cardEnabled
                  : isDark
                    ? styles.cardDisabledDark
                    : styles.cardDisabled,
                pressed ? styles.cardPressed : null,
              ]}>
              <ThemedText type="subtitle">{section.title}</ThemedText>
              <ThemedText style={styles.cardMetaText}>
                {section.formId ? 'Start practice' : 'No quiz available'}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      ) : null}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    bottom: -70,
    right: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  statusContainer: {
    gap: 8,
    paddingVertical: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    minHeight: 132,
    padding: 16,
    width: '48%',
  },
  cardEnabled: {
    backgroundColor: '#FFF4DF',
    borderColor: '#E0A948',
  },
  cardEnabledDark: {
    backgroundColor: '#33230B',
    borderColor: '#B98222',
  },
  cardDisabled: {
    backgroundColor: '#F0F0F0',
    borderColor: '#D0D0D0',
    opacity: 0.65,
  },
  cardDisabledDark: {
    backgroundColor: '#242424',
    borderColor: '#505050',
    opacity: 0.65,
  },
  cardPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
  cardMetaText: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
});
