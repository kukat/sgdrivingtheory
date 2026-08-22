import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import {
  catalogFileName,
  FORM_CATALOG_VERSION,
  parseCatalog,
  type CatalogSection,
  type FormCatalog,
} from '@/lib/form-catalog';
import { getFormFields, getQuizQuestions } from '@/lib/form-gov';
import { sectionsFromFields, TEST_IDS, TESTS, type TestId } from '@/lib/tests';

import { catalogFingerprint, checkCatalog, diffCatalogs, type ContractFailure } from './form-contract';

const DATA_DIR = path.join(process.cwd(), 'data');
const BRANCH = 'chore/form-data-refresh';
const FORM_ID_PATTERN = /^[a-f\d]{24}$/i;
const FETCH_CONCURRENCY = 4;
const FETCH_RETRIES = 3;
const USER_AGENT = 'DrivingBibleFormRefresh/1.0 (+https://github.com/kukat/sgdrivingtheory)';

type BuildResult =
  | { testId: TestId; status: 'unchanged'; catalog: FormCatalog }
  | { testId: TestId; status: 'changed'; catalog: FormCatalog }
  | { testId: TestId; status: 'failed'; failures: ContractFailure[] };

function run(command: string, args: string[], options?: { allowFail?: boolean }): string {
  const result = spawnSync(command, args, { encoding: 'utf8' });
  if (result.status !== 0 && !options?.allowFail) {
    const detail = (result.stderr || result.stdout || '').trim();
    throw new Error(`${command} ${args.join(' ')} failed${detail ? `: ${detail}` : ''}`);
  }
  return (result.stdout || '').trim();
}

function inCi(): boolean {
  return process.env.GITHUB_ACTIONS === 'true';
}

async function mapPool<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;

  async function worker() {
    while (next < items.length) {
      const index = next;
      next += 1;
      results[index] = await fn(items[index]);
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

async function fetchJson(url: string): Promise<unknown> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= FETCH_RETRIES; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { 'user-agent': USER_AGENT, accept: 'application/json' },
      });
      if (!response.ok) {
        throw new Error(`${url} returned ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < FETCH_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
      }
    }
  }

  throw lastError ?? new Error(`Failed to fetch ${url}`);
}

async function fetchForm(formId: string, cache: Map<string, unknown>): Promise<unknown> {
  const cached = cache.get(formId);
  if (cached) {
    return cached;
  }
  const payload = await fetchJson(`https://form.gov.sg/api/v3/forms/${formId}`);
  cache.set(formId, payload);
  return payload;
}

function hashSections(sections: CatalogSection[]): string {
  return createHash('sha256').update(JSON.stringify(sections)).digest('hex');
}

function toCatalog(input: { id: TestId; title: string; sections: CatalogSection[] }): FormCatalog {
  return {
    version: FORM_CATALOG_VERSION,
    id: input.id,
    title: input.title,
    contentHash: hashSections(input.sections),
    sections: input.sections,
  };
}

async function buildCatalog(testId: TestId, cache: Map<string, unknown>): Promise<FormCatalog> {
  const config = TESTS[testId];
  const indexFormId = config.endpoint.split('/').pop();
  if (!indexFormId || !FORM_ID_PATTERN.test(indexFormId)) {
    throw new Error(`${testId} endpoint is not a form id`);
  }

  const indexPayload = await fetchForm(indexFormId, cache);
  const listings = sectionsFromFields(getFormFields(indexPayload));
  if (listings.length === 0) {
    throw new Error(`${testId} index returned no sections`);
  }

  const sections = await mapPool(listings, FETCH_CONCURRENCY, async (listing) => {
    if (!listing.formId || !FORM_ID_PATTERN.test(listing.formId)) {
      return {
        id: listing.id,
        title: listing.title,
        formId: listing.formId ?? '',
        questions: [],
      } satisfies CatalogSection;
    }

    const quizPayload = await fetchForm(listing.formId, cache);
    return {
      id: listing.id,
      title: listing.title,
      formId: listing.formId,
      questions: getQuizQuestions(getFormFields(quizPayload)),
    } satisfies CatalogSection;
  });

  return toCatalog({ id: testId, title: config.title, sections });
}

function loadPrevious(testId: TestId): FormCatalog | undefined {
  try {
    const parsed: unknown = JSON.parse(readFileSync(path.join(DATA_DIR, catalogFileName(testId)), 'utf8'));
    return parseCatalog(parsed);
  } catch {
    return undefined;
  }
}

function writeCatalog(catalog: FormCatalog) {
  mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(path.join(DATA_DIR, catalogFileName(catalog.id)), `${JSON.stringify(catalog, null, 2)}\n`);
}

function summarize(catalog: FormCatalog): string {
  const questions = catalog.sections.reduce((sum, section) => sum + section.questions.length, 0);
  return `${catalog.id}: ${catalog.sections.length} sections, ${questions} questions`;
}

function formatFailures(failures: ContractFailure[]): string {
  return failures
    .map((failure) =>
      failure.sectionId ? `- ${failure.sectionId}: ${failure.message}` : `- ${failure.message}`
    )
    .join('\n');
}

function ensureLabel(name: string, color: string, description: string) {
  run('gh', ['label', 'create', name, '--color', color, '--description', description, '--force']);
}

function openIssueNumber(testId: TestId): string | undefined {
  const raw = run('gh', [
    'issue',
    'list',
    '--label',
    'form-refresh',
    '--label',
    `form:${testId}`,
    '--state',
    'open',
    '--json',
    'number',
    '--jq',
    '.[0].number',
  ]);
  if (!raw || raw === 'null') {
    return undefined;
  }
  return raw;
}

function upsertFailureIssue(testId: TestId, failures: ContractFailure[]) {
  ensureLabel('form-refresh', 'B60205', 'Form.gov.sg refresh failed contract tests');
  ensureLabel(`form:${testId}`, '0E8A16', `${TESTS[testId].code} catalog`);

  const title = `${TESTS[testId].code} form catalog failed contract tests`;
  const body = [
    'The daily Form.gov.sg refresh kept the last published catalog for this test.',
    '',
    formatFailures(failures),
    '',
    `Run: ${process.env.GITHUB_SERVER_URL ?? ''}/${process.env.GITHUB_REPOSITORY ?? ''}/actions/runs/${process.env.GITHUB_RUN_ID ?? ''}`,
  ].join('\n');

  const existing = openIssueNumber(testId);
  if (existing) {
    run('gh', ['issue', 'edit', existing, '--title', title, '--body', body]);
    run('gh', ['issue', 'comment', existing, '--body', body]);
    return existing;
  }

  const args = ['issue', 'create', '--title', title, '--body', body, '--label', 'form-refresh', '--label', `form:${testId}`];
  const owner = process.env.GITHUB_REPOSITORY_OWNER;
  if (owner) {
    args.push('--assignee', owner);
  }
  return run('gh', args);
}

function closeFailureIssue(testId: TestId) {
  const existing = openIssueNumber(testId);
  if (!existing) {
    return;
  }
  run('gh', [
    'issue',
    'close',
    existing,
    '--comment',
    `${TESTS[testId].code} catalog passed contract tests. Last published file was left as-is if the content hash was unchanged, or included in the refresh PR if it changed.`,
  ]);
}

function existingPrNumber(): string | undefined {
  const raw = run('gh', [
    'pr',
    'list',
    '--head',
    BRANCH,
    '--state',
    'open',
    '--json',
    'number',
    '--jq',
    '.[0].number',
  ]);
  if (!raw || raw === 'null') {
    return undefined;
  }
  return raw;
}

function publishPr(changed: FormCatalog[]) {
  run('git', ['config', 'user.name', 'github-actions[bot]']);
  run('git', ['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com']);
  run('git', ['checkout', '-B', BRANCH]);
  run('git', ['add', ...changed.map((catalog) => path.join('data', catalogFileName(catalog.id)))]);

  const status = run('git', ['diff', '--cached', '--name-only']);
  if (!status) {
    return;
  }

  const summary = changed.map(summarize).join('\n');
  run('git', ['commit', '-m', 'Update theory test catalogs from Form.gov.sg', '-m', summary]);
  run('git', ['push', '--force', 'origin', BRANCH]);

  const body = [
    'Form.gov.sg JSON changed and passed contract tests. Merge to publish the new catalog files.',
    '',
    '```',
    summary,
    '```',
    '',
    'Failed tests are not in this PR. They stay on the last good files and have their own issues.',
  ].join('\n');

  const open = existingPrNumber();
  if (open) {
    run('gh', ['pr', 'edit', open, '--title', 'Update theory test catalogs from Form.gov.sg', '--body', body]);
    return;
  }

  run('gh', [
    'pr',
    'create',
    '--title',
    'Update theory test catalogs from Form.gov.sg',
    '--body',
    body,
    '--head',
    BRANCH,
  ]);
}

function writeReport(results: BuildResult[]) {
  const lines = ['# Form refresh report', ''];
  for (const result of results) {
    if (result.status === 'failed') {
      lines.push(`## ${result.testId} failed`, '', formatFailures(result.failures), '');
      continue;
    }
    lines.push(`## ${result.testId} ${result.status}`, '', summarize(result.catalog), '');
  }
  writeFileSync(path.join(process.cwd(), 'form-refresh-report.md'), `${lines.join('\n')}\n`);
}

async function main() {
  const cache = new Map<string, unknown>();
  const results: BuildResult[] = [];

  for (const testId of TEST_IDS) {
    const previous = loadPrevious(testId);
    try {
      const catalog = await buildCatalog(testId, cache);
      const failures = [
        ...checkCatalog(catalog, previous),
        ...(previous ? diffCatalogs(previous, catalog) : []),
      ];
      if (failures.length > 0) {
        results.push({ testId, status: 'failed', failures });
        continue;
      }
      results.push({
        testId,
        status:
          previous && catalogFingerprint(previous) === catalogFingerprint(catalog)
            ? 'unchanged'
            : 'changed',
        catalog,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      results.push({
        testId,
        status: 'failed',
        failures: [{ testId, message }],
      });
    }
  }

  const changed = results.filter((result) => result.status === 'changed').map((result) => result.catalog);
  const failed = results.filter((result) => result.status === 'failed');

  for (const catalog of changed) {
    writeCatalog(catalog);
  }

  writeReport(results);

  if (inCi()) {
    if (changed.length > 0) {
      publishPr(changed);
    }
    for (const result of results) {
      if (result.status === 'failed') {
        upsertFailureIssue(result.testId, result.failures);
      } else {
        closeFailureIssue(result.testId);
      }
    }
  }

  for (const result of results) {
    if (result.status === 'failed') {
      console.error(`${result.testId} failed:\n${formatFailures(result.failures)}`);
      continue;
    }
    console.log(summarize(result.catalog), result.status);
  }

  if (failed.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 2;
});
