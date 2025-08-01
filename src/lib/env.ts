// ✅ Validasi environment variables untuk keamanan
const requiredEnvVars = {
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  RECAPTCHA_SECRET_KEY: process.env.RECAPTCHA_SECRET_KEY,
} as const;

// Validasi semua required environment variables
for (const [key, value] of Object.entries(requiredEnvVars)) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

if (requiredEnvVars.JWT_SECRET!.length < 15) {
  throw new Error('JWT_SECRET must be at least 15 characters long for security');
}

// Type assertion setelah validasi untuk memastikan semua values ada
const validatedEnv = requiredEnvVars as {
  DATABASE_URL: string;
  JWT_SECRET: string;
  RECAPTCHA_SECRET_KEY: string;
};

export const env = validatedEnv;

// Export individual variables untuk kemudahan penggunaan
export const {
  DATABASE_URL,
  JWT_SECRET,
  RECAPTCHA_SECRET_KEY
} = env;