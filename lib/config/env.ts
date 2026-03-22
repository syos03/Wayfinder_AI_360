// Environment configuration validation
export function getEnvConfig() {
  const sqlServer = process.env.SQL_SERVER || 'HOANGVIET24'
  const sqlDatabase = process.env.SQL_DATABASE || 'WayfinderAI'
  const sqlDriver = process.env.SQL_DRIVER || 'ODBC Driver 17 for SQL Server'

  return {
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

    SQL_SERVER: sqlServer,
    SQL_DATABASE: sqlDatabase,
    SQL_TRUSTED_CONNECTION: process.env.SQL_TRUSTED_CONNECTION === 'true',
    SQL_DRIVER: sqlDriver,

    NODE_ENV: process.env.NODE_ENV || 'development',
    APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'Wayfinder AI',
    APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',

    API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3000/api',
    PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',

    BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || '12'),
    COOKIE_SECRET: process.env.COOKIE_SECRET,

    DEBUG: process.env.NEXT_PUBLIC_DEBUG === 'true',
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',

    DATABASE_URL:
      process.env.DATABASE_URL ||
      `server=${sqlServer};Database=${sqlDatabase};Trusted_Connection=Yes;Driver={${sqlDriver}};`,
  }
}

export const ENV_CONFIG = getEnvConfig()

export function validateEnvironment(): { isValid: boolean; errors: string[] } {
  const env = getEnvConfig()
  const errors: string[] = []

  if (!env.JWT_SECRET || env.JWT_SECRET.length < 32) {
    errors.push('JWT_SECRET must be at least 32 characters long')
  }

  if (!env.SQL_SERVER) {
    errors.push('SQL_SERVER is required')
  }

  if (!env.SQL_DATABASE) {
    errors.push('SQL_DATABASE is required')
  }

  if (!env.COOKIE_SECRET || env.COOKIE_SECRET.length < 16) {
    errors.push('COOKIE_SECRET must be at least 16 characters long')
  }

  if (env.BCRYPT_ROUNDS < 10 || env.BCRYPT_ROUNDS > 15) {
    errors.push('BCRYPT_ROUNDS should be between 10 and 15')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

if (ENV_CONFIG.NODE_ENV === 'development' && ENV_CONFIG.DEBUG) {
  console.log('Environment configuration loaded:')
  console.log('  NODE_ENV:', ENV_CONFIG.NODE_ENV)
  console.log('  APP_NAME:', ENV_CONFIG.APP_NAME)
  console.log('  SQL_SERVER:', ENV_CONFIG.SQL_SERVER)
  console.log('  SQL_DATABASE:', ENV_CONFIG.SQL_DATABASE)
  console.log('  JWT_SECRET:', ENV_CONFIG.JWT_SECRET ? 'set' : 'missing')
  console.log('  DEBUG:', ENV_CONFIG.DEBUG)

  const validation = validateEnvironment()
  if (!validation.isValid) {
    console.warn('Environment validation errors:')
    validation.errors.forEach(error => console.warn('  -', error))
  } else {
    console.log('Environment validation passed')
  }
}
