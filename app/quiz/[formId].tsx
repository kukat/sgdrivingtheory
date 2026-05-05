import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';
import { getFormFields, getQuizQuestions, type QuizQuestion } from '@/lib/form-gov';
import { useColorScheme } from '@/hooks/use-color-scheme';

type AnswerState = {
  selectedAnswer?: string;
  isCorrect?: boolean;
};

function getParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeAnswer(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

function isCorrectAnswer(selectedAnswer: string, answer: string) {
  return normalizeAnswer(selectedAnswer) === normalizeAnswer(answer);
}

function getThemeParam(value: string | string[] | undefined, fallback: string) {
  return getParam(value) ?? fallback;
}

export default function QuizScreen() {
  const params = useLocalSearchParams<{
    formId?: string;
    title?: string;
    accent?: string;
    screenLight?: string;
    screenDark?: string;
    heroLight?: string;
    heroDark?: string;
    progressTrackLight?: string;
    progressTrackDark?: string;
    optionLight?: string;
    optionDark?: string;
    optionBorderLight?: string;
    optionBorderDark?: string;
  }>();
  const formId = getParam(params.formId);
  const title = getParam(params.title) ?? 'Practice Quiz';
  const theme = {
    accent: getThemeParam(params.accent, '#D67B00'),
    screen: {
      light: getThemeParam(params.screenLight, '#F4E8D1'),
      dark: getThemeParam(params.screenDark, '#0F0D09'),
    },
    hero: {
      light: getThemeParam(params.heroLight, '#FFF9ED'),
      dark: getThemeParam(params.heroDark, '#17130C'),
    },
    progressTrack: {
      light: getThemeParam(params.progressTrackLight, '#E8D6B9'),
      dark: getThemeParam(params.progressTrackDark, '#4A3720'),
    },
    option: {
      light: getThemeParam(params.optionLight, '#FFFBF4'),
      dark: getThemeParam(params.optionDark, '#2A251D'),
    },
    optionBorder: {
      light: getThemeParam(params.optionBorderLight, '#E8D6B9'),
      dark: getThemeParam(params.optionBorderDark, '#504536'),
    },
  };
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const { width } = useWindowDimensions();
  const isWide = width >= 720;

  const currentQuestion = questions[currentIndex];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;
  const score = useMemo(
    () => Object.values(answers).filter((answer) => answer.isCorrect).length,
    [answers]
  );
  const isComplete = questions.length > 0 && currentIndex >= questions.length;

  useEffect(() => {
    let isMounted = true;

    async function loadQuiz() {
      if (!formId) {
        setError('Missing form ID.');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`https://form.gov.sg/api/v3/forms/${formId}`);

        if (!response.ok) {
          throw new Error(`Quiz request failed with status ${response.status}`);
        }

        const payload: unknown = await response.json();
        const nextQuestions = getQuizQuestions(getFormFields(payload));

        if (isMounted) {
          setQuestions(nextQuestions);
          setCurrentIndex(0);
          setAnswers({});
          setError(null);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load quiz.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadQuiz();

    return () => {
      isMounted = false;
    };
  }, [formId]);

  function selectAnswer(question: QuizQuestion, selectedAnswer: string) {
    if (answers[question.id]?.selectedAnswer) {
      return;
    }

    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [question.id]: {
        selectedAnswer,
        isCorrect: isCorrectAnswer(selectedAnswer, question.answer),
      },
    }));

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }

  function goNext() {
    setCurrentIndex((index) => Math.min(index + 1, questions.length));
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
  }

  function restartQuiz() {
    setAnswers({});
    setCurrentIndex(0);
  }

  return (
    <>
      <Stack.Screen
        options={{
          title,
          headerBackButtonDisplayMode: 'minimal',
          headerBackTitle: '',
        }}
      />
      <View
        style={[
          styles.screen,
          { backgroundColor: isDark ? theme.screen.dark : theme.screen.light },
        ]}>
        <ThemedView
          lightColor={theme.hero.light}
          darkColor={theme.hero.dark}
          style={[styles.hero, isWide ? styles.heroWide : null]}>
          <View style={styles.eyebrowRow}>
            <ThemedText style={[styles.eyebrow, { color: theme.accent }]}>Theory Practice</ThemedText>
            {questions.length > 0 ? (
              <ThemedText style={styles.counter}>
                {Math.min(currentIndex + 1, questions.length)} / {questions.length}
              </ThemedText>
            ) : null}
          </View>
          <ThemedText type="title" style={styles.title}>
            {title}
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            One question at a time. Pick an answer, review the feedback, then move on.
          </ThemedText>
          {questions.length > 0 ? (
            <View
              style={[
                styles.progressTrack,
                { backgroundColor: isDark ? theme.progressTrack.dark : theme.progressTrack.light },
              ]}>
              <View
                style={[
                  styles.progressFill,
                  { backgroundColor: theme.accent },
                  { width: `${(Math.min(currentIndex + 1, questions.length) / questions.length) * 100}%` },
                ]}
              />
            </View>
          ) : null}
        </ThemedView>

        <ScrollView
          ref={scrollViewRef}
          style={styles.questionScroll}
          contentContainerStyle={styles.content}>
          {isLoading ? (
            <ThemedView style={styles.statusCard}>
              <ActivityIndicator />
              <ThemedText>Loading questions...</ThemedText>
            </ThemedView>
          ) : null}

          {error ? (
            <ThemedView style={styles.statusCard}>
              <ThemedText type="subtitle">Unable to load quiz</ThemedText>
              <ThemedText>{error}</ThemedText>
            </ThemedView>
          ) : null}

          {!isLoading && !error && questions.length === 0 ? (
            <ThemedView style={styles.statusCard}>
              <ThemedText type="subtitle">No questions found</ThemedText>
              <ThemedText>
                This form did not return radio-button questions with statement answers.
              </ThemedText>
            </ThemedView>
          ) : null}

          {!isLoading && !error && isComplete ? (
            <ThemedView lightColor="#F0FFF6" darkColor="#0D1F15" style={styles.resultCard}>
              <ThemedText type="title" style={styles.resultTitle}>
                Quiz complete
              </ThemedText>
              <ThemedText style={styles.resultScore}>
                Score: {score} / {questions.length}
              </ThemedText>
              <Pressable
                onPress={restartQuiz}
                style={({ pressed }) => [
                  styles.primaryButton,
                  { backgroundColor: theme.accent },
                  pressed ? styles.buttonPressed : null,
                ]}>
                <ThemedText
                  lightColor="#FFFFFF"
                  darkColor="#FFFFFF"
                  style={styles.primaryButtonText}>
                  Practise again
                </ThemedText>
              </Pressable>
            </ThemedView>
          ) : null}

          {!isLoading && !error && currentQuestion && !isComplete ? (
            <ThemedView
              lightColor="#FFFFFF"
              darkColor="#201C16"
              style={[styles.questionCard, isWide ? styles.questionCardWide : null]}>
              <ThemedText style={[styles.questionNumber, { color: theme.accent }]}>
                Question {currentIndex + 1}
              </ThemedText>
              <ThemedText type="subtitle" style={styles.questionText}>
                {currentQuestion.question}
              </ThemedText>

              <View style={styles.options}>
                {currentQuestion.options.map((option) => {
                  const hasAnswered = Boolean(currentAnswer?.selectedAnswer);
                  const isSelected = currentAnswer?.selectedAnswer === option;
                  const isCorrectOption = isCorrectAnswer(option, currentQuestion.answer);

                  return (
                    <Pressable
                      key={option}
                      disabled={hasAnswered}
                      onPress={() => selectAnswer(currentQuestion, option)}
                      style={({ pressed }) => [
                        styles.option,
                        {
                          backgroundColor: isDark ? theme.option.dark : theme.option.light,
                          borderColor: isDark
                            ? theme.optionBorder.dark
                            : theme.optionBorder.light,
                        },
                        hasAnswered && isCorrectOption ? styles.optionCorrect : null,
                        hasAnswered && isSelected && !isCorrectOption ? styles.optionWrong : null,
                        pressed ? styles.optionPressed : null,
                      ]}>
                      <ThemedText
                        style={[
                          styles.optionText,
                          hasAnswered && (isCorrectOption || (isSelected && !isCorrectOption))
                            ? styles.optionFeedbackText
                            : null,
                        ]}>
                        {option}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>

              {currentAnswer ? (
                <ThemedView
                  lightColor={currentAnswer.isCorrect ? '#E8FFF0' : '#FFECEC'}
                  darkColor={currentAnswer.isCorrect ? '#102A19' : '#2B1111'}
                  style={[
                    styles.feedback,
                    currentAnswer.isCorrect ? styles.feedbackCorrect : styles.feedbackWrong,
                  ]}>
                  <ThemedText type="subtitle">
                    {currentAnswer.isCorrect ? 'Correct' : 'Not quite'}
                  </ThemedText>
                  <ThemedText>Answer: {currentQuestion.answer}</ThemedText>
                </ThemedView>
              ) : null}

              <Pressable
                disabled={!currentAnswer}
                onPress={goNext}
                style={({ pressed }) => [
                  styles.primaryButton,
                  { backgroundColor: theme.accent },
                  !currentAnswer ? styles.primaryButtonDisabled : null,
                  pressed ? styles.buttonPressed : null,
                ]}>
                <ThemedText
                  lightColor="#FFFFFF"
                  darkColor="#FFFFFF"
                  style={styles.primaryButtonText}>
                  {currentIndex === questions.length - 1 ? 'Finish' : 'Next'}
                </ThemedText>
              </Pressable>
            </ThemedView>
          ) : null}
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    gap: 18,
    padding: 20,
    paddingBottom: 40,
  },
  questionScroll: {
    flex: 1,
  },
  hero: {
    gap: 10,
    overflow: 'hidden',
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  heroWide: {
    alignSelf: 'center',
    width: 680,
  },
  eyebrowRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  counter: {
    fontWeight: '700',
  },
  title: {
    fontFamily: Fonts.rounded,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  statusCard: {
    borderRadius: 24,
    gap: 10,
    padding: 20,
  },
  questionCard: {
    borderRadius: 28,
    gap: 18,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
  },
  questionCardWide: {
    alignSelf: 'center',
    width: 680,
  },
  progressTrack: {
    backgroundColor: '#E8D6B9',
    borderRadius: 999,
    height: 8,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: 999,
    height: '100%',
  },
  questionNumber: {
    fontWeight: '700',
  },
  questionText: {
    fontSize: 23,
    lineHeight: 30,
  },
  options: {
    gap: 12,
  },
  option: {
    borderRadius: 18,
    borderWidth: 2,
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  optionCorrect: {
    backgroundColor: '#159947',
    borderColor: '#159947',
  },
  optionWrong: {
    backgroundColor: '#D83B3B',
    borderColor: '#D83B3B',
  },
  optionPressed: {
    transform: [{ scale: 0.99 }],
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  optionFeedbackText: {
    color: '#FFFFFF',
  },
  feedback: {
    borderRadius: 18,
    borderWidth: 1,
    gap: 6,
    padding: 14,
  },
  feedbackCorrect: {
    borderColor: '#159947',
  },
  feedbackWrong: {
    borderColor: '#D83B3B',
  },
  primaryButton: {
    alignItems: 'center',
    borderRadius: 999,
    paddingVertical: 16,
  },
  primaryButtonDisabled: {
    opacity: 0.45,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '800',
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.99 }],
  },
  resultCard: {
    alignItems: 'center',
    borderRadius: 28,
    gap: 16,
    padding: 24,
  },
  resultTitle: {
    textAlign: 'center',
  },
  resultScore: {
    fontSize: 20,
    fontWeight: '800',
  },
});
