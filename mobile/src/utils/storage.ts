import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  TOKEN: '@nili_baby_token',
  USER: '@nili_baby_user',
  SELECTED_BABY: '@nili_baby_selected',
};

export const storage = {
  async setToken(token: string): Promise<void> {
    await AsyncStorage.setItem(KEYS.TOKEN, token);
  },

  async getToken(): Promise<string | null> {
    return AsyncStorage.getItem(KEYS.TOKEN);
  },

  async removeToken(): Promise<void> {
    await AsyncStorage.removeItem(KEYS.TOKEN);
  },

  async setUser(user: any): Promise<void> {
    await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
  },

  async getUser(): Promise<any | null> {
    const user = await AsyncStorage.getItem(KEYS.USER);
    return user ? JSON.parse(user) : null;
  },

  async removeUser(): Promise<void> {
    await AsyncStorage.removeItem(KEYS.USER);
  },

  async setSelectedBaby(babyId: string): Promise<void> {
    await AsyncStorage.setItem(KEYS.SELECTED_BABY, babyId);
  },

  async getSelectedBaby(): Promise<string | null> {
    return AsyncStorage.getItem(KEYS.SELECTED_BABY);
  },

  async clearAll(): Promise<void> {
    await AsyncStorage.multiRemove([KEYS.TOKEN, KEYS.USER, KEYS.SELECTED_BABY]);
  },
};
