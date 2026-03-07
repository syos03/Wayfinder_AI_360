// Environment configuration validation
export const ENV_CONFIG = {
  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || 'wayfinder-ai-super-secret-key-2025-hoangviet24',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  // SQL Server Configuration
  SQL_SERVER: process.env.SQL_SERVER || 'HOANGVIET24',
  SQL_DATABASE: process.env.SQL_DATABASE || 'WayfinderAI',
  SQL_TRUSTED_CONNECTION: process.env.SQL_TRUSTED_CONNECTION === 'true',
  SQL_DRIVER: process.env.SQL_DRIVER || 'ODBC Driver 17 for SQL Server',

  // Application Configuration
  NODE_ENV: process.env.NODE_ENV || 'development',
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'Wayfinder AI',
  APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',

  // API Configuration
  API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3000/api',
  PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',

  // Security
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || '12'),
  COOKIE_SECRET: process.env.COOKIE_SECRET || 'wayfinder-cookie-secret-2025',

  // Development
  DEBUG: process.env.NEXT_PUBLIC_DEBUG === 'true',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',

  // Database Connection String
  DATABASE_URL: process.env.DATABASE_URL || 
    `server=${process.env.SQL_SERVER || 'HOANGVIET24'};Database=${process.env.SQL_DATABASE || 'WayfinderAI'};Trusted_Connection=Yes;Driver={${process.env.SQL_DRIVER || 'ODBC Driver 17 for SQL Server'}};`
}

// Validation function
export function validateEnvironment(): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  // Check required environment variables
  if (!ENV_CONFIG.JWT_SECRET || ENV_CONFIG.JWT_SECRET.length < 32) {
    errors.push('JWT_SECRET must be at least 32 characters long')
  }

  if (!ENV_CONFIG.SQL_SERVER) {
    errors.push('SQL_SERVER is required')
  }

  if (!ENV_CONFIG.SQL_DATABASE) {
    errors.push('SQL_DATABASE is required')
  }

  if (!ENV_CONFIG.COOKIE_SECRET || ENV_CONFIG.COOKIE_SECRET.length < 16) {
    errors.push('COOKIE_SECRET must be at least 16 characters long')
  }

  // Validate bcrypt rounds
  if (ENV_CONFIG.BCRYPT_ROUNDS < 10 || ENV_CONFIG.BCRYPT_ROUNDS > 15) {
    errors.push('BCRYPT_ROUNDS should be between 10 and 15')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Log environment status (only in development)
if (ENV_CONFIG.NODE_ENV === 'development' && ENV_CONFIG.DEBUG) {
  console.log('🔧 Environment Configuration Loaded:')
  console.log('  NODE_ENV:', ENV_CONFIG.NODE_ENV)
  console.log('  APP_NAME:', ENV_CONFIG.APP_NAME)
  console.log('  SQL_SERVER:', ENV_CONFIG.SQL_SERVER)
  console.log('  SQL_DATABASE:', ENV_CONFIG.SQL_DATABASE)
  console.log('  JWT_SECRET:', ENV_CONFIG.JWT_SECRET ? '✅ Set' : '❌ Missing')
  console.log('  DEBUG:', ENV_CONFIG.DEBUG)
  
  const validation = validateEnvironment()
  if (!validation.isValid) {
    console.warn('⚠️ Environment validation errors:')
    validation.errors.forEach(error => console.warn('  -', error))
  } else {
    console.log('✅ Environment validation passed')
  }
}
