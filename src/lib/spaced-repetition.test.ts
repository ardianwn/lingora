import { scheduleReview } from './spaced-repetition';

describe('scheduleReview', () => {
  const reviewedAt = new Date('2026-01-01T00:00:00.000Z');

  it('repeats immediately after again', () => {
    expect(scheduleReview('again', reviewedAt, 2.5, 4)).toEqual({
      easeFactor: 2.3,
      intervalDays: 0,
      nextReviewAt: '2026-01-01T00:00:00.000Z',
    });
  });

  it('increases the interval deterministically for good', () => {
    expect(scheduleReview('good', reviewedAt, 2.5, 2)).toEqual({
      easeFactor: 2.5,
      intervalDays: 5,
      nextReviewAt: '2026-01-06T00:00:00.000Z',
    });
  });
});
