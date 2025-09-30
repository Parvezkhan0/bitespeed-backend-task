// src/database.ts (Fixed for Render/Supabase)
import { Sequelize } from 'sequelize';

// Remove ?family=4 from your DATABASE_URL - it's not a valid PostgreSQL parameter
const databaseUrl = process.env.DATABASE_URL || 
  `postgresql://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:5432/${process.env.DB_NAME}`;

export const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  
  // Force IPv4 connection - THIS is where you configure it
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false,
    // Add keepAlive for better connection stability
    keepAlive: true,
    keepAliveInitialDelayMs: 10000,
  },
  
  // Connection pool settings for production
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  
  logging: process.env.NODE_ENV === 'development' ? console.log : false
});

// Test connection on startup
sequelize.authenticate()
  .then(() => {
    console.log('✅ Database connection established successfully.');
  })
  .catch((err) => {
    console.error('❌ Unable to connect to the database:', err);
  });