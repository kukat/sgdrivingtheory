const FORM_URL_PATTERN = /https:\/\/form\.gov\.sg\/([a-f\d]{24})/i;
const ANSWER_PREFIX_PATTERN = /^answer:\s*/i;
const OPTION_LETTER_PATTERN = /^\s*([A-D])\s*[).]\s*/i;

export type FormField = {
  _id?: string;
  title?: string;
  description?: string;
  fieldOptions?: unknown;
  fieldType?: string;
  [key: string]: unknown;
};

export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  answer: string;
};

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function getFormFields(payload: unknown): FormField[] {
  if (!isRecord(payload)) {
    return [];
  }

  const fields = payload.form_fields;
  if (Array.isArray(fields)) {
    return fields.filter(isRecord);
  }

  const form = payload.form;
  if (isRecord(form) && Array.isArray(form.form_fields)) {
    return form.form_fields.filter(isRecord);
  }

  return [];
}

export function findFormId(value: unknown): string | undefined {
  if (typeof value === 'string') {
    return value.match(FORM_URL_PATTERN)?.[1];
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const formId = findFormId(item);
      if (formId) {
        return formId;
      }
    }
  }

  if (isRecord(value)) {
    for (const item of Object.values(value)) {
      const formId = findFormId(item);
      if (formId) {
        return formId;
      }
    }
  }
}

export function parseAnswer(description: string | undefined): string | undefined {
  const answer = description?.replace(ANSWER_PREFIX_PATTERN, '').trim();
  return answer && answer.length > 0 ? answer : undefined;
}

export function getOptionLetter(value: string): string | undefined {
  const letter = value.trim().match(OPTION_LETTER_PATTERN)?.[1];
  return letter ? letter.toUpperCase() : undefined;
}

export function normalizeAnswer(value: string): string {
  return value
    .trim()
    .replace(OPTION_LETTER_PATTERN, (_, letter: string) => `${letter.toUpperCase()}) `)
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

export function isCorrectAnswer(selectedAnswer: string, answer: string): boolean {
  const selectedLetter = getOptionLetter(selectedAnswer);
  const answerLetter = getOptionLetter(answer);

  if (selectedLetter && answerLetter) {
    return selectedLetter === answerLetter;
  }

  return normalizeAnswer(selectedAnswer) === normalizeAnswer(answer);
}

export function getQuizQuestions(fields: FormField[]): QuizQuestion[] {
  const questions: QuizQuestion[] = [];

  for (let index = 0; index < fields.length; index += 1) {
    const field = fields[index];
    const options = Array.isArray(field.fieldOptions)
      ? field.fieldOptions.filter((option): option is string => typeof option === 'string')
      : [];

    if (!field.title || options.length === 0) {
      continue;
    }

    const answerField = fields[index + 1];
    if (answerField?.title?.trim().toLowerCase() !== 'statement') {
      continue;
    }

    const answer = parseAnswer(answerField?.description);

    if (!answer) {
      continue;
    }

    questions.push({
      id: field._id ?? `${field.title}-${index}`,
      question: field.title.trim(),
      options,
      answer,
    });
  }

  return questions;
}
