import React from 'react';

const translations = {
  fr: {
    title: "Smart Excel Analyzer",
    subtitle: "Analyse automatique & intelligente",
    quickAnalysis: "Analyse rapide",
    workspaces: "Mes espaces",
  },
  en: {
    title: "Smart Excel Analyzer",
    subtitle: "Automatic & intelligent analysis",
    quickAnalysis: "Quick analysis",
    workspaces: "My workspaces",
  }
};

function Header({ language, setLanguage, onReset, view, setView }) {
  const t = translations[language];

  return (
    <header className="bg-primary shadow-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* Logo + Titre */}
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={onReset}
        >
          <div className="bg-white rounded-xl p-2 shadow-sm group-hover:scale-105 transition">
            <span className="text-2xl">📊</span>
          </div>
          <div>
            <h1 className="text-white text-lg font-black tracking-tight">{t.title}</h1>
            <p className="text-blue-300 text-xs">{t.subtitle}</p>
          </div>
        </div>

        {/* Navigation centrale */}
        <div className="hidden md:flex items-center bg-blue-800 rounded-2xl p-1 gap-1">
          <button
            onClick={onReset}
            className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl transition ${
              view === 'home'
                ? 'bg-white text-primary shadow-sm'
                : 'text-blue-200 hover:text-white hover:bg-blue-700'
            }`}
          >
            <span>📊</span>
            <span>{t.quickAnalysis}</span>
          </button>
          <button
            onClick={() => setView('workspaces')}
            className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl transition ${
              view === 'workspaces' || view === 'workspace'
                ? 'bg-white text-primary shadow-sm'
                : 'text-blue-200 hover:text-white hover:bg-blue-700'
            }`}
          >
            <span>📁</span>
            <span>{t.workspaces}</span>
          </button>
        </div>

        {/* Actions droite */}
        <div className="flex items-center gap-3">

          {/* Switch langue */}
          <div className="flex items-center bg-blue-800 rounded-xl overflow-hidden border border-blue-700">
            <button
              onClick={() => setLanguage('fr')}
              className={`px-3 py-2 text-xs font-bold transition ${
                language === 'fr'
                  ? 'bg-white text-primary'
                  : 'text-blue-300 hover:text-white hover:bg-blue-700'
              }`}
            >
              🇫🇷 FR
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-2 text-xs font-bold transition ${
                language === 'en'
                  ? 'bg-white text-primary'
                  : 'text-blue-300 hover:text-white hover:bg-blue-700'
              }`}
            >
              🇬🇧 EN
            </button>
          </div>

        </div>
      </div>

      {/* Barre navigation mobile */}
      <div className="md:hidden flex items-center justify-center gap-2 pb-2 px-4">
        <button
          onClick={onReset}
          className={`flex-1 text-sm font-semibold py-2 rounded-xl transition ${
            view === 'home' ? 'bg-white text-primary' : 'text-blue-200 hover:bg-blue-700'
          }`}
        >
          📊 {t.quickAnalysis}
        </button>
        <button
          onClick={() => setView('workspaces')}
          className={`flex-1 text-sm font-semibold py-2 rounded-xl transition ${
            view === 'workspaces' || view === 'workspace'
              ? 'bg-white text-primary'
              : 'text-blue-200 hover:bg-blue-700'
          }`}
        >
          📁 {t.workspaces}
        </button>
      </div>
    </header>
  );
}

export default Header;