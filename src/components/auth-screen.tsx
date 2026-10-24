import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { signInWithEmail, signUpWithEmail } from '@/lib/auth';
import { validateEmail, validatePassword } from '@/lib/auth-validation';

type AuthScreenProps = {
  onAuthenticated: () => void;
  initialError?: string | null;
};

export function AuthScreen({ onAuthenticated, initialError = null }: AuthScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(initialError);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    if (emailError || passwordError) {
      setErrorMessage(emailError ?? passwordError);
      setInfoMessage(null);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setInfoMessage(null);

    try {
      const result = isSignUp
        ? await signUpWithEmail(email.trim(), password)
        : await signInWithEmail(email.trim(), password);

      if (result.error) {
        setErrorMessage(result.error.message);
      } else if (result.data.session) {
        onAuthenticated();
      } else {
        setInfoMessage(
          'Akun berhasil dibuat. Periksa email untuk konfirmasi sebelum masuk ke Lingora.',
        );
      }
    } catch {
      setErrorMessage('Terjadi kesalahan jaringan. Coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function toggleMode() {
    setIsSignUp((current) => !current);
    setErrorMessage(null);
    setInfoMessage(null);
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Lingora
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.subtitle}>
            AI-powered language learning
          </ThemedText>
        </View>

        <View style={styles.card}>
          <ThemedText type="subtitle" style={styles.cardTitle}>
            {isSignUp ? 'Buat akun' : 'Selamat datang kembali'}
          </ThemedText>
          <ThemedText style={styles.cardBody}>
            {isSignUp ? 'Mulai perjalanan belajar bahasa kamu.' : 'Masuk untuk melanjutkan belajar.'}
          </ThemedText>

          <TextInput
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            placeholder="Email"
            placeholderTextColor="#7a7f87"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            editable={!isSubmitting}
          />
          <TextInput
            autoCapitalize="none"
            autoComplete="password"
            placeholder="Password"
            placeholderTextColor="#7a7f87"
            secureTextEntry
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            editable={!isSubmitting}
          />

          {errorMessage ? (
            <ThemedText accessibilityRole="alert" style={styles.error}>
              {errorMessage}
            </ThemedText>
          ) : null}
          {infoMessage ? (
            <ThemedText accessibilityRole="alert" themeColor="textSecondary" style={styles.info}>
              {infoMessage}
            </ThemedText>
          ) : null}

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: isSubmitting }}
            disabled={isSubmitting}
            onPress={handleSubmit}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
            {isSubmitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <ThemedText style={styles.primaryButtonText}>
                {isSignUp ? 'Daftar' : 'Masuk'}
              </ThemedText>
            )}
          </Pressable>

          <Pressable
            accessibilityRole="button"
            disabled={isSubmitting}
            onPress={toggleMode}
            style={styles.secondaryButton}>
            <ThemedText style={styles.cardBody}>
              {isSignUp ? 'Sudah punya akun? Masuk' : 'Belum punya akun? Daftar'}
            </ThemedText>
          </Pressable>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.four,
    gap: Spacing.five,
  },
  header: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
  card: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 480,
    gap: Spacing.three,
    padding: Spacing.four,
    borderRadius: Spacing.two,
    backgroundColor: '#f0f0f3',
  },
  input: {
    minHeight: 48,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.two,
    backgroundColor: '#ffffff',
    color: '#000000',
    fontSize: 16,
  },
  error: {
    color: '#b42318',
  },
  info: {
    color: '#344054',
  },
  cardTitle: {
    color: '#101828',
  },
  cardBody: {
    color: '#475467',
  },
  primaryButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Spacing.two,
    backgroundColor: '#3c87f7',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
  pressed: {
    opacity: 0.8,
  },
});
