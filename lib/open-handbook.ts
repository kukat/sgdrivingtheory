import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';
import { Linking } from 'react-native';

export async function openUrl(url: string) {
  try {
    await openBrowserAsync(url, {
      presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
    });
  } catch {
    await Linking.openURL(url);
  }
}

export const openHandbook = openUrl;
