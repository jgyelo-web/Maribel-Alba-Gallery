import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/80 dark:bg-black/80 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-display italic text-primary">
          Galería Maribel Alba
        </Link>
        <nav className="hidden md:flex space-x-8">
          <Link to="/" className="hover:text-primary transition-colors">Obras</Link>
          <Link to="/sobre" className="hover:text-primary transition-colors">Sobre</Link>
          <Link to="/restauradora" className="hover:text-primary transition-colors">Restauradora</Link>
          <Link to="/diario" className="hover:text-primary transition-colors">Diario</Link>
          <Link to="/contacto" className="hover:text-primary transition-colors">Contacto</Link>
          <Link to="/admin" className="hover:text-primary transition-colors">Admin</Link>
        </nav>
        <button
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-black shadow-lg">
          <nav className="flex flex-col space-y-4 p-4">
            <Link to="/" onClick={() => setIsMenuOpen(false)}>Obras</Link>
            <Link to="/sobre" onClick={() => setIsMenuOpen(false)}>Sobre</Link>
            <Link to="/restauradora" onClick={() => setIsMenuOpen(false)}>Restauradora</Link>
            <Link to="/diario" onClick={() => setIsMenuOpen(false)}>Diario</Link>
            <Link to="/contacto" onClick={() => setIsMenuOpen(false)}>Contacto</Link>
            <Link to="/admin" onClick={() => setIsMenuOpen(false)}>Admin</Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;