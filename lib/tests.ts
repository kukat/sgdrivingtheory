import { findFormId, getFormFields, type FormField } from '@/lib/form-gov';

export type TestId = 'btt' | 'ftt' | 'rtt';

export type TheoryTestSection = {
  id: string;
  title: string;
  formId?: string;
};

export type TestConfig = {
  id: TestId;
  code: string;
  title: string;
  shortTitle: string;
  subtitle: string;
  endpoint: string;
  handbookUrl: string;
  icon: 'book.fill' | 'car.fill' | 'motorcycle.fill';
};

export const TESTS: Record<TestId, TestConfig> = {
  btt: {
    id: 'btt',
    code: 'BTT',
    title: 'Basic Theory Test',
    shortTitle: 'Basic Theory',
    subtitle: 'First sitting. Cars.',
    endpoint: 'https://form.gov.sg/api/v3/forms/67317e882e2ffcb14032e4a2',
    handbookUrl:
      'https://www.police.gov.sg/-/media/SPF/Knowledge-Hub/Traffic/BT-ENG-24126.pdf',
    icon: 'book.fill',
  },
  ftt: {
    id: 'ftt',
    code: 'FTT',
    title: 'Final Theory Test',
    shortTitle: 'Final Theory',
    subtitle: 'After practical lessons.',
    endpoint: 'https://form.gov.sg/api/v3/forms/67d2ad567b868a77419c163b',
    handbookUrl:
      'https://www.police.gov.sg/-/media/SPF/Knowledge-Hub/Traffic/FT-ENG-2126-Revised.pdf',
    icon: 'car.fill',
  },
  rtt: {
    id: 'rtt',
    code: 'RTT',
    title: 'Riding Theory Test',
    shortTitle: 'Riding Theory',
    subtitle: 'Motorcycles and scooters.',
    endpoint: 'https://form.gov.sg/api/v3/forms/67d2fcd008bae384d0ace35d',
    handbookUrl: 'https://www.police.gov.sg/-/media/SPF/Advisories/TP/RT-ENG-2126.pdf',
    icon: 'motorcycle.fill',
  },
};

export const TEST_IDS = Object.keys(TESTS) as TestId[];

export function isTestId(value: string | undefined): value is TestId {
  return value === 'btt' || value === 'ftt' || value === 'rtt';
}

export function sectionsFromFields(fields: FormField[]): TheoryTestSection[] {
  return fields
    .filter((field) => typeof field.title === 'string' && field.title.trim().length > 0)
    .map((field, index) => ({
      id: field._id ?? `${field.title}-${index}`,
      title: field.title?.trim() ?? `Section ${index + 1}`,
      formId: findFormId(field),
    }));
}

export async function loadSections(testId: TestId): Promise<TheoryTestSection[]> {
  const response = await fetch(TESTS[testId].endpoint);
  if (!response.ok) {
    throw new Error(`Form request failed with status ${response.status}`);
  }
  const payload: unknown = await response.json();
  return sectionsFromFields(getFormFields(payload));
}
