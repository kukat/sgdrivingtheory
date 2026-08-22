import type { QuizQuestion } from '@/lib/form-gov';
import { isRecord } from '@/lib/form-gov';
import { isTestId, type TestId } from '@/lib/tests';

export const FORM_CATALOG_VERSION = 1 as const;

export type CatalogSection = {
  id: string;
  title: string;
  formId: string;
  questions: QuizQuestion[];
};

export type FormCatalog = {
  version: typeof FORM_CATALOG_VERSION;
  id: TestId;
  title: string;
  contentHash: string;
  sections: CatalogSection[];
};

export function catalogFileName(testId: TestId): string {
  return `${testId}.json`;
}

export function parseCatalog(value: unknown): FormCatalog | undefined {
  if (!isRecord(value)) {
    return undefined;
  }
  if (value.version !== FORM_CATALOG_VERSION) {
    return undefined;
  }
  const id = value.id;
  if (typeof id !== 'string' || !isTestId(id)) {
    return undefined;
  }
  if (typeof value.title !== 'string' || typeof value.contentHash !== 'string') {
    return undefined;
  }
  if (!Array.isArray(value.sections)) {
    return undefined;
  }

  const sections: CatalogSection[] = [];
  for (const section of value.sections) {
    if (!isRecord(section)) {
      return undefined;
    }
    if (
      typeof section.id !== 'string' ||
      typeof section.title !== 'string' ||
      typeof section.formId !== 'string' ||
      !Array.isArray(section.questions)
    ) {
      return undefined;
    }

    const questions: QuizQuestion[] = [];
    for (const question of section.questions) {
      if (!isRecord(question)) {
        return undefined;
      }
      if (
        typeof question.id !== 'string' ||
        typeof question.question !== 'string' ||
        typeof question.answer !== 'string' ||
        !Array.isArray(question.options) ||
        question.options.some((option) => typeof option !== 'string')
      ) {
        return undefined;
      }
      questions.push({
        id: question.id,
        question: question.question,
        options: question.options,
        answer: question.answer,
      });
    }

    sections.push({
      id: section.id,
      title: section.title,
      formId: section.formId,
      questions,
    });
  }

  return {
    version: FORM_CATALOG_VERSION,
    id,
    title: value.title,
    contentHash: value.contentHash,
    sections,
  };
}
