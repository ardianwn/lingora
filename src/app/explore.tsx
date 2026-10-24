import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WebBadge } from '@/components/web-badge';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import {
  addVocabulary,
  listDueVocabulary,
  listVocabulary,
  recordVocabularyReview,
  type VocabularyItem,
} from '@/lib/vocabulary';
import type { ReviewRating } from '@/lib/spaced-repetition';

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message.length > 0) {
      return message;
    }
  }

  return fallback;
}

export default function VocabularyScreen() {
  const [items, setItems] = useState<VocabularyItem[]>([]);
  const [word, setWord] = useState('');
  const [meaning, setMeaning] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [dueItems, setDueItems] = useState<VocabularyItem[]>([]);
  const [isReviewing, setIsReviewing] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  const loadVocabulary = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [allItems, due] = await Promise.all([listVocabulary(), listDueVocabulary()]);
      setItems(allItems);
      setDueItems(due);
    } catch (loadError) {
      setError(getErrorMessage(loadError, 'Kosakata gagal dimuat.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => void loadVocabulary(), 0);
    return () => clearTimeout(timeoutId);
  }, [loadVocabulary]);

  async function handleAdd() {
    if (!word.trim() || !meaning.trim()) {
      setError('Kata dan arti wajib diisi.');
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      const item = await addVocabulary(word, meaning);
      setItems((current) => [item, ...current]);
      setWord('');
      setMeaning('');
    } catch (saveError) {
      setError(getErrorMessage(saveError, 'Kosakata gagal disimpan.'));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleReview(rating: ReviewRating) {
    const item = dueItems[0];
    if (!item) {
      return;
    }

    setIsReviewing(true);
    setError(null);
    try {
      await recordVocabularyReview(item, rating);
      setDueItems((current) => current.slice(1));
      setItems((current) =>
        current.map((candidate) =>
          candidate.id === item.id
            ? { ...candidate, mastery_status: rating === 'easy' ? 'proficient' : 'learning' }
            : candidate,
        ),
      );
      setShowAnswer(false);
    } catch (reviewError) {
      setError(getErrorMessage(reviewError, 'Review gagal disimpan.'));
    } finally {
      setIsReviewing(false);
    }
  }

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="subtitle">Kosakata</ThemedText>
          <ThemedText themeColor="textSecondary">
            Simpan kata yang ingin kamu pelajari.
          </ThemedText>
        </ThemedView>
        <ThemedView type="backgroundElement" style={styles.phaseList}>
          <TextInput placeholder="English word" value={word} onChangeText={setWord} style={styles.input} />
          <TextInput placeholder="Arti dalam Bahasa Indonesia" value={meaning} onChangeText={setMeaning} style={styles.input} />
          <Pressable disabled={isSaving} onPress={() => void handleAdd()} style={styles.button}>
            {isSaving ? <ActivityIndicator color="#fff" /> : <ThemedText style={styles.buttonText}>Tambah kosakata</ThemedText>}
          </Pressable>
          {error ? <ThemedText accessibilityRole="alert" style={styles.error}>{error}</ThemedText> : null}
          <ThemedText type="subtitle">Review hari ini</ThemedText>
          {dueItems.length === 0 ? (
            <ThemedText themeColor="textSecondary">Tidak ada kartu yang perlu direview.</ThemedText>
          ) : (
            <ThemedView style={styles.flashcard}>
              <ThemedText type="subtitle">{dueItems[0].word}</ThemedText>
              {showAnswer ? (
                <>
                  <ThemedText themeColor="textSecondary">{dueItems[0].meaning}</ThemedText>
                  <ThemedText themeColor="textSecondary">Bagaimana ingatanmu?</ThemedText>
                  <ThemedView style={styles.ratingRow}>
                    {(['again', 'hard', 'good', 'easy'] as const).map((rating) => (
                      <Pressable
                        key={rating}
                        accessibilityRole="button"
                        disabled={isReviewing}
                        onPress={() => void handleReview(rating)}
                        style={styles.ratingButton}>
                        <ThemedText style={styles.ratingText}>{rating}</ThemedText>
                      </Pressable>
                    ))}
                  </ThemedView>
                </>
              ) : (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setShowAnswer(true)}
                  style={styles.button}>
                  <ThemedText style={styles.buttonText}>Lihat arti</ThemedText>
                </Pressable>
              )}
            </ThemedView>
          )}
          {isLoading ? <ActivityIndicator /> : items.length === 0 ? (
            <ThemedText themeColor="textSecondary">Belum ada kosakata.</ThemedText>
          ) : items.map((item) => (
            <ThemedView key={item.id} style={styles.item}>
              <ThemedText type="subtitle">{item.word}</ThemedText>
              <ThemedText themeColor="textSecondary">{item.meaning}</ThemedText>
            </ThemedView>
          ))}
        </ThemedView>
        {Platform.OS === 'web' && <WebBadge />}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: Spacing.six,
    alignItems: 'center',
  },
  container: {
    maxWidth: MaxContentWidth,
    flexGrow: 1,
    width: '100%',
  },
  titleContainer: {
    gap: Spacing.three,
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.six,
  },
  phaseList: {
    gap: Spacing.three,
    alignSelf: 'stretch',
    padding: Spacing.four,
  },
  input: {
    minHeight: 48,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.two,
    backgroundColor: '#ffffff',
    color: '#000000',
  },
  button: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Spacing.two,
    backgroundColor: '#3c87f7',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  item: {
    gap: Spacing.one,
    padding: Spacing.three,
    borderRadius: Spacing.two,
    backgroundColor: '#ffffff',
  },
  error: {
    color: '#b42318',
  },
  flashcard: {
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Spacing.two,
    backgroundColor: '#ffffff',
  },
  ratingRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  ratingButton: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
    backgroundColor: '#3c87f7',
  },
  ratingText: {
    color: '#ffffff',
    fontWeight: '700',
    textTransform: 'capitalize',
  },
});
