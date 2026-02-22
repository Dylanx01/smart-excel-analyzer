import React from 'react';

const translations = {
  fr: {
    title: "Smart Excel Analyzer",
    subtitle: "Analysez n'importe quel fichier Excel automatiquement",
    newFile: "Analyse rapide",
    workspaces: "Mes espaces",
  },
  en: {
    title: "Smart Excel Analyzer",
    subtitle: "Analyze any Excel file automatically",
    newFile: "Quick analysis",
    workspaces: "My workspaces",
  }
};

function Header({ language, setLanguage, onReset, view, setView }) {
  const t = translations[language];

  return (
    <header className="bg-primary shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">

        {/* Logo + Titre */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={onReset}>
          <div className="bg-white rounded-lg p-2">
            <span className="text-2xl">📊</span>
          </div>
          <div>
            <h1 className="text-white text-xl font-bold">{t.title}</h1>
            <p className="text-blue-200 text-xs">{t.subtitle}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">

          {/* Navigation */}
          <button
            onClick={onReset}
            className={`text-sm font-semibold px-4 py-2 rounded-lg transition ${
              view === 'home'
                ? 'bg-white text-primary'
                : 'text-white hover:bg-blue-700'
            }`}
          >
            📊 {t.newFile}
          </button>

          <button
            onClick={() => setView('workspaces')}
            className={`text-sm font-semibold px-4 py-2 rounded-lg transition ${
              view === 'workspaces' || view === 'workspace'
                ? 'bg-white text-primary'
                : 'text-white hover:bg-blue-700'
            }`}
          >
            📁 {t.workspaces}
          </button>

          {/* Switch langue */}
          <div className="flex items-center bg-blue-800 rounded-lg overflow-hidden">
            <button
              onClick={() => setLanguage('fr')}
              className={`px-3 py-2 text-sm font-semibold transition ${
                language === 'fr' ? 'bg-white text-primary' : 'text-white hover:bg-blue-700'
              }`}
            >
              FR
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-2 text-sm font-semibold transition ${
                language === 'en' ? 'bg-white text-primary' : 'text-white hover:bg-blue-700'
              }`}
            >
              EN
            </button>
          </div>
        </div>

      </div>
    </header>
  );
}

export default Header;