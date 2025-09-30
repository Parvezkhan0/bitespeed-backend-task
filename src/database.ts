// src/database.ts (Updated for Render/Supabase)
import { Sequelize } from 'sequelize';

// 1. Prioritize DATABASE_URL (standard for cloud deployment).
//    Fall back to individual variables (DB_HOST, etc.) for local Docker testing.
const databaseUrl = process.env.DATABASE_URL || 
  `postgresql://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:5432/${process.env.DB_NAME}`;

export const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  
  // 2. CRITICAL: Add SSL options for connecting to remote cloud databases.
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true, 
      // This is often needed when connecting to cloud providers' self-signed certs
      rejectUnauthorized: false 
    } : false
  },
  logging: false
});