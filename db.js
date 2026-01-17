const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: String(process.env.DB_PASSWORD),
  database: 'auth_db',
});

module.exports = pool;