import { supabase } from './supabase';
import {
  scheduleReview,
  type ReviewRating,
  type ReviewSchedule,
} from './spaced-repetition';

export type VocabularyItem = {
  id: string;
  word: string;
  meaning: string;
  topic: string | null;
  mastery_status: 'new' | 'learning' | 'proficient' | 'mastered';
  is_favorite: boolean;
  is_difficult: boolean;
};

export async function listVocabulary(): Promise<VocabularyItem[]> {
  const { data, error } = await supabase
    .from('vocabulary')
    .select('id, word, meaning, topic, mastery_status, is_favorite, is_difficult')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as VocabularyItem[];
}

export async function listDueVocabulary(
    now = new Date(),
    limit = 20,
  ): Promise<VocabularyItem[]> {
    const { data: vocabulary, error: vocabularyError } = await supabase
      .from('vocabulary')
      .select('id, word, meaning, topic, mastery_status, is_favorite, is_difficult')
      .order('created_at', { ascending: false });

    if (vocabularyError) {
      throw vocabularyError;
    }

    const { data: reviews, error: reviewsError } = await supabase
      .from('vocabulary_reviews')
      .select('vocabulary_id, reviewed_at, next_review_at')
      .order('reviewed_at', { ascending: false });

    if (reviewsError) {
      throw reviewsError;
    }

    const latestReviewByVocabulary = new Map<
      string,
      { next_review_at: string; reviewed_at: string }
    >();
    for (const review of reviews ?? []) {
      if (!latestReviewByVocabulary.has(review.vocabulary_id)) {
        latestReviewByVocabulary.set(review.vocabulary_id, review);
      }
    }

    return (vocabulary ?? [])
      .filter((item) => {
        const latestReview = latestReviewByVocabulary.get(item.id);
        return !latestReview || new Date(latestReview.next_review_at) <= now;
      })
      .slice(0, limit) as VocabularyItem[];
}

export async function addVocabulary(word: string, meaning: string): Promise<VocabularyItem> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }
  if (!user) {
    throw new Error('Sesi login tidak ditemukan.');
  }

  const { data, error } = await supabase
    .from('vocabulary')
    .insert({
      user_id: user.id,
      word: word.trim(),
      meaning: meaning.trim(),
      mastery_status: 'new',
    })
    .select('id, word, meaning, topic, mastery_status, is_favorite, is_difficult')
    .single();

  if (error) {
    throw error;
  }

  return data as VocabularyItem;
}

export async function recordVocabularyReview(
  item: VocabularyItem,
  rating: ReviewRating,
  reviewedAt = new Date(),
  previousEaseFactor = 2.5,
  previousIntervalDays = 0,
): Promise<ReviewSchedule> {
  const schedule = scheduleReview(
    rating,
    reviewedAt,
    previousEaseFactor,
    previousIntervalDays,
  );
  const { error } = await supabase.rpc('record_vocabulary_review', {
    p_vocabulary_id: item.id,
    p_rating: rating,
    p_reviewed_at: reviewedAt.toISOString(),
    p_next_review_at: schedule.nextReviewAt,
    p_ease_factor: schedule.easeFactor,
    p_interval_days: schedule.intervalDays,
  });

  if (error) {
    throw error;
  }

  return schedule;
}
