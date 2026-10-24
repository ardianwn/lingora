type PublicConfig = {
  apiBaseUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
};

export function readRequiredUrl(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`${name} is required. Copy .env.example and configure the public API URL.`);
  }

  try {
    return new URL(value).toString().replace(/\/$/, '');
  } catch {
    throw new Error(`${name} must be a valid absolute URL.`);
  }
}

export function getPublicConfig(): PublicConfig {
  return {
    apiBaseUrl: readRequiredUrl(
      'EXPO_PUBLIC_API_BASE_URL',
      process.env.EXPO_PUBLIC_API_BASE_URL,
    ),
    supabaseUrl: readRequiredUrl(
      'EXPO_PUBLIC_SUPABASE_URL',
      process.env.EXPO_PUBLIC_SUPABASE_URL,
    ),
    supabaseAnonKey: readRequiredValue(
      'EXPO_PUBLIC_SUPABASE_ANON_KEY',
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    ),
  };
}

export function readRequiredValue(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`${name} is required. Copy .env.example and configure the public value.`);
  }

  return value;
}
