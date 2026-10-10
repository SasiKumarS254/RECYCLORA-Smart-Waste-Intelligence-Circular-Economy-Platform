import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { CivicCarePage } from './pages/CivicCarePage';
import { WasteFlowPage } from './pages/WasteFlowPage';
import { CircuLabPage } from './pages/CircuLabPage';
import { EarthScopePage } from './pages/EarthScopePage';
import { AdminPage } from './pages/AdminPage';
import { ProfilePage } from './pages/ProfilePage';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | null>(null);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'login') setAuthMode('login');
      else if (hash === 'register') setAuthMode('register');
      else if (hash === 'profile') { setAuthMode(null); setActiveTab('profile'); }
      else if (['dashboard', 'civiccare', 'wasteflow', 'circulab', 'earthscope', 'admin', 'landing'].includes(hash)) {
        setAuthMode(null);
        setActiveTab(hash);
      }
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const getPageTitle = (tab: string) => {
    switch (tab) {
      case 'landing': return `Home — ${t('tagline')}`;
      case 'dashboard': return t('dashboard');
      case 'civiccare': return t('civiccare');
      case 'wasteflow': return t('wasteflow');
      case 'circulab': return t('circulab');
      case 'earthscope': return t('earthscope');
      case 'admin': return t('admin');
      case 'profile': return 'User Profile & Settings';
      default: return 'RECYCLORA Platform';
    }
  };

  // Auth pages rendering
  if (authMode === 'login') {
    return (
      <LoginPage
        onNavigateHome={() => { setAuthMode(null); window.location.hash = 'dashboard'; }}
        onNavigateRegister={() => setAuthMode('register')}
      />
    );
  }

  if (authMode === 'register') {
    return (
      <RegisterPage
        onNavigateHome={() => { setAuthMode(null); window.location.hash = 'dashboard'; }}
        onNavigateLogin={() => setAuthMode('login')}
      />
    );
  }

  // If on landing page (or user not logged in & wants landing)
  if (activeTab === 'landing' && !user) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
        <Navbar onToggleSidebar={() => setSidebarOpen(true)} currentPageTitle="Landing Page" />
        <div className="flex-1">
          <LandingPage
            onNavigateToAuth={(mode) => setAuthMode(mode)}
            onNavigateToApp={(tab) => {
              if (!user) setAuthMode('login');
              else setActiveTab(tab);
            }}
          />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">
      <Navbar
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        currentPageTitle={getPageTitle(activeTab)}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            if (tab === '#profile' || tab === 'profile') setActiveTab('profile');
            else setActiveTab(tab);
          }}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="flex-1 lg:ml-72 flex flex-col min-h-0 overflow-y-auto">
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full transition-all">
            {activeTab === 'landing' && (
              <LandingPage
                onNavigateToAuth={(mode) => setAuthMode(mode)}
                onNavigateToApp={(tab) => setActiveTab(tab)}
              />
            )}
            {activeTab === 'dashboard' && <DashboardPage onNavigate={(t) => setActiveTab(t)} />}
            {activeTab === 'civiccare' && <CivicCarePage />}
            {activeTab === 'wasteflow' && <WasteFlowPage />}
            {activeTab === 'circulab' && <CircuLabPage />}
            {activeTab === 'earthscope' && <EarthScopePage />}
            {activeTab === 'admin' && <AdminPage />}
            {activeTab === 'profile' && <ProfilePage />}
          </main>

          <Footer />
        </div>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <ToastProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </ToastProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
