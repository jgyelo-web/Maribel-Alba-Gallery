import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  login,
  getCurrentUser,
  getAdminPaintings,
  getAdminCategoryTypes,
  getAdminCategories,
  getAdminBlogPosts,
  getAdminUsers,
  getAdminSiteContent,
  getAdminContactMessages,
  getAdminRestorationRequests,
  getAdminRestorationShowcases,
  createPainting,
  updatePainting,
  deletePainting,
  createCategoryType,
  updateCategoryType,
  deleteCategoryType,
  createCategory,
  updateCategory,
  deleteCategory,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  createUser,
  updateUser,
  deleteUser,
  updateSiteContent,
  deleteContactMessage,
  createRestorationRequest,
  updateRestorationRequest,
  deleteRestorationRequest,
  createRestorationShowcase,
  updateRestorationShowcase,
  deleteRestorationShowcase,
} from '../lib/api';

export default function Admin() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<any>(null);

  // Data states
  const [paintings, setPaintings] = useState<any[]>([]);
  const [categoryTypes, setCategoryTypes] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [siteContent, setSiteContent] = useState<any>(null);
  const [contactMessages, setContactMessages] = useState<any[]>([]);
  const [restorationRequests, setRestorationRequests] = useState<any[]>([]);
  const [restorationShowcases, setRestorationShowcases] = useState<any[]>([]);

  // Check if already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('admin_token');
      if (token) {
        try {
          const currentUser = await getCurrentUser();
          setUser(currentUser.user);
          setIsLoggedIn(true);
          setActiveTab('dashboard');
          loadAllData();
        } catch (err) {
          localStorage.removeItem('admin_token');
          setIsLoggedIn(false);
          setLoading(false);
        }
      } else {
        setIsLoggedIn(false);
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const loadAllData = async () => {
    try {
      const results = await Promise.allSettled([
        getAdminPaintings(),
        getAdminCategoryTypes(),
        getAdminCategories(),
        getAdminBlogPosts(),
        getAdminUsers(),
        getAdminSiteContent(),
        getAdminContactMessages(),
        getAdminRestorationRequests(),
        getAdminRestorationShowcases(),
      ]);

      if (results[0].status === 'fulfilled') setPaintings(results[0].value);
      if (results[1].status === 'fulfilled') setCategoryTypes(results[1].value);
      if (results[2].status === 'fulfilled') setCategories(results[2].value);
      if (results[3].status === 'fulfilled') setBlogPosts(results[3].value);
      if (results[4].status === 'fulfilled') setUsers(results[4].value);
      if (results[5].status === 'fulfilled') setSiteContent(results[5].value);
      if (results[6].status === 'fulfilled') setContactMessages(results[6].value);
      if (results[7].status === 'fulfilled') setRestorationRequests(results[7].value);
      if (results[8].status === 'fulfilled') setRestorationShowcases(results[8].value);

      setLoading(false);
    } catch (err) {
      console.error('Error loading admin data:', err);
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(email, password);
      localStorage.setItem('admin_token', response.token);
      setUser(response.user);
      setIsLoggedIn(true);
      setActiveTab('dashboard');
      setEmail('');
      setPassword('');
      await loadAllData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setIsLoggedIn(false);
    setUser(null);
    setActiveTab('dashboard');
    setEmail('');
    setPassword('');
  };

  if (loading && !isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h1 className="text-3xl font-bold text-center mb-8 text-primary">Panel de Administración</h1>

          {error && <div className="bg-red-50 text-red-700 p-4 rounded mb-6">{error}</div>}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Correo Electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-2 rounded-lg hover:bg-opacity-90 transition disabled:opacity-50"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          <p className="text-center text-gray-600 mt-6">
            <button
              onClick={() => navigate('/')}
              className="text-primary hover:underline"
            >
              Volver a la web
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Panel de Administración</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="text-gray-700 hover:text-primary transition"
            >
              Volver a la web
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {success && <div className="bg-green-50 text-green-700 p-4 rounded mb-6">{success}</div>}
        {error && <div className="bg-red-50 text-red-700 p-4 rounded mb-6">{error}</div>}

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {['dashboard', 'paintings', 'categories', 'blog', 'users', 'content', 'messages', 'restoration'].map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {tab === 'dashboard' && 'Dashboard'}
                {tab === 'paintings' && 'Obras'}
                {tab === 'categories' && 'Categorías'}
                {tab === 'blog' && 'Blog'}
                {tab === 'users' && 'Usuarios'}
                {tab === 'content' && 'Contenido'}
                {tab === 'messages' && 'Mensajes'}
                {tab === 'restoration' && 'Restauración'}
              </button>
            )
          )}
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow p-6">
          {activeTab === 'dashboard' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Bienvenido, {user?.name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <p className="text-gray-600 text-sm">Obras</p>
                  <p className="text-3xl font-bold text-blue-600">{paintings.length}</p>
                </div>
                <div className="bg-green-50 p-6 rounded-lg">
                  <p className="text-gray-600 text-sm">Categorías</p>
                  <p className="text-3xl font-bold text-green-600">{categories.length}</p>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg">
                  <p className="text-gray-600 text-sm">Posts de Blog</p>
                  <p className="text-3xl font-bold text-purple-600">{blogPosts.length}</p>
                </div>
                <div className="bg-orange-50 p-6 rounded-lg">
                  <p className="text-gray-600 text-sm">Mensajes</p>
                  <p className="text-3xl font-bold text-orange-600">{contactMessages.length}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'paintings' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Gestionar Obras</h2>
              <p className="text-gray-600">Sección de gestión de obras en construcción...</p>
            </div>
          )}

          {activeTab === 'categories' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Gestionar Categorías</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {categoryTypes.length > 0 ? (
                  categoryTypes.map((type) => (
                    <div key={type.id} className="border border-gray-200 p-4 rounded">
                      <h3 className="font-bold">{type.name}</h3>
                      <p className="text-sm text-gray-500">Tipo de categoría</p>
                    </div>
                  ))
                ) : (
                  <p className="col-span-full text-gray-500">No hay tipos de categoría aún.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'blog' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Gestionar Blog</h2>
              <p className="text-gray-600">Sección de gestión de blog en construcción...</p>
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Gestionar Usuarios</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Nombre</th>
                      <th className="text-left py-2">Email</th>
                      <th className="text-left py-2">Rol</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length > 0 ? (
                      users.map((u) => (
                        <tr key={u.id} className="border-b hover:bg-gray-50">
                          <td className="py-2">{u.display_name}</td>
                          <td className="py-2">{u.email}</td>
                          <td className="py-2">{u.role}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="py-4 text-center text-gray-500">
                          No hay usuarios aún.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'content' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Contenido del Sitio</h2>
              <p className="text-gray-600">Sección de gestión de contenido en construcción...</p>
            </div>
          )}

          {activeTab === 'messages' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Mensajes de Contacto</h2>
              <div className="space-y-4">
                {contactMessages.length > 0 ? (
                  contactMessages.map((msg) => (
                    <div key={msg.id} className="border border-gray-200 p-4 rounded">
                      <p className="font-bold">{msg.name}</p>
                      <p className="text-sm text-gray-500">{msg.email}</p>
                      <p className="text-gray-700 mt-2">{msg.message}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No hay mensajes aún.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'restoration' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Solicitudes de Restauración</h2>
              <div className="space-y-4">
                {restorationRequests.length > 0 ? (
                  restorationRequests.map((req) => (
                    <div key={req.id} className="border border-gray-200 p-4 rounded">
                      <p className="font-bold">{req.name}</p>
                      <p className="text-sm text-gray-500">{req.email}</p>
                      <p className="text-gray-700 mt-2">{req.message}</p>
                      <p className="text-xs text-gray-400 mt-2">Estado: {req.status}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No hay solicitudes aún.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
