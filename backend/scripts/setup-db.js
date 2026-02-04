/**
 * ResQ Meal – Database setup
 * Creates the database and runs schema + seed for all modes (restaurant, ngo, volunteer).
 * Requires MySQL running and backend/.env with DB_HOST, DB_USER, DB_PASSWORD.
 *
 * Usage: npm run db:setup   (from backend folder)
 */

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const mysql = require('mysql2/promise');

const DB_NAME = process.env.DB_NAME || 'resqmeal_db';

async function run() {
  const baseConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  };

  let conn;
  try {
    console.log('Connecting to MySQL...');
    conn = await mysql.createConnection({ ...baseConfig });
    console.log('Creating database', DB_NAME, '...');
    await conn.query(`DROP DATABASE IF EXISTS \`${DB_NAME}\``);
    await conn.query(`CREATE DATABASE \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await conn.query(`USE \`${DB_NAME}\``);

    const schemaPath = path.join(__dirname, '..', 'config', 'database.sql');
    const seedPath = path.join(__dirname, '..', 'config', 'seed.sql');

    if (!fs.existsSync(schemaPath)) {
      throw new Error('Schema not found: config/database.sql');
    }
    if (!fs.existsSync(seedPath)) {
      throw new Error('Seed not found: config/seed.sql');
    }

    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    const seedSql = fs.readFileSync(seedPath, 'utf8');

    console.log('Running schema...');
    await conn.query(schemaSql);
    console.log('Running seed...');
    await conn.query(seedSql);

    console.log('Database setup complete. You can sign in with:');
    console.log('  volunteer@community.com / password123');
    console.log('  chef@kitchen.com / password123');
    console.log('  ngo@savechildren.com / password123');
    console.log('  baker@artisan.com / password123');
  } catch (err) {
    console.error('Setup failed:', err.message);
    if (err.code === 'ECONNREFUSED') {
      console.error('Ensure MySQL is running and DB_HOST/DB_PORT in backend/.env are correct.');
    } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('Check DB_USER and DB_PASSWORD in backend/.env');
    }
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
}

run();
