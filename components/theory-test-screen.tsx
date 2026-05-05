import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, View } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { findFormId, getFormFields, type FormField } from '@/lib/form-gov';

type TheoryTestSection = {
  id: string;
  title: string;
  formId?: string;
};

type TheoryTestScreenProps = {
  endpoint: string;
  handbookUrl: string;
  title: string;
  subtitle: string;
  headerBackgroundColor: { light: string; dark: string };
  theme: {
    accent: string;
    screenBackground: { light: string; dark: string };
    heroBackground: { light: string; dark: string };
    progressTrack: { light: string; dark: string };
    optionBackground: { light: string; dark: string };
    optionBorder: { light: string; dark: string };
    cardBackground: { light: string; dark: string };
    cardBorder: { light: string; dark: string };
  };
  iconName: React.ComponentProps<typeof IconSymbol>['name'];
  iconColor: string;
};

function toTheoryTestSections(fields: FormField[]): TheoryTestSection[] {
  return fields
    .filter((field) => typeof field.title === 'string' && field.title.trim().length > 0)
    .map((field, index) => ({
      id: field._id ?? `${field.title}-${index}`,
      title: field.title?.trim() ?? `Section ${index + 1}`,
      formId: findFormId(field),
    }));
}

export function TheoryTestScreen({
  endpoint,
  handbookUrl,
  title,
  subtitle,
  headerBackgroundColor,
  theme,
  iconName,
  iconColor,
}: TheoryTestScreenProps) {
  const [sections, setSections] = useState<TheoryTestSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  async function openHandbook() {
    try {
      await openBrowserAsync(handbookUrl, {
        presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
      });
    } catch {
      await Linking.openURL(handbookUrl);
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function loadSections() {
      try {
        setIsLoading(true);
        const response = await fetch(endpoint);

        if (!response.ok) {
          throw new Error(`Form request failed with status ${response.status}`);
        }

        const payload: unknown = await response.json();
        const nextSections = toTheoryTestSections(getFormFields(payload));

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

    loadSections();

    return () => {
      isMounted = false;
    };
  }, [endpoint]);

  return (
    <ParallaxScrollView
      headerBackgroundColor={headerBackgroundColor}
      showsVerticalScrollIndicator={false}
      headerImage={
        <IconSymbol size={300} color={iconColor} name={iconName} style={styles.headerImage} />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText
          type="title"
          style={{
            fontFamily: Fonts.rounded,
          }}>
          {title}
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.handbookSection}>
        <ThemedText type="subtitle">Handbook</ThemedText>
        <ThemedText>Read the official handbook before practising the questions.</ThemedText>
        <Pressable
          onPress={openHandbook}
          style={({ pressed }) => [
            styles.handbookButton,
            { backgroundColor: theme.accent },
            pressed ? styles.cardPressed : null,
          ]}>
          <ThemedText lightColor="#FFFFFF" darkColor="#FFFFFF" style={styles.handbookButtonText}>
            Open handbook
          </ThemedText>
        </Pressable>
      </ThemedView>

      <ThemedView style={styles.quizHeader}>
        <ThemedText type="subtitle">Quiz</ThemedText>
        <ThemedText>{subtitle}</ThemedText>
      </ThemedView>

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
        <View style={styles.list}>
          {sections.map((section) => (
            <Pressable
              key={section.id}
              disabled={!section.formId}
              onPress={() => {
                if (section.formId) {
                  router.push({
                    pathname: '/quiz/[formId]',
                    params: {
                      formId: section.formId,
                      title: section.title,
                      accent: theme.accent,
                      screenLight: theme.screenBackground.light,
                      screenDark: theme.screenBackground.dark,
                      heroLight: theme.heroBackground.light,
                      heroDark: theme.heroBackground.dark,
                      progressTrackLight: theme.progressTrack.light,
                      progressTrackDark: theme.progressTrack.dark,
                      optionLight: theme.optionBackground.light,
                      optionDark: theme.optionBackground.dark,
                      optionBorderLight: theme.optionBorder.light,
                      optionBorderDark: theme.optionBorder.dark,
                    },
                  });
                }
              }}
              style={({ pressed }) => [
                styles.card,
                section.formId
                  ? {
                      backgroundColor: isDark
                        ? theme.cardBackground.dark
                        : theme.cardBackground.light,
                      borderColor: isDark ? theme.cardBorder.dark : theme.cardBorder.light,
                    }
                  : isDark
                    ? styles.cardDisabledDark
                    : styles.cardDisabled,
                pressed ? styles.cardPressed : null,
              ]}>
              <View style={styles.cardContent}>
                <ThemedText type="subtitle" style={styles.cardTitle}>
                  {section.title}
                </ThemedText>
                <ThemedText style={[styles.cardMetaText, { color: theme.accent }]}>
                  {section.formId ? 'Start' : 'Unavailable'}
                </ThemedText>
              </View>
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
  handbookSection: {
    borderRadius: 18,
    gap: 8,
    paddingVertical: 4,
  },
  handbookButton: {
    alignItems: 'center',
    borderRadius: 999,
    marginTop: 4,
    paddingVertical: 14,
  },
  handbookButtonText: {
    fontSize: 15,
    fontWeight: '800',
  },
  quizHeader: {
    gap: 4,
  },
  list: {
    gap: 12,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    width: '100%',
  },
  cardContent: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-between',
  },
  cardTitle: {
    flex: 1,
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
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
});
