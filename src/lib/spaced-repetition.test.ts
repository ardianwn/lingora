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

  it('keeps ease factor above the minimum after repeated hard reviews', () => {
    expect(scheduleReview('hard', reviewedAt, 1.3, 1)).toEqual({
      easeFactor: 1.3,
      intervalDays: 1,
      nextReviewAt: '2026-01-02T00:00:00.000Z',
    });
  });

  it('gives a new easy card a minimum two-day interval', () => {
    expect(scheduleReview('easy', reviewedAt, 2.5, 0)).toEqual({
      easeFactor: 2.65,
      intervalDays: 3,
      nextReviewAt: '2026-01-04T00:00:00.000Z',
    });
  });
});
