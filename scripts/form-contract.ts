import { isCorrectAnswer } from '@/lib/form-gov';
import type { FormCatalog } from '@/lib/form-catalog';
import type { TestId } from '@/lib/tests';

export const FLOOR_RATIO = 0.8;

export const MIN_SECTIONS: Record<TestId, number> = {
  btt: 6,
  ftt: 15,
  rtt: 12,
};

export const MIN_QUESTIONS_PER_SECTION = 3;
export const FORM_ID_PATTERN = /^[a-f\d]{24}$/i;

export type ContractFailure = {
  testId: TestId;
  sectionId?: string;
  message: string;
};

function countQuestions(catalog: FormCatalog): number {
  return catalog.sections.reduce((sum, section) => sum + section.questions.length, 0);
}

export function checkCatalog(
  catalog: FormCatalog,
  previous: FormCatalog | undefined
): ContractFailure[] {
  const failures: ContractFailure[] = [];
  const minSections = MIN_SECTIONS[catalog.id];

  if (catalog.sections.length < minSections) {
    failures.push({
      testId: catalog.id,
      message: `Section count ${catalog.sections.length} is below the floor of ${minSections}.`,
    });
  }

  if (previous && catalog.sections.length < Math.ceil(previous.sections.length * FLOOR_RATIO)) {
    failures.push({
      testId: catalog.id,
      message: `Section count dropped from ${previous.sections.length} to ${catalog.sections.length}.`,
    });
  }

  const questionCount = countQuestions(catalog);
  const previousQuestionCount = previous ? countQuestions(previous) : undefined;
  if (
    previousQuestionCount !== undefined &&
    questionCount < Math.ceil(previousQuestionCount * FLOOR_RATIO)
  ) {
    failures.push({
      testId: catalog.id,
      message: `Question count dropped from ${previousQuestionCount} to ${questionCount}.`,
    });
  }

  for (const section of catalog.sections) {
    if (!FORM_ID_PATTERN.test(section.formId)) {
      failures.push({
        testId: catalog.id,
        sectionId: section.id,
        message: `Section "${section.title}" has no valid form id.`,
      });
      continue;
    }

    if (section.questions.length < MIN_QUESTIONS_PER_SECTION) {
      failures.push({
        testId: catalog.id,
        sectionId: section.id,
        message: `Section "${section.title}" has ${section.questions.length} questions; need at least ${MIN_QUESTIONS_PER_SECTION}.`,
      });
    }

    if (previous) {
      const previousSection = previous.sections.find((item) => item.id === section.id);
      if (
        previousSection &&
        section.questions.length < Math.ceil(previousSection.questions.length * FLOOR_RATIO)
      ) {
        failures.push({
          testId: catalog.id,
          sectionId: section.id,
          message: `Section "${section.title}" questions dropped from ${previousSection.questions.length} to ${section.questions.length}.`,
        });
      }
    }

    for (const question of section.questions) {
      if (!question.question.trim()) {
        failures.push({
          testId: catalog.id,
          sectionId: section.id,
          message: `Question ${question.id} has an empty title.`,
        });
      }

      if (question.options.length < 2 || question.options.length > 6) {
        failures.push({
          testId: catalog.id,
          sectionId: section.id,
          message: `Question "${question.question}" has ${question.options.length} options.`,
        });
      }

      const matchingOption = question.options.some((option) =>
        isCorrectAnswer(option, question.answer)
      );
      if (!matchingOption) {
        failures.push({
          testId: catalog.id,
          sectionId: section.id,
          message: `Question "${question.question}" answer does not match an option.`,
        });
      }
    }
  }

  return failures;
}
