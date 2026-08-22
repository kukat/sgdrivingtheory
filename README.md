# Singapore Driving Theory Practice

Expo app for practising Singapore driving theory tests with section-based quizzes and official handbook links.

## Features

- Basic Theory Test (BTT), Final Theory Test (FTT), and Riding Theory Test (RTT) tabs.
- Section lists loaded from public Form.gov.sg form APIs at runtime.
- One-question-per-page quiz flow with immediate correct/incorrect feedback.
- Official handbook PDF links opened with an in-app browser when available.
- Separate visual themes for BTT, FTT, and RTT.

## Data Sources

Quiz sections and questions are fetched from public Form.gov.sg endpoints:

- BTT: `https://form.gov.sg/api/v3/forms/67317e882e2ffcb14032e4a2`
- FTT: `https://form.gov.sg/api/v3/forms/67d2ad567b868a77419c163b`
- RTT: `https://form.gov.sg/api/v3/forms/67d2fcd008bae384d0ace35d`

Handbooks are linked from Singapore Police Force public PDFs:

- BTT: `https://www.police.gov.sg/-/media/SPF/Knowledge-Hub/Traffic/BT-ENG-24126.pdf`
- FTT: `https://www.police.gov.sg/-/media/SPF/Knowledge-Hub/Traffic/FT-ENG-2126-Revised.pdf`
- RTT: `https://www.police.gov.sg/-/media/SPF/Advisories/TP/RT-ENG-2126.pdf`

## Development

Install dependencies:

```bash
npm install
```

Start Expo:

```bash
npm start
```

Run checks:

```bash
npm run lint
npx tsc --noEmit
```

## App Identity

- iOS bundle identifier: `me.cyao.sgdrivingtheory`
- Android package: `me.cyao.sgdrivingtheory`

## Release

Local APK, EAS production, TestFlight, and Play internal testing: [RELEASE.md](RELEASE.md).

## Project Structure

- `app/(tabs)/btt.tsx`, `ftt.tsx`, `rtt.tsx`: theory-test entry tabs.
- `components/theory-test-screen.tsx`: shared handbook and section-list screen.
- `app/quiz/[formId].tsx`: dynamic quiz route for a selected section.
- `lib/form-gov.ts`: Form.gov.sg response parsing helpers.
