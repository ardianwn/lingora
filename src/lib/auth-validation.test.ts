import { validateEmail, validatePassword } from './auth-validation';

describe('auth validation', () => {
  it('requires a valid email address', () => {
    expect(validateEmail('')).toBe('Email wajib diisi.');
    expect(validateEmail('invalid')).toBe('Masukkan alamat email yang valid.');
    expect(validateEmail('learner@example.com')).toBeNull();
  });

  it('requires a password with at least eight characters', () => {
    expect(validatePassword('short')).toBe('Password minimal 8 karakter.');
    expect(validatePassword('long-enough')).toBeNull();
  });
});
