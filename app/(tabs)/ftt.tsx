import { TheoryTestScreen } from '@/components/theory-test-screen';

const FTT_ENDPOINT = 'https://form.gov.sg/api/v3/forms/67d2ad567b868a77419c163b';

export default function FttScreen() {
  return (
    <TheoryTestScreen
      endpoint={FTT_ENDPOINT}
      title="Final Theory Test"
      subtitle="Choose a section to start a Final Theory Test practice quiz."
      headerBackgroundColor={{ light: '#CDEFF4', dark: '#103038' }}
      theme={{
        accent: '#008FA3',
        screenBackground: { light: '#E1F4F7', dark: '#07151A' },
        heroBackground: { light: '#F2FDFF', dark: '#0D242B' },
        progressTrack: { light: '#B8E3EA', dark: '#1C4A55' },
        optionBackground: { light: '#F7FEFF', dark: '#172B31' },
        optionBorder: { light: '#B8E3EA', dark: '#315D68' },
        cardBackground: { light: '#ECFBFD', dark: '#102932' },
        cardBorder: { light: '#66C6D4', dark: '#008FA3' },
      }}
      iconName="car.fill"
      iconColor="#008FA3"
    />
  );
}
