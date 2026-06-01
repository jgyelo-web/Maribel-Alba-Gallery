import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { usePaintings } from '../hooks/usePaintings';
import { useBlogPosts } from '../hooks/useBlog';

const Home: React.FC = () => {
  const { data: paintings, isLoading: paintingsLoading } = usePaintings();
  const { data: posts, isLoading: postsLoading } = useBlogPosts();

  const featuredPaintings = paintings?.filter((painting) => painting.featured).slice(0, 3) ?? [];
  const latestPosts = posts?.slice(0, 3) ?? [];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ArtGallery',
    name: 'Galería Maribel Alba',
    description: 'Portafolio de la artista plástica y restauradora Maribel Alba',
    url: 'https://galeriamaribelalba.com',
    sameAs: [
      'https://facebook.com/maribelalba',
      'https://instagram.com/maribelalba',
    ],
  };

  return (
    <>
      <Helmet>
        <title>Galería Maribel Alba - Portafolio de Arte</title>
        <meta name="description" content="Descubre las obras de Maribel Alba, artista plástica y restauradora. Galería en línea con pinturas, esculturas y servicios de restauración." />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
      <div className="min-h-screen">
        <section className="h-screen flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: 'url(/hero-image.jpg)' }}>
          <div className="text-center text-white">
            <h1 className="text-5xl font-display italic mb-4">Galería Maribel Alba</h1>
            <p className="text-xl mb-8">Arte que trasciende el tiempo</p>
            <Link to="/diario" className="bg-primary px-8 py-3 rounded hover:bg-primary/80 transition-colors">
              Explorar Obras
            </Link>
          </div>
        </section>

        <section className="py-24">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-display italic text-center mb-12">Obras Destacadas</h2>
            <div className="flex space-x-8 overflow-x-auto">
              {paintingsLoading ? (
                <p className="text-center w-full">Cargando obras...</p>
              ) : featuredPaintings.length > 0 ? (
                featuredPaintings.map((painting) => (
                  <Link key={painting.id} to={`/obra/${painting.id}`} className="flex-shrink-0 w-80 h-60 bg-muted rounded overflow-hidden">
                    <img src={painting.image_url} alt={painting.title} className="w-full h-full object-cover" />
                  </Link>
                ))
              ) : (
                <p className="text-center w-full">No hay obras destacadas disponibles.</p>
              )}
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-display italic text-center mb-12">Galería</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {paintingsLoading ? (
                <p className="text-center w-full">Cargando galería...</p>
              ) : paintings?.length ? (
                paintings.slice(0, 6).map((painting) => (
                  <Link key={painting.id} to={`/obra/${painting.id}`} className="block bg-muted rounded-lg overflow-hidden h-80">
                    <img src={painting.image_url} alt={painting.title} className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
                  </Link>
                ))
              ) : (
                <p className="text-center w-full">No hay obras para mostrar.</p>
              )}
            </div>
          </div>
        </section>

        <section className="py-24 bg-muted">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-display italic text-center mb-12">Sobre la Artista</h2>
            <p className="text-center max-w-2xl mx-auto">
              Maribel Alba es una artista plástica y restauradora con años de experiencia elaborando obras únicas y respetando la memoria de cada pieza.
            </p>
          </div>
        </section>

        <section className="py-24">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-display italic text-center mb-12">Restauradora</h2>
            <p className="text-center max-w-2xl mx-auto mb-8">
              Servicios profesionales de restauración de obras de arte con técnicas cuidadosas y sensibilidad museográfica.
            </p>
            <Link to="/contacto" className="bg-primary px-8 py-3 rounded hover:bg-primary/80 transition-colors">
              Solicitar Presupuesto
            </Link>
          </div>
        </section>

        <section className="py-24 bg-muted">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-display italic text-center mb-12">Diario de Taller</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {postsLoading ? (
                <p className="text-center w-full">Cargando entradas...</p>
              ) : latestPosts.length ? (
                latestPosts.map((post) => (
                  <Link key={post.id} to={`/diario/${post.id}`} className="bg-white rounded p-6 hover:shadow-lg transition-shadow">
                    <h3 className="font-semibold mb-2">{post.title}</h3>
                    <p className="text-sm text-muted">{post.excerpt}</p>
                  </Link>
                ))
              ) : (
                <p className="text-center w-full">No hay entradas publicadas aún.</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;