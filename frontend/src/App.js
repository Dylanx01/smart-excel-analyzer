import React, { useState, useEffect } from 'react';
import './App.css';

import { supabase } from './supabase';
import Header from './components/Header';
import UploadZone from './components/UploadZone';
import Dashboard from './components/Dashboard';
import Loader from './components/Loader';
import Workspaces from './components/Workspaces';
import WorkspaceDetail from './components/WorkspaceDetail';
import ShareView from './components/ShareView';
import NotFound from './components/NotFound';
import Overview from './components/Overview';
import Auth from './components/Auth';
import { ToastContainer } from './components/Toast';

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState('');
  const [language, setLanguage] = useState('fr');
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const path = window.location.pathname;
  const shareMatch = path.match(/^\/share\/([a-z0-9]+)$/i);
  const shareId = shareMatch ? shareMatch[1] : null;
  const isValidPath = path === '/' || !!shareMatch;

  const [view, setView] = useState('home');

  useEffect(() => {
    // Vérifier session existante
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    // Écouter changements auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleFileUpload = async (file) => {
    setLoading(true);
    setError(null);
    setFileName(file.name);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('https://smart-excel-analyzer.onrender.com/analyze', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (result.status === 'success') {
        setData(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Erreur de connexion au serveur.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setData(null);
    setError(null);
    setFileName('');
    setView('home');
  };

  const handleOpenWorkspace = (workspace) => {
    setCurrentWorkspace(workspace);
    setView('workspace');
  };

  const handleBackFromWorkspace = () => {
    setCurrentWorkspace(null);
    setView('workspaces');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    handleReset();
  };

  // Vue partage — accessible sans connexion
  if (shareId) {
    return <ShareView shareId={shareId} language={language} />;
  }

  // Vue 404
  if (!isValidPath) {
    return <NotFound language={language} onHome={() => window.location.href = '/'} />;
  }

  // Chargement auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">📊</div>
          <p className="text-gray-400 font-bold">Smart Excel Analyzer</p>
        </div>
      </div>
    );
  }

  // Vue Auth — si pas connecté
  if (!user) {
    return <Auth language={language} onAuth={() => setUser(true)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer />
      <Header
        language={language}
        setLanguage={setLanguage}
        onReset={handleReset}
        view={view}
        setView={setView}
        user={user}
        onLogout={handleLogout}
      />
      <main className="max-w-7xl mx-auto px-4 py-8">

        {view === 'home' && !data && !loading && (
          <UploadZone onUpload={handleFileUpload} language={language} />
        )}

        {view === 'home' && loading && <Loader language={language} />}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl mt-4 flex items-center gap-3">
            <span className="text-xl">❌</span>
            <strong>Erreur : </strong>{error}
          </div>
        )}

        {view === 'home' && data && !loading && (
          <Dashboard
            data={data}
            fileName={fileName}
            language={language}
            onReset={handleReset}
          />
        )}

        {view === 'overview' && (
          <Overview
            language={language}
            onOpenWorkspace={handleOpenWorkspace}
          />
        )}

        {view === 'workspaces' && (
          <Workspaces
            language={language}
            onOpenWorkspace={handleOpenWorkspace}
          />
        )}

        {view === 'workspace' && currentWorkspace && (
          <WorkspaceDetail
            workspace={currentWorkspace}
            language={language}
            onBack={handleBackFromWorkspace}
          />
        )}

      </main>
    </div>
  );
}

export default App;