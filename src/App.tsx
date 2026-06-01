import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import ContactPage from './pages/ContactPage';
import PaintingDetail from './pages/PaintingDetail';
import Admin from './pages/Admin';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/contacto" element={<ContactPage />} />
            <Route path="/obra/:id" element={<PaintingDetail />} />
            <Route path="/admin" element={<Admin />} />
            {/* Agregar más rutas según sea necesario */}
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;