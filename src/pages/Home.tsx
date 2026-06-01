import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSiteContent } from '../lib/api';

export default function Home() {
  const navigate = useNavigate();
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const data = await getSiteContent();
        setContent(data);
      } catch (error) {
        console.error('Error loading site content:', error);
      } finally {
        setLoading(false);
      }
    };
    loadContent();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-primary">Maribel Alba</div>
          <div className="space-x-4">
            <button
              onClick={() => navigate('/#gallery')}
              className="text-gray-700 hover:text-primary transition"
            >
              Galería
            </button>
            <button
              onClick={() => navigate('/#about')}
              className="text-gray-700 hover:text-primary transition"
            >
              Acerca de
            </button>
            <button
              onClick={() => navigate('/admin')}
              className="bg-primary text-white px-4 py-2 rounded hover:bg-opacity-90 transition"
            >
              Admin
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-secondary text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">{content?.hero_title || 'Galería de Arte'}</h1>
          <p className="text-xl opacity-90">{content?.hero_subtitle || 'Obras de arte restauradas y originales'}</p>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="max-w-7xl mx-auto py-20 px-4">
        <h2 className="text-4xl font-bold text-center mb-12 text-primary">Mis Obras</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">Cargando galería...</p>
            </div>
          ) : (
            <p className="col-span-full text-center text-gray-500">Galería en construcción</p>
          )}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="bg-gray-50 py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-8 text-primary">Acerca de Mí</h2>
          <p className="text-lg text-gray-700 leading-relaxed text-center">
            {content?.about_text || 'Bienvenido a mi galería de arte. Aquí encontrarás mis obras y proyectos de restauración.'}
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-white py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p>&copy; 2024 Maribel Alba. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
