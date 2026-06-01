import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';

const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'paintings', label: 'Obras' },
    { id: 'categories', label: 'Clasificaciones' },
    { id: 'blog', label: 'Diario' },
    { id: 'content', label: 'Textos' },
    { id: 'messages', label: 'Mensajes' },
    { id: 'restoration', label: 'Solicitudes' },
    { id: 'showcases', label: 'Restauradora' },
    { id: 'users', label: 'Usuarios' },
    { id: 'photos', label: 'Fotos' },
  ];

  return (
    <>
      <Helmet>
        <title>Panel de Administración - Galería Maribel Alba</title>
      </Helmet>
      <div className="min-h-screen py-24">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-display italic mb-8">Panel de Administración</h1>
          <div className="flex flex-wrap gap-2 mb-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded ${
                  activeTab === tab.id ? 'bg-primary text-white' : 'bg-muted'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            {activeTab === 'dashboard' && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Estadísticas</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-muted p-4 rounded">
                    <h3 className="font-semibold">Obras</h3>
                    <p className="text-2xl">25</p>
                  </div>
                  <div className="bg-muted p-4 rounded">
                    <h3 className="font-semibold">Mensajes</h3>
                    <p className="text-2xl">12</p>
                  </div>
                  <div className="bg-muted p-4 rounded">
                    <h3 className="font-semibold">Visitas</h3>
                    <p className="text-2xl">1,234</p>
                  </div>
                  <div className="bg-muted p-4 rounded">
                    <h3 className="font-semibold">Usuarios</h3>
                    <p className="text-2xl">5</p>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'paintings' && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Gestión de Obras</h2>
                <p>CRUD de obras aquí...</p>
              </div>
            )}
            {/* Agregar contenido para otras tabs */}
            {activeTab !== 'dashboard' && activeTab !== 'paintings' && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">{tabs.find(t => t.id === activeTab)?.label}</h2>
                <p>Contenido para {tabs.find(t => t.id === activeTab)?.label}...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Admin;