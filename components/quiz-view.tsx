import * as Haptics from 'expo-haptics';
import { router, Stack } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/app-text';
import { PrimaryButton } from '@/components/ui/primary-button';
import {
  getFormFields,
  getOptionLetter,
  getQuizQuestions,
  isCorrectAnswer,
  type QuizQuestion,
} from '@/lib/form-gov';
import { useSkin } from '@/theme/skin-provider';

type AnswerState = {
  selectedAnswer?: string;
  isCorrect?: boolean;
};

export function QuizView({ formId, title }: { formId: string; title: string }) {
  const { skin } = useSkin();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentQuestion = questions[currentIndex];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;
  const score = useMemo(
    () => Object.values(answers).filter((answer) => answer.isCorrect).length,
    [answers]
  );
  const isComplete = questions.length > 0 && currentIndex >= questions.length;
  const progress =
    questions.length === 0 ? 0 : (Math.min(currentIndex + 1, questions.length) / questions.length) * 100;
  const counter =
    questions.length > 0
      ? `${Math.min(currentIndex + 1, questions.length)} / ${questions.length}`
      : '';

  useEffect(() => {
    let isMounted = true;

    async function load() {
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

    load();
    return () => {
      isMounted = false;
    };
  }, [formId]);

  function selectAnswer(question: QuizQuestion, selectedAnswer: string) {
    if (answers[question.id]?.selectedAnswer) {
      return;
    }

    const isCorrect = isCorrectAnswer(selectedAnswer, question.answer);
    if (process.env.EXPO_OS === 'ios') {
      Haptics.notificationAsync(
        isCorrect ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error
      );
    }

    setAnswers((current) => ({
      ...current,
      [question.id]: { selectedAnswer, isCorrect },
    }));

    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 80);
  }

  function goNext() {
    setCurrentIndex((index) => Math.min(index + 1, questions.length));
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }

  function restart() {
    setAnswers({});
    setCurrentIndex(0);
  }

  return (
    <View style={{ flex: 1, backgroundColor: skin.colors.background }}>
      <Stack.Screen
        options={{
          title,
          headerLargeTitle: false,
          headerBackButtonDisplayMode: 'minimal',
          headerRight: () =>
            counter ? (
              <AppText
                variant="headline"
                style={{
                  color: skin.colors.accent,
                  fontVariant: ['tabular-nums'],
                  fontWeight: '700',
                }}>
                {isComplete ? '' : counter}
              </AppText>
            ) : null,
        }}
      />

      <View style={{ height: 3, backgroundColor: skin.colors.progressTrack }}>
        <View
          style={{
            width: `${isComplete ? 100 : progress}%`,
            height: '100%',
            backgroundColor: skin.colors.accent,
          }}
        />
      </View>

      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={{ padding: 24, alignItems: 'center', gap: 10 }}>
            <ActivityIndicator color={skin.colors.accent} />
            <AppText variant="caption">Loading questions…</AppText>
          </View>
        ) : null}

        {error ? (
          <View style={{ padding: 22, gap: 8 }}>
            <AppText variant="headline">Unable to load quiz</AppText>
            <AppText variant="caption" selectable>
              {error}
            </AppText>
          </View>
        ) : null}

        {!isLoading && !error && questions.length === 0 ? (
          <View style={{ padding: 22, gap: 8 }}>
            <AppText variant="headline">No questions found</AppText>
            <AppText variant="caption">
              This form did not return radio-button questions with statement answers.
            </AppText>
          </View>
        ) : null}

        {!isLoading && !error && isComplete ? (
          <Results score={score} total={questions.length} onAgain={restart} />
        ) : null}

        {!isLoading && !error && currentQuestion && !isComplete ? (
          <QuestionBlock
            question={currentQuestion}
            index={currentIndex}
            answer={currentAnswer}
            onSelect={selectAnswer}
          />
        ) : null}
      </ScrollView>

      {!isLoading && !error && currentQuestion && !isComplete ? (
        <View
          style={{
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: Math.max(insets.bottom, 16),
            backgroundColor: skin.colors.background,
          }}>
          <PrimaryButton
            title={currentIndex === questions.length - 1 ? 'Finish' : nextLabel(skin.id)}
            disabled={!currentAnswer}
            onPress={goNext}
          />
        </View>
      ) : null}
    </View>
  );
}

function nextLabel(id: string) {
  if (id === 'handbook') {
    return 'Next question';
  }
  return 'Next';
}

function QuestionBlock({
  question,
  index,
  answer,
  onSelect,
}: {
  question: QuizQuestion;
  index: number;
  answer?: AnswerState;
  onSelect: (question: QuizQuestion, option: string) => void;
}) {
  const { skin } = useSkin();
  const letter = answer ? getOptionLetter(question.answer) ?? question.answer : null;

  return (
    <View>
      <View style={{ paddingHorizontal: 20, paddingTop: 18, paddingBottom: 12, gap: 10 }}>
        <AppText variant="kicker">
          {skin.id === 'night'
            ? `Q${String(index + 1).padStart(2, '0')}`
            : `Question ${String(index + 1).padStart(2, '0')}`}
        </AppText>
        <AppText
          variant="title"
          selectable
          style={{
            fontSize: skin.id === 'night' ? 26 : skin.id === 'handbook' ? 24 : 22,
            lineHeight: skin.id === 'system' ? 28 : 32,
            textTransform: 'none',
            letterSpacing: -0.4,
          }}>
          {question.question}
        </AppText>
      </View>

      <View
        style={
          skin.id === 'system'
            ? {
                marginHorizontal: 16,
                backgroundColor: skin.colors.card,
                borderRadius: skin.radius.card,
                borderCurve: 'continuous',
                overflow: 'hidden',
              }
            : skin.id === 'night'
              ? { paddingHorizontal: 16, gap: 8 }
              : { paddingHorizontal: 0 }
        }>
        {question.options.map((option) => (
          <OptionRow
            key={option}
            option={option}
            question={question}
            answer={answer}
            onSelect={onSelect}
          />
        ))}
      </View>

      {answer ? (
        <AppText variant="caption" style={{ paddingHorizontal: 22, paddingTop: 12 }}>
          {answer.isCorrect
            ? skin.id === 'handbook'
              ? 'Marked in the margin.'
              : 'Correct.'
            : `Not quite. The answer is ${letter}.`}
        </AppText>
      ) : null}
    </View>
  );
}

function OptionRow({
  option,
  question,
  answer,
  onSelect,
}: {
  option: string;
  question: QuizQuestion;
  answer?: AnswerState;
  onSelect: (question: QuizQuestion, option: string) => void;
}) {
  const { skin } = useSkin();
  const hasAnswered = Boolean(answer?.selectedAnswer);
  const isSelected = answer?.selectedAnswer === option;
  const isCorrectOption = isCorrectAnswer(option, question.answer);
  const showCorrect = hasAnswered && isCorrectOption;
  const showWrong = hasAnswered && isSelected && !isCorrectOption;
  const letter = getOptionLetter(option) ?? option.trim().charAt(0);

  return (
    <Pressable
      accessibilityRole="button"
      disabled={hasAnswered}
      onPress={() => onSelect(question, option)}
      style={({ pressed }) => optionStyle(skin, showCorrect, showWrong, pressed)}>
      <View style={badgeStyle(skin, showCorrect, showWrong)}>
        <AppText
          variant="headline"
          style={{
            color: badgeText(skin, showCorrect, showWrong),
            fontStyle: skin.id === 'handbook' && !showCorrect && !showWrong ? 'italic' : 'normal',
            fontWeight: '700',
            fontSize: 15,
          }}>
          {letter}
        </AppText>
      </View>
      <AppText
        variant="body"
        style={{
          flex: 1,
          lineHeight: 22,
          color: skin.colors.label,
        }}>
        {option.replace(/^\s*[A-D]\s*[).]\s*/i, '')}
      </AppText>
    </Pressable>
  );
}

function optionStyle(
  skin: ReturnType<typeof useSkin>['skin'],
  showCorrect: boolean,
  showWrong: boolean,
  pressed: boolean
) {
  const base = {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    gap: 12,
    opacity: pressed && !showCorrect && !showWrong ? 0.7 : 1,
  };

  if (skin.id === 'night') {
    return {
      ...base,
      backgroundColor: showCorrect
        ? skin.colors.correctBg
        : showWrong
          ? skin.colors.wrongBg
          : skin.colors.card,
      borderRadius: skin.radius.card,
      padding: 14,
      borderLeftWidth: 4,
      borderLeftColor: showCorrect
        ? skin.colors.correct
        : showWrong
          ? skin.colors.wrong
          : '#2A3544',
    };
  }

  if (skin.id === 'handbook') {
    return {
      ...base,
      paddingHorizontal: 22,
      paddingVertical: 14,
      backgroundColor: showCorrect
        ? skin.colors.correctBg
        : showWrong
          ? skin.colors.wrongBg
          : 'transparent',
      borderTopWidth: 1,
      borderTopColor: skin.colors.separator,
    };
  }

  return {
    ...base,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 56,
    backgroundColor: showCorrect
      ? skin.colors.correctBg
      : showWrong
        ? skin.colors.wrongBg
        : 'transparent',
  };
}

function badgeStyle(
  skin: ReturnType<typeof useSkin>['skin'],
  showCorrect: boolean,
  showWrong: boolean
) {
  const backgroundColor = showCorrect
    ? skin.colors.correct
    : showWrong
      ? skin.colors.wrong
      : skin.colors.badge;

  if (skin.id === 'handbook') {
    return { width: 22, paddingTop: 1 };
  }

  return {
    width: 28,
    height: 28,
    borderRadius: skin.radius.badge,
    backgroundColor,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  };
}

function badgeText(
  skin: ReturnType<typeof useSkin>['skin'],
  showCorrect: boolean,
  showWrong: boolean
) {
  if (skin.id === 'handbook') {
    if (showCorrect) {
      return skin.colors.correct;
    }
    if (showWrong) {
      return skin.colors.wrong;
    }
    return skin.colors.secondary;
  }
  if (showCorrect || showWrong) {
    return '#FFFFFF';
  }
  return skin.colors.onBadge;
}

function Results({
  score,
  total,
  onAgain,
}: {
  score: number;
  total: number;
  onAgain: () => void;
}) {
  const { skin } = useSkin();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ paddingTop: 36, paddingHorizontal: 24, alignItems: 'center' }}>
      {skin.id === 'handbook' ? (
        <View
          style={{
            width: 168,
            height: 168,
            borderRadius: 84,
            borderWidth: 3,
            borderColor: skin.colors.accent,
            alignItems: 'center',
            justifyContent: 'center',
            transform: [{ rotate: '-8deg' }],
            marginBottom: 22,
          }}>
          <AppText
            variant="display"
            style={{
              color: skin.colors.accent,
              fontSize: 42,
              fontVariant: ['tabular-nums'],
            }}>
            {score}/{total}
          </AppText>
        </View>
      ) : skin.id === 'night' ? (
        <AppText
          variant="display"
          style={{
            color: skin.colors.correct,
            fontSize: 84,
            letterSpacing: -3,
            fontVariant: ['tabular-nums'],
            marginBottom: 12,
          }}>
          {score}
          <AppText variant="title" style={{ color: skin.colors.secondary, fontSize: 28 }}>
            /{total}
          </AppText>
        </AppText>
      ) : (
        <AppText
          variant="display"
          style={{ fontVariant: ['tabular-nums'], marginBottom: 12, fontSize: 48 }}>
          {score}/{total}
        </AppText>
      )}

      <AppText variant={skin.id === 'night' ? 'kicker' : 'title'}>
        {skin.id === 'handbook' ? 'Chapter done' : skin.id === 'night' ? 'Section clear' : 'Quiz complete'}
      </AppText>
      <AppText
        variant="caption"
        style={{ textAlign: 'center', marginTop: 8, lineHeight: 20, paddingHorizontal: 12 }}>
        {score} of {total} correct. Practise again, or go back to the section list.
      </AppText>

      <View style={{ width: '100%', marginTop: 36, paddingBottom: Math.max(insets.bottom, 8), gap: 10 }}>
        <PrimaryButton
          title={skin.id === 'night' ? 'Run again' : 'Practise again'}
          onPress={onAgain}
        />
        <PrimaryButton
          title={skin.id === 'handbook' ? 'Back to chapters' : 'Done'}
          variant="ghost"
          onPress={() => router.back()}
        />
      </View>
    </View>
  );
}
