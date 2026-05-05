import { TheoryTestScreen } from '@/components/theory-test-screen';

const BTT_ENDPOINT = 'https://form.gov.sg/api/v3/forms/67317e882e2ffcb14032e4a2';

export default function BttScreen() {
  return (
    <TheoryTestScreen
      endpoint={BTT_ENDPOINT}
      title="Basic Theory Test"
      subtitle="Choose a section to start a Basic Theory Test practice quiz."
      headerBackgroundColor={{ light: '#F7D9A8', dark: '#3D2B13' }}
      theme={{
        accent: '#D67B00',
        screenBackground: { light: '#F4E8D1', dark: '#0F0D09' },
        heroBackground: { light: '#FFF9ED', dark: '#17130C' },
        progressTrack: { light: '#E8D6B9', dark: '#4A3720' },
        optionBackground: { light: '#FFFBF4', dark: '#2A251D' },
        optionBorder: { light: '#E8D6B9', dark: '#504536' },
        cardBackground: { light: '#FFF4DF', dark: '#33230B' },
        cardBorder: { light: '#E0A948', dark: '#B98222' },
      }}
      iconName="book.fill"
      iconColor="#D69B2D"
    />
  );
}
