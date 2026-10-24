import { readRequiredUrl, readRequiredValue } from './env';

describe('readRequiredUrl', () => {
  it('normalizes a valid public API URL', () => {
    expect(readRequiredUrl('API_URL', 'https://api.example.test/')).toBe(
      'https://api.example.test',
    );
  });

  describe('readRequiredValue', () => {
    it('rejects missing public configuration', () => {
      expect(() => readRequiredValue('PUBLIC_KEY', undefined)).toThrow(
        'PUBLIC_KEY is required',
      );
    });
  });

  it('rejects missing configuration', () => {
    expect(() => readRequiredUrl('API_URL', undefined)).toThrow(
      'API_URL is required',
    );
  });

  it('rejects relative URLs', () => {
    expect(() => readRequiredUrl('API_URL', '/api')).toThrow(
      'API_URL must be a valid absolute URL',
    );
  });
});
