import { useEffect, useState } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { ActivityIndicator, StyleSheet, useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AuthScreen } from '@/components/auth-screen';
import AppTabs from '@/components/app-tabs';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getPublicConfig } from '@/config/env';
import { getCurrentSession } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

SplashScreen.preventAutoHideAsync();

const SESSION_RESTORE_TIMEOUT_MS = 8_000;

export default function TabLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const colorScheme = useColorScheme();

  useEffect(() => {
    let mounted = true;

    async function restoreSession() {
      try {
        const [{ session, error }] = await Promise.race([
          Promise.all([getCurrentSession(), getPublicConfig()]),
          new Promise<[{ session: null; error: Error }, void]>((_, reject) => {
            setTimeout(
              () => reject(new Error('Koneksi Supabase terlalu lama. Periksa jaringan lalu coba lagi.')),
              SESSION_RESTORE_TIMEOUT_MS,
            );
          }),
        ]);
        if (error) {
          throw error;
        }
        if (mounted) {
          setIsAuthenticated(Boolean(session));
        }
      } catch (error) {
        if (mounted) {
          setRestoreError(
            error instanceof Error
              ? error.message
              : 'Session tidak dapat dipulihkan. Coba lagi.',
          );
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
          void SplashScreen.hideAsync();
        }
      }
    }

    void restoreSession();
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setIsAuthenticated(Boolean(session));
      }
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      {isLoading ? (
        <SplashScreenView />
      ) : isAuthenticated ? (
        <AppTabs />
      ) : (
        <AuthScreen
          initialError={restoreError}
          onAuthenticated={() => {
            setRestoreError(null);
            setIsAuthenticated(true);
          }}
        />
      )}
    </ThemeProvider>
  );
}

function SplashScreenView() {
  return (
    <ThemedView style={styles.loadingContainer}>
      <ActivityIndicator size="large" />
      <ThemedText themeColor="textSecondary">Memuat Lingora...</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
});
