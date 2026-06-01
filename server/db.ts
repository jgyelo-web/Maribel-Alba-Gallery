import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

let mysqlPool: mysql.Pool | null = null;
let dbInitialized = false;

mysqlPool = mysql.createPool({
  host: process.env.DB_HOST ?? '127.0.0.1',
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME ?? 'maribel_alba',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

export const query = async <T = any>(sql: string, values: any[] = []) => {
  if (!mysqlPool) throw new Error('MySQL pool not initialized');
  const [rows] = await mysqlPool.query(sql, values) as any;
  return rows as T[];
};

const initDatabase = async () => {
  if (dbInitialized) return;
  
  try {
    await query(`CREATE TABLE IF NOT EXISTS profiles (
      id VARCHAR(36) PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      display_name VARCHAR(255) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(16) DEFAULT 'user',
      email_verified TINYINT(1) DEFAULT 0,
      avatar_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`);

    await query(`CREATE TABLE IF NOT EXISTS paintings (
      id VARCHAR(36) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      image_url TEXT,
      category_id VARCHAR(36),
      featured TINYINT(1) DEFAULT 0,
      price DECIMAL(10,2),
      dimensions VARCHAR(255),
      technique VARCHAR(255),
      year INT,
      view_count INT DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`);

    await query(`CREATE TABLE IF NOT EXISTS category_types (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`);

    await query(`CREATE TABLE IF NOT EXISTS categories (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255),
      type_id VARCHAR(36),
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`);

    await query(`CREATE TABLE IF NOT EXISTS blog_posts (
      id VARCHAR(36) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      content TEXT,
      excerpt TEXT,
      image_url TEXT,
      document_urls TEXT,
      published TINYINT(1) DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`);

    await query(`CREATE TABLE IF NOT EXISTS restoration_showcases (
      id VARCHAR(36) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      before_image TEXT,
      after_image TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`);

    await query(`CREATE TABLE IF NOT EXISTS restoration_requests (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(255),
      message TEXT NOT NULL,
      status VARCHAR(50) DEFAULT 'pendiente',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`);

    await query(`CREATE TABLE IF NOT EXISTS about_photos (
      id VARCHAR(36) PRIMARY KEY,
      image_url TEXT NOT NULL,
      caption TEXT NOT NULL,
      order_index INT DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`);

    await query(`CREATE TABLE IF NOT EXISTS contact_messages (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    await query(`CREATE TABLE IF NOT EXISTS site_content (
      id VARCHAR(36) PRIMARY KEY,
      hero_title TEXT,
      hero_subtitle TEXT,
      about_text TEXT,
      legal_notice TEXT,
      privacy_policy TEXT,
      cookie_policy TEXT,
      blog_visible TINYINT(1) DEFAULT 0,
      restoration_visible TINYINT(1) DEFAULT 0,
      newsletter_visible TINYINT(1) DEFAULT 0,
      social_facebook TEXT,
      social_instagram TEXT,
      social_twitter TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`);

    await query(`CREATE TABLE IF NOT EXISTS audit_logs (
      id VARCHAR(36) PRIMARY KEY,
      event_type VARCHAR(255) NOT NULL,
      user_id VARCHAR(36) NOT NULL,
      details TEXT,
      timestamp DATETIME NOT NULL
    )`);

    const defaults = await query('SELECT id FROM category_types LIMIT 1');
    if (Array.isArray(defaults) && defaults.length === 0) {
      const defaultTypes = [
        { id: crypto.randomUUID(), name: 'Estilo Artístico' },
        { id: crypto.randomUUID(), name: 'Género Temático' },
        { id: crypto.randomUUID(), name: 'Formato Físico' },
      ];
      for (const type of defaultTypes) {
        await query('INSERT INTO category_types (id, name) VALUES (?, ?)', [type.id, type.name]);
      }
    }
    
    dbInitialized = true;
    console.log('✓ Base de datos MySQL inicializada correctamente');
  } catch (error) {
    console.error('Error inicializando la base de datos MySQL:', error);
    throw error;
  }
};

// Inicializar la BD en background cuando el servidor esté listo
export const ensureDatabaseInitialized = async () => {
  if (!dbInitialized) {
    await initDatabase();
  }
};

// Intenta inicializar en background sin bloquear el startup
initDatabase().catch((error) => {
  const code = (error as any)?.code || 'UNKNOWN';
  console.warn('⚠ Base de datos no disponible al iniciar:', code);
  console.warn('   Asegúrate de que MySQL esté corriendo en', process.env.DB_HOST || '127.0.0.1');
  console.warn('   Puerto:', process.env.DB_PORT || 3306);
  console.warn('   Usuario:', process.env.DB_USER || 'root');
});
