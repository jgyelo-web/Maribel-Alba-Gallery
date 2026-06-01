import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import multer from 'multer';
import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';
import { query, ensureDatabaseInitialized } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 4000;
const JWT_SECRET = process.env.JWT_SECRET ?? 'supersecret_jwt_key_for_development_only';

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Almacenamiento de archivos en memoria
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

// Middleware de autenticación
const authenticate = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No autorizado' });
  }

  const token = authHeader.substring(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    (req as any).user = payload;
    next();
  } catch {
    res.status(401).json({ message: 'Token inválido' });
  }
};

// Health Check
app.get('/api/health', async (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rutas públicas
app.get('/api/site-content', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM site_content ORDER BY updated_at DESC LIMIT 1');
    res.json(rows[0] ?? {});
  } catch (error: any) {
    console.error('Error fetching site content:', error);
    res.status(500).json({ message: 'Error fetching site content' });
  }
});

// Auth
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    await ensureDatabaseInitialized();
    const rows = await query('SELECT id, display_name, email, password_hash, role FROM profiles WHERE email = ?', [email]);
    const user = rows[0] as any;

    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { sub: user.id, email: user.email, role: user.role, name: user.display_name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user: { id: user.id, display_name: user.display_name, email: user.email, role: user.role } });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error al iniciar sesión' });
  }
});

app.get('/api/auth/me', authenticate, (req, res) => {
  res.json({ user: (req as any).user });
});

// Admin Paintings
app.get('/api/admin/paintings', authenticate, async (req, res) => {
  try {
    const rows = await query('SELECT * FROM paintings ORDER BY created_at DESC');
    res.json(rows);
  } catch (error: any) {
    console.error('Error fetching paintings:', error);
    res.status(500).json({ message: 'Error fetching paintings' });
  }
});

app.post('/api/admin/paintings', authenticate, async (req, res) => {
  const { title, year, description, image_url, featured, view_count } = req.body;
  if (!title || !year || !description) {
    return res.status(400).json({ message: 'Título, año y descripción son requeridos' });
  }
  try {
    const id = crypto.randomUUID();
    await query(
      'INSERT INTO paintings (id, title, year, description, image_url, featured, view_count) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, title, year, description, image_url ?? '', featured ? 1 : 0, view_count ?? 0]
    );
    res.status(201).json({ id });
  } catch (error: any) {
    console.error('Error creating painting:', error);
    res.status(500).json({ message: 'Error creating painting' });
  }
});

app.put('/api/admin/paintings/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { title, year, description, image_url, featured, view_count } = req.body;
  try {
    await query(
      'UPDATE paintings SET title = ?, year = ?, description = ?, image_url = ?, featured = ?, view_count = ? WHERE id = ?',
      [title, year, description, image_url ?? '', featured ? 1 : 0, view_count ?? 0, id]
    );
    res.json({ message: 'Obra actualizada' });
  } catch (error: any) {
    console.error('Error updating painting:', error);
    res.status(500).json({ message: 'Error updating painting' });
  }
});

app.delete('/api/admin/paintings/:id', authenticate, async (req, res) => {
  try {
    await query('DELETE FROM paintings WHERE id = ?', [req.params.id]);
    res.json({ message: 'Obra eliminada' });
  } catch (error: any) {
    console.error('Error deleting painting:', error);
    res.status(500).json({ message: 'Error deleting painting' });
  }
});

// Categories & Category Types
app.get('/api/admin/categories', authenticate, async (req, res) => {
  try {
    const rows = await query(
      'SELECT categories.*, category_types.id AS type_id, category_types.name AS type_name FROM categories LEFT JOIN category_types ON categories.type_id = category_types.id'
    );
    res.json(
      rows.map((row: any) => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        type: { id: row.type_id, name: row.type_name },
      }))
    );
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Error fetching categories' });
  }
});

app.get('/api/admin/category-types', authenticate, async (req, res) => {
  try {
    const rows = await query('SELECT * FROM category_types ORDER BY name ASC');
    res.json(rows);
  } catch (error: any) {
    console.error('Error fetching category types:', error);
    res.status(500).json({ message: 'Error fetching category types' });
  }
});

app.post('/api/admin/category-types', authenticate, async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Nombre de tipo de clasificación es requerido' });
  }
  try {
    const id = crypto.randomUUID();
    await query('INSERT INTO category_types (id, name) VALUES (?, ?)', [id, name]);
    res.status(201).json({ id });
  } catch (error: any) {
    console.error('Error creating category type:', error);
    res.status(500).json({ message: 'Error creating category type' });
  }
});

app.put('/api/admin/category-types/:id', authenticate, async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Nombre de tipo de clasificación es requerido' });
  }
  try {
    await query('UPDATE category_types SET name = ? WHERE id = ?', [name, req.params.id]);
    res.json({ message: 'Tipo de clasificación actualizado' });
  } catch (error: any) {
    console.error('Error updating category type:', error);
    res.status(500).json({ message: 'Error updating category type' });
  }
});

app.delete('/api/admin/category-types/:id', authenticate, async (req, res) => {
  try {
    await query('DELETE FROM category_types WHERE id = ?', [req.params.id]);
    res.json({ message: 'Tipo de clasificación eliminado' });
  } catch (error: any) {
    console.error('Error deleting category type:', error);
    res.status(500).json({ message: 'Error deleting category type' });
  }
});

app.post('/api/admin/categories', authenticate, async (req, res) => {
  const { name, slug, type_id } = req.body;
  if (!name || !slug || !type_id) {
    return res.status(400).json({ message: 'Nombre, slug y tipo son requeridos' });
  }
  try {
    const id = crypto.randomUUID();
    await query('INSERT INTO categories (id, name, slug, type_id) VALUES (?, ?, ?, ?)', [id, name, slug, type_id]);
    res.status(201).json({ id });
  } catch (error: any) {
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Error creating category' });
  }
});

app.put('/api/admin/categories/:id', authenticate, async (req, res) => {
  const { name, slug, type_id } = req.body;
  try {
    await query('UPDATE categories SET name = ?, slug = ?, type_id = ? WHERE id = ?', [name, slug, type_id, req.params.id]);
    res.json({ message: 'Categoría actualizada' });
  } catch (error: any) {
    console.error('Error updating category:', error);
    res.status(500).json({ message: 'Error updating category' });
  }
});

app.delete('/api/admin/categories/:id', authenticate, async (req, res) => {
  try {
    await query('DELETE FROM categories WHERE id = ?', [req.params.id]);
    res.json({ message: 'Categoría eliminada' });
  } catch (error: any) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Error deleting category' });
  }
});

// Blog Posts
app.get('/api/admin/blog-posts', authenticate, async (req, res) => {
  try {
    const rows = await query('SELECT * FROM blog_posts ORDER BY created_at DESC');
    res.json(rows);
  } catch (error: any) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({ message: 'Error fetching blog posts' });
  }
});

app.post('/api/admin/blog-posts', authenticate, async (req, res) => {
  const { title, content, excerpt, image_url, document_urls, published } = req.body;
  if (!title || !content || !excerpt) {
    return res.status(400).json({ message: 'Título, contenido y extracto son requeridos' });
  }
  try {
    const id = crypto.randomUUID();
    await query(
      'INSERT INTO blog_posts (id, title, content, excerpt, image_url, document_urls, published) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, title, content, excerpt, image_url ?? '', JSON.stringify(document_urls ?? []), published ? 1 : 0]
    );
    res.status(201).json({ id });
  } catch (error: any) {
    console.error('Error creating blog post:', error);
    res.status(500).json({ message: 'Error creating blog post' });
  }
});

app.put('/api/admin/blog-posts/:id', authenticate, async (req, res) => {
  const { title, content, excerpt, image_url, document_urls, published } = req.body;
  try {
    await query(
      'UPDATE blog_posts SET title = ?, content = ?, excerpt = ?, image_url = ?, document_urls = ?, published = ? WHERE id = ?',
      [title, content, excerpt, image_url ?? '', JSON.stringify(document_urls ?? []), published ? 1 : 0, req.params.id]
    );
    res.json({ message: 'Post actualizado' });
  } catch (error: any) {
    console.error('Error updating blog post:', error);
    res.status(500).json({ message: 'Error updating blog post' });
  }
});

app.delete('/api/admin/blog-posts/:id', authenticate, async (req, res) => {
  try {
    await query('DELETE FROM blog_posts WHERE id = ?', [req.params.id]);
    res.json({ message: 'Post eliminado' });
  } catch (error: any) {
    console.error('Error deleting blog post:', error);
    res.status(500).json({ message: 'Error deleting blog post' });
  }
});

// Site Content
app.get('/api/admin/site-content', authenticate, async (req, res) => {
  try {
    const rows = await query('SELECT * FROM site_content LIMIT 1');
    res.json(rows[0] ?? {});
  } catch (error: any) {
    console.error('Error fetching site content:', error);
    res.status(500).json({ message: 'Error fetching site content' });
  }
});

app.put('/api/admin/site-content', authenticate, async (req, res) => {
  try {
    const content = req.body;
    const existing = await query('SELECT id FROM site_content LIMIT 1');

    if (Array.isArray(existing) && existing.length > 0) {
      await query(
        'UPDATE site_content SET hero_title = ?, hero_subtitle = ?, about_text = ?, legal_notice = ?, privacy_policy = ?, cookie_policy = ?, blog_visible = ?, restoration_visible = ?, newsletter_visible = ?, social_facebook = ?, social_instagram = ?, social_twitter = ? WHERE id = ?',
        [
          content.hero_title,
          content.hero_subtitle,
          content.about_text,
          content.legal_notice,
          content.privacy_policy,
          content.cookie_policy,
          content.blog_visible ? 1 : 0,
          content.restoration_visible ? 1 : 0,
          content.newsletter_visible ? 1 : 0,
          content.social_facebook,
          content.social_instagram,
          content.social_twitter,
          existing[0].id,
        ]
      );
    } else {
      const id = crypto.randomUUID();
      await query(
        'INSERT INTO site_content (id, hero_title, hero_subtitle, about_text, legal_notice, privacy_policy, cookie_policy, blog_visible, restoration_visible, newsletter_visible, social_facebook, social_instagram, social_twitter) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          id,
          content.hero_title,
          content.hero_subtitle,
          content.about_text,
          content.legal_notice,
          content.privacy_policy,
          content.cookie_policy,
          content.blog_visible ? 1 : 0,
          content.restoration_visible ? 1 : 0,
          content.newsletter_visible ? 1 : 0,
          content.social_facebook,
          content.social_instagram,
          content.social_twitter,
        ]
      );
    }
    res.json({ message: 'Contenido actualizado' });
  } catch (error: any) {
    console.error('Error updating site content:', error);
    res.status(500).json({ message: 'Error updating site content' });
  }
});

// Contact Messages
app.get('/api/admin/contact-messages', authenticate, async (req, res) => {
  try {
    const rows = await query('SELECT * FROM contact_messages ORDER BY created_at DESC');
    res.json(rows);
  } catch (error: any) {
    console.error('Error fetching contact messages:', error);
    res.status(500).json({ message: 'Error fetching contact messages' });
  }
});

app.post('/api/contact-messages', async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Nombre, email y mensaje son requeridos' });
  }
  try {
    const id = crypto.randomUUID();
    await query('INSERT INTO contact_messages (id, name, email, message) VALUES (?, ?, ?, ?)', [
      id,
      name,
      email,
      message,
    ]);
    res.status(201).json({ id });
  } catch (error: any) {
    console.error('Error creating contact message:', error);
    res.status(500).json({ message: 'Error creating contact message' });
  }
});

app.delete('/api/admin/contact-messages/:id', authenticate, async (req, res) => {
  try {
    await query('DELETE FROM contact_messages WHERE id = ?', [req.params.id]);
    res.json({ message: 'Mensaje eliminado' });
  } catch (error: any) {
    console.error('Error deleting contact message:', error);
    res.status(500).json({ message: 'Error deleting contact message' });
  }
});

// Restoration Requests
app.get('/api/admin/restoration-requests', authenticate, async (req, res) => {
  try {
    const rows = await query('SELECT * FROM restoration_requests ORDER BY created_at DESC');
    res.json(rows);
  } catch (error: any) {
    console.error('Error fetching restoration requests:', error);
    res.status(500).json({ message: 'Error fetching restoration requests' });
  }
});

app.post('/api/restoration-requests', async (req, res) => {
  const { name, email, phone, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Nombre, email y mensaje son requeridos' });
  }
  try {
    const id = crypto.randomUUID();
    await query('INSERT INTO restoration_requests (id, name, email, phone, message) VALUES (?, ?, ?, ?, ?)', [
      id,
      name,
      email,
      phone ?? '',
      message,
    ]);
    res.status(201).json({ id });
  } catch (error: any) {
    console.error('Error creating restoration request:', error);
    res.status(500).json({ message: 'Error creating restoration request' });
  }
});

app.put('/api/admin/restoration-requests/:id', authenticate, async (req, res) => {
  const { status, notes } = req.body;
  try {
    await query('UPDATE restoration_requests SET status = ?, notes = ? WHERE id = ?', [status, notes, req.params.id]);
    res.json({ message: 'Solicitud actualizada' });
  } catch (error: any) {
    console.error('Error updating restoration request:', error);
    res.status(500).json({ message: 'Error updating restoration request' });
  }
});

app.delete('/api/admin/restoration-requests/:id', authenticate, async (req, res) => {
  try {
    await query('DELETE FROM restoration_requests WHERE id = ?', [req.params.id]);
    res.json({ message: 'Solicitud eliminada' });
  } catch (error: any) {
    console.error('Error deleting restoration request:', error);
    res.status(500).json({ message: 'Error deleting restoration request' });
  }
});

// Restoration Showcases
app.get('/api/admin/restoration-showcases', authenticate, async (req, res) => {
  try {
    const rows = await query('SELECT * FROM restoration_showcases ORDER BY created_at DESC');
    res.json(rows);
  } catch (error: any) {
    console.error('Error fetching restoration showcases:', error);
    res.status(500).json({ message: 'Error fetching restoration showcases' });
  }
});

app.post('/api/admin/restoration-showcases', authenticate, async (req, res) => {
  const { title, description, before_image, after_image } = req.body;
  if (!title || !description) {
    return res.status(400).json({ message: 'Título y descripción son requeridos' });
  }
  try {
    const id = crypto.randomUUID();
    await query(
      'INSERT INTO restoration_showcases (id, title, description, before_image, after_image) VALUES (?, ?, ?, ?, ?)',
      [id, title, description, before_image ?? '', after_image ?? '']
    );
    res.status(201).json({ id });
  } catch (error: any) {
    console.error('Error creating restoration showcase:', error);
    res.status(500).json({ message: 'Error creating restoration showcase' });
  }
});

app.put('/api/admin/restoration-showcases/:id', authenticate, async (req, res) => {
  const { title, description, before_image, after_image } = req.body;
  try {
    await query(
      'UPDATE restoration_showcases SET title = ?, description = ?, before_image = ?, after_image = ? WHERE id = ?',
      [title, description, before_image ?? '', after_image ?? '', req.params.id]
    );
    res.json({ message: 'Caso de restauración actualizado' });
  } catch (error: any) {
    console.error('Error updating restoration showcase:', error);
    res.status(500).json({ message: 'Error updating restoration showcase' });
  }
});

app.delete('/api/admin/restoration-showcases/:id', authenticate, async (req, res) => {
  try {
    await query('DELETE FROM restoration_showcases WHERE id = ?', [req.params.id]);
    res.json({ message: 'Caso de restauración eliminado' });
  } catch (error: any) {
    console.error('Error deleting restoration showcase:', error);
    res.status(500).json({ message: 'Error deleting restoration showcase' });
  }
});

// Users
app.get('/api/admin/users', authenticate, async (req, res) => {
  try {
    const rows = await query('SELECT id, display_name, email, role, email_verified, avatar_url FROM profiles');
    res.json(rows);
  } catch (error: any) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

app.post('/api/admin/users', authenticate, async (req, res) => {
  const { email, display_name, role, password, avatar_url } = req.body;

  if (!email || !display_name || !role || !password) {
    return res.status(400).json({ message: 'Email, nombre, rol y contraseña son requeridos' });
  }

  try {
    const existing = await query('SELECT id FROM profiles WHERE email = ?', [email]);
    if (Array.isArray(existing) && existing.length > 0) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    const id = crypto.randomUUID();
    const passwordHash = await bcrypt.hash(password, 10);

    await query(
      'INSERT INTO profiles (id, email, display_name, password_hash, role, avatar_url, email_verified, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
      [id, email, display_name, passwordHash, role, avatar_url ?? '', 0]
    );

    res.status(201).json({ id });
  } catch (error: any) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
});

app.put('/api/admin/users/:id', authenticate, async (req, res) => {
  const { display_name, role, avatar_url, email_verified } = req.body;
  try {
    await query(
      'UPDATE profiles SET display_name = ?, role = ?, avatar_url = ?, email_verified = ? WHERE id = ?',
      [display_name, role, avatar_url ?? '', email_verified ? 1 : 0, req.params.id]
    );
    res.json({ message: 'Usuario actualizado' });
  } catch (error: any) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
});

app.delete('/api/admin/users/:id', authenticate, async (req, res) => {
  try {
    await query('DELETE FROM profiles WHERE id = ?', [req.params.id]);
    res.json({ message: 'Usuario eliminado' });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
});

// File Upload
app.post('/api/storage/upload', authenticate, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file provided' });
  }

  try {
    const filename = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}-${req.file.originalname}`;
    const filepath = path.join('public', filename);

    // En una aplicación real, guardarías el archivo aquí
    // Por ahora, devolvemos una URL de ejemplo
    const url = `/public/${filename}`;

    res.json({ url });
  } catch (error: any) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: 'Error uploading file' });
  }
});

// Iniciar servidor
app.listen(PORT, async () => {
  console.log(`\n🎨 Servidor de Galería Maribel Alba ejecutándose en http://localhost:${PORT}`);
  console.log(`📍 Ambiente: ${process.env.NODE_ENV ?? 'development'}`);
  console.log(`🗄️  Base de datos: MySQL en ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}\n`);

  // Intenta inicializar la BD cuando el servidor está listo
  try {
    await ensureDatabaseInitialized();
  } catch (error) {
    console.warn('⚠️  Advertencia: Base de datos no inicializada. Algunas funciones pueden no estar disponibles.');
  }
});

export default app;
