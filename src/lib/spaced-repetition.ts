export type ReviewRating = 'again' | 'hard' | 'good' | 'easy';

export type ReviewSchedule = {
  easeFactor: number;
  intervalDays: number;
  nextReviewAt: string;
};

export function scheduleReview(
  rating: ReviewRating,
  reviewedAt: Date,
  previousEaseFactor = 2.5,
  previousIntervalDays = 0,
): ReviewSchedule {
  const easeFactor = Math.max(
    1.3,
    previousEaseFactor +
      ({ again: -0.2, hard: -0.15, good: 0, easy: 0.15 }[rating] ?? 0),
  );
  const intervalDays =
    rating === 'again'
      ? 0
      : rating === 'hard'
        ? Math.max(1, Math.round(Math.max(previousIntervalDays, 1) * 1.2))
        : rating === 'easy'
          ? Math.max(2, Math.round(Math.max(previousIntervalDays, 1) * easeFactor * 1.3))
          : Math.max(1, Math.round(Math.max(previousIntervalDays, 1) * easeFactor));

  const nextReviewAt = new Date(reviewedAt);
  nextReviewAt.setUTCDate(nextReviewAt.getUTCDate() + intervalDays);

  return {
    easeFactor: Number(easeFactor.toFixed(2)),
    intervalDays,
    nextReviewAt: nextReviewAt.toISOString(),
  };
}
