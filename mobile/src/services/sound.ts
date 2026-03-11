import { Audio } from 'expo-av';
import { Platform } from 'react-native';

let notificationSound: Audio.Sound | null = null;

export const soundService = {
  async init(): Promise<void> {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });
    } catch (error) {
      console.log('Audio init error (may be expected on web):', error);
    }
  },

  async playNotification(): Promise<void> {
    try {
      if (notificationSound) {
        await notificationSound.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: Platform.select({
          web: '/notification.mp3',
          default: 'asset:/notification.mp3'
        }) || '' },
        { shouldPlay: true, volume: 1.0 }
      );
      
      notificationSound = sound;

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
          notificationSound = null;
        }
      });
    } catch (error) {
      console.log('Notification sound not available:', error);
    }
  },

  async cleanup(): Promise<void> {
    if (notificationSound) {
      await notificationSound.unloadAsync();
      notificationSound = null;
    }
  },
};
