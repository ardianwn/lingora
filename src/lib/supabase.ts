import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import 'react-native-url-polyfill/auto';

import { getPublicConfig } from '@/config/env';

const config = getPublicConfig();

const webStorage =
  Platform.OS === 'web'
    ? {
        getItem: (key: string) =>
          typeof window === 'undefined' ? null : window.localStorage.getItem(key),
        removeItem: (key: string) => {
          if (typeof window !== 'undefined') {
            window.localStorage.removeItem(key);
          }
        },
        setItem: (key: string, value: string) => {
          if (typeof window !== 'undefined') {
            window.localStorage.setItem(key, value);
          }
        },
      }
    : undefined;

export const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey, {
  auth: {
    storage: webStorage ?? AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
