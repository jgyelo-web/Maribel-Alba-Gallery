-- SQL script to initialize MySQL for Maribel Alba
-- Run this after installing MySQL and connecting as a user with CREATE DATABASE privileges.

CREATE DATABASE IF NOT EXISTS maribel_alba
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE maribel_alba;

CREATE TABLE IF NOT EXISTS profiles (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(16) DEFAULT 'user',
  email_verified TINYINT(1) DEFAULT 0,
  avatar_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Admin user
-- Password: admin123
INSERT INTO profiles (id, email, display_name, password_hash, role, email_verified, created_at, updated_at)
VALUES (
  'admin-001',
  'admin@example.com',
  'Administrador',
  '$2b$10$N9qo8uLOickgx2ZMRZoMye1dUz3t4h5JBT9D5c1Z5qVWJBvtXRhve',
  'admin',
  1,
  NOW(),
  NOW()
)
ON DUPLICATE KEY UPDATE
  display_name = VALUES(display_name),
  role = VALUES(role),
  password_hash = VALUES(password_hash),
  email_verified = VALUES(email_verified),
  updated_at = VALUES(updated_at);
