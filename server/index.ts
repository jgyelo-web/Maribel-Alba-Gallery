import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { query } from './db.js';

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 4000);
const jwtSecret = process.env.JWT_SECRET ?? 'supersecret';

app.use(cors({ origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(process.cwd(), 'server', 'uploads')));

const upload = multer({ dest: path.join(process.cwd(), 'server', 'uploads') });

const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No autorizado' });
  }

  const token = authorization.replace('Bearer ', '');

  try {
    const payload = jwt.verify(token, jwtSecret) as Record<string, any>;
    (req as any).user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido' });
  }
};

app.get('/api/paintings', async (req, res) => {
  const rows = await query('SELECT * FROM paintings ORDER BY created_at DESC');
  res.json(rows);
});

app.get('/api/paintings/:id', async (req, res) => {
  const rows = await query('SELECT * FROM paintings WHERE id = ?', [req.params.id]);
  const painting = rows[0];
  if (!painting) return res.status(404).json({ message: 'Obra no encontrada' });
  res.json(painting);
});

app.get('/api/blog-posts', async (req, res) => {
  const rows = await query('SELECT * FROM blog_posts WHERE published = TRUE ORDER BY created_at DESC');
  res.json(rows);
});

app.get('/api/blog-posts/:id', async (req, res) => {
  const rows = await query('SELECT * FROM blog_posts WHERE id = ?', [req.params.id]);
  const post = rows[0];
  if (!post) return res.status(404).json({ message: 'Entrada no encontrada' });
  res.json(post);
});

app.post('/api/contact-messages', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Faltan parámetros obligatorios' });
  }

  const id = crypto.randomUUID();
  await query('INSERT INTO contact_messages (id, name, email, message) VALUES (?, ?, ?, ?)', [id, name, email, message]);
  res.status(201).json({ message: 'Mensaje recibido' });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email y contraseña son requeridos' });
  }

  const rows = await query('SELECT id, display_name, email, password_hash, role FROM profiles WHERE email = ?', [email]);
  const user = rows[0] as any;

  if (!user) {
    return res.status(401).json({ message: 'Credenciales inválidas' });
  }

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    return res.status(401).json({ message: 'Credenciales inválidas' });
  }

  const token = jwt.sign({ sub: user.id, email: user.email, role: user.role, name: user.display_name }, jwtSecret, {
    expiresIn: '8h',
  });

  res.json({ token, user: { id: user.id, display_name: user.display_name, email: user.email, role: user.role } });
});

app.get('/api/auth/me', authenticate, async (req, res) => {
  res.json({ user: (req as any).user });
});

app.post('/api/storage/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No se recibió ningún archivo' });
  }

  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${path.basename(req.file.path)}`;
  res.status(201).json({ url: fileUrl });
});

app.get('/api/site-content', async (req, res) => {
  const rows = await query('SELECT * FROM site_content ORDER BY updated_at DESC LIMIT 1');
  res.json(rows[0] ?? {});
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({ message: 'Error interno del servidor' });
});

app.listen(port, () => {
  console.log(`Backend escuchando en http://localhost:${port}`);
});
