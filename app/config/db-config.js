function isProd () {
  return process.env.NODE_ENV === 'production'
}

const pool = {
  acquire: 360000,
  max: 10,
  min: 0
}

const dbConfig = {
  database: process.env.POSTGRES_DB || 'ffc_pay_submission',
  dialectOptions: {
    statement_timeout: 360000
  },
  host: process.env.POSTGRES_HOST || 'ffc-pay-submission-postgres',
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT || 5432,
  logging: process.env.POSTGRES_LOGGING || false,
  pool,
  schema: process.env.POSTGRES_SCHEMA_NAME || 'public',
  ssl: isProd(),
  username: process.env.POSTGRES_USERNAME
}

module.exports = {
  development: dbConfig,
  production: dbConfig,
  test: dbConfig
}
