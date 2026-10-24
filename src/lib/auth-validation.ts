export function validateEmail(email: string): string | null {
  const normalizedEmail = email.trim();
  if (!normalizedEmail) {
    return 'Email wajib diisi.';
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return 'Masukkan alamat email yang valid.';
  }

  return null;
}

export function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return 'Password minimal 8 karakter.';
  }

  return null;
}
