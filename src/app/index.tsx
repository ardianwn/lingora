import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { signOut } from '@/lib/auth';
import { getDashboardData, type DashboardData } from '@/lib/dashboard';

export default function HomeScreen() {
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setDashboardError(null);
    try {
      const activityDate = new Date().toISOString().slice(0, 10);
      setDashboard(await getDashboardData(activityDate));
    } catch (error) {
      setDashboardError(
        error instanceof Error ? error.message : 'Dashboard tidak dapat dimuat.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void loadDashboard();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [loadDashboard]);

  async function handleSignOut() {
    const { error } = await signOut();
    if (error) {
      setSignOutError(error.message);
      return;
    }
    setSignOutError(null);
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.heroSection}>
          <ThemedText type="title" style={styles.title}>
            Lingora
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.subtitle}>
            AI-powered language learning
          </ThemedText>
          <ThemedText themeColor="textSecondary">
            {dashboard?.profile.display_name
              ? `Halo, ${dashboard.profile.display_name}`
              : 'Siap belajar hari ini?'}
          </ThemedText>
        </ThemedView>

        <ThemedView type="backgroundElement" style={styles.statusCard}>
          <ThemedText type="subtitle">Progress hari ini</ThemedText>
          {isLoading ? (
            <ActivityIndicator />
          ) : dashboardError ? (
            <>
              <ThemedText accessibilityRole="alert" style={styles.error}>
                {dashboardError}
              </ThemedText>
              <Pressable
                accessibilityRole="button"
                onPress={() => void loadDashboard()}
                style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
                <ThemedText themeColor="textSecondary">Coba lagi</ThemedText>
              </Pressable>
            </>
          ) : dashboard ? (
            <>
              <ThemedText themeColor="textSecondary">
                {dashboard.activity?.minutes_learned ?? 0} dari{' '}
                {dashboard.profile.daily_goal_minutes} menit tercatat hari ini
              </ThemedText>
              <ThemedText themeColor="textSecondary">
                Sesi selesai: {dashboard.activity?.sessions_completed ?? 0} · Review: {dashboard.activity?.reviews_completed ?? 0}
              </ThemedText>
              {dashboard.goals.length === 0 ? (
                <ThemedText themeColor="textSecondary">
                  Belum ada target belajar aktif.
                </ThemedText>
              ) : (
                <ThemedText themeColor="textSecondary">
                  Target aktif: {dashboard.goals.length}
                </ThemedText>
              )}
            </>
          ) : null}
          {signOutError ? (
            <ThemedText accessibilityRole="alert" style={styles.error}>
              {signOutError}
            </ThemedText>
          ) : null}
          <Pressable
            accessibilityRole="button"
            onPress={() => void handleSignOut()}
            style={({ pressed }) => [styles.signOutButton, pressed && styles.pressed]}>
            <ThemedText themeColor="textSecondary">Keluar</ThemedText>
          </Pressable>
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    justifyContent: 'center',
    gap: Spacing.four,
    maxWidth: MaxContentWidth,
  },
  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
  statusCard: {
    gap: Spacing.three,
    alignSelf: 'stretch',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
    borderRadius: Spacing.four,
  },
  signOutButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
    backgroundColor: '#ffffff',
  },
  secondaryButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
    backgroundColor: '#ffffff',
  },
  pressed: {
    opacity: 0.8,
  },
  error: {
    color: '#b42318',
  },
});
