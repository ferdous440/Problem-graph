import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { MapExplorerPage } from './pages/MapExplorerPage';
import { RouteIntelligencePage } from './pages/RouteIntelligencePage';
import { SubmitProblemPage } from './pages/SubmitProblemPage';
import { UserDashboardPage } from './pages/UserDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { LoginPage } from './pages/LoginPage';

function MainApp() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const { user } = useAuth();

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-['Hind_Siliguri',sans-serif] text-slate-900 antialiased selection:bg-teal-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar currentPage={currentPage} onNavigate={handleNavigate} />

      {/* Main Page View */}
      <main className="flex-1">
        {currentPage === 'home' && <HomePage onNavigate={handleNavigate} />}
        {currentPage === 'explorer' && <MapExplorerPage />}
        {currentPage === 'route-intel' && <RouteIntelligencePage />}
        {currentPage === 'submit' && (
          <SubmitProblemPage
            onProblemSubmitted={() => handleNavigate('explorer')}
            onNavigate={handleNavigate}
          />
        )}
        {currentPage === 'user-dashboard' && <UserDashboardPage onNavigate={handleNavigate} />}
        {currentPage === 'admin-dashboard' && <AdminDashboardPage onNavigate={handleNavigate} />}
        {currentPage === 'about' && <AboutPage onNavigate={handleNavigate} />}
        {currentPage === 'contact' && <ContactPage />}
        {currentPage === 'login' && <LoginPage onNavigate={handleNavigate} />}
      </main>

      {/* Smart City Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
