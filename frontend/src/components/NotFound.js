import React from 'react';

function NotFound({ language, onHome }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">

        {/* Illustration */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-40 h-40 bg-accent rounded-3xl flex items-center justify-center text-8xl shadow-sm">
              😕
            </div>
            <div className="absolute -top-3 -right-3 bg-red-500 text-white text-sm font-black px-3 py-1 rounded-full shadow">
              404
            </div>
          </div>
        </div>

        {/* Texte */}
        <h1 className="text-4xl font-black text-primary mb-3">
          {language === 'fr' ? 'Page introuvable' : 'Page not found'}
        </h1>
        <p className="text-gray-400 text-lg mb-2">
          {language === 'fr'
            ? 'Cette page n\'existe pas ou le lien a expiré.'
            : 'This page does not exist or the link has expired.'
          }
        </p>
        <p className="text-gray-300 text-sm mb-8">
          {language === 'fr'
            ? 'Vérifiez l\'URL ou retournez à l\'accueil.'
            : 'Check the URL or go back to home.'
          }
        </p>

        {/* Bouton */}
        <button
          onClick={onHome}
          className="bg-primary text-white font-bold px-8 py-4 rounded-2xl hover:bg-secondary transition shadow-lg hover:shadow-xl text-lg"
        >
          {language === 'fr' ? '🏠 Retour à l\'accueil' : '🏠 Back to home'}
        </button>

        {/* Info */}
        <p className="text-gray-300 text-xs mt-6">
          Smart Excel Analyzer — {language === 'fr' ? 'Analyse automatique de fichiers Excel' : 'Automatic Excel file analysis'}
        </p>

      </div>
    </div>
  );
}

export default NotFound;