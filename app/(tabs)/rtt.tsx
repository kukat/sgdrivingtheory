import { TheoryTestScreen } from '@/components/theory-test-screen';

const RTT_ENDPOINT = 'https://form.gov.sg/api/v3/forms/67d2fcd008bae384d0ace35d';

export default function RttScreen() {
  return (
    <TheoryTestScreen
      endpoint={RTT_ENDPOINT}
      title="Riding Theory Test"
      subtitle="Choose a section to start a Riding Theory Test practice quiz."
      headerBackgroundColor={{ light: '#D8E7FF', dark: '#10233F' }}
      theme={{
        accent: '#3E7FC8',
        screenBackground: { light: '#E7F0FF', dark: '#07111F' },
        heroBackground: { light: '#F5F9FF', dark: '#0D1D33' },
        progressTrack: { light: '#C2D8F6', dark: '#203E65' },
        optionBackground: { light: '#F7FAFF', dark: '#17283F' },
        optionBorder: { light: '#C2D8F6', dark: '#345B89' },
        cardBackground: { light: '#EEF5FF', dark: '#10233F' },
        cardBorder: { light: '#78A9EA', dark: '#3E7FC8' },
      }}
      iconName="motorcycle.fill"
      iconColor="#3E7FC8"
    />
  );
}
