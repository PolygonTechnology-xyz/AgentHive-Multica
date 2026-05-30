export default () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3001,
  apiPrefix: process.env.API_PREFIX || 'api/v1',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  baseUrl: process.env.BASE_URL || `http://localhost:${process.env.PORT || 3001}/${process.env.API_PREFIX || 'api/v1'}`,
  fileSigningSecret: process.env.FILE_SIGNING_SECRET || (process.env.NODE_ENV === 'production' ? undefined : 'dev-file-signing-secret'),

  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    username: process.env.DB_USERNAME || 'agenthive',
    password: process.env.DB_PASSWORD || 'agenthive_pass',
    database: process.env.DB_DATABASE || 'agenthive',
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    logging: process.env.DB_LOGGING === 'true',
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'change-me',
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },

  cookie: {
    secret: process.env.COOKIE_SECRET || 'change-me',
  },

  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/v1/auth/google/callback',
  },

  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY || '',
    fromEmail: process.env.SENDGRID_FROM_EMAIL || 'noreply@agenthive.io',
  },

  ppay: {
    baseUrl: process.env.P_PAY_BASEURL || 'https://p-pay-api.dev-polygontech.xyz/api',
    mid: process.env.P_PAY_MERCHANT_MID || '',
    apiKey: process.env.P_PAY_APIKEY || '',
    apiSecret: process.env.P_PAY_API_SECRET || '',
    ipnUrl: process.env.P_PAY_IPN_URL || 'http://localhost:3001/api/v1/payments/ppay/ipn',
    successUrl: process.env.P_PAY_SUCCESS_URL || 'http://localhost:3000/payments/success',
    failUrl: process.env.P_PAY_FAIL_URL || 'http://localhost:3000/payments/failed',
    cancelUrl: process.env.P_PAY_CANCEL_URL || 'http://localhost:3000/payments/cancelled',
    timeoutMs: parseInt(process.env.P_PAY_TIMEOUT_MS, 10) || 30000,
  },

  payment: {
    gateway: process.env.PAYMENT_GATEWAY || 'mock',
    feePct: parseFloat(process.env.PLATFORM_FEE_PERCENT || '10'),
  },

});
