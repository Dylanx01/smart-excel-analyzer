import React, { useState, useEffect } from 'react';

const steps = {
  fr: [
    { icon: '📂', text: 'Lecture du fichier Excel...' },
    { icon: '🔍', text: 'Détection des colonnes...' },
    { icon: '🧠', text: 'Analyse intelligente des données...' },
    { icon: '📊', text: 'Génération des graphiques...' },
    { icon: '🚨', text: 'Recherche des alertes...' },
    { icon: '✅', text: 'Finalisation du dashboard...' },
  ],
  en: [
    { icon: '📂', text: 'Reading Excel file...' },
    { icon: '🔍', text: 'Detecting columns...' },
    { icon: '🧠', text: 'Smart data analysis...' },
    { icon: '📊', text: 'Generating charts...' },
    { icon: '🚨', text: 'Searching for alerts...' },
    { icon: '✅', text: 'Finalizing dashboard...' },
  ]
};

function Loader({ language }) {
  const s = steps[language] || steps['fr'];
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < s.length - 1) return prev + 1;
        clearInterval(stepInterval);
        return prev;
      });
    }, 700);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev < 95) return prev + 1;
        clearInterval(progressInterval);
        return prev;
      });
    }, 50);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, [s.length]);

  return (
    <div className="flex flex-col items-center justify-center py-24 gap-8">

      {/* Icône animée */}
      <div className="relative">
        <div className="w-28 h-28 bg-accent rounded-3xl flex items-center justify-center shadow-lg">
          <span className="text-5xl animate-bounce">{s[currentStep].icon}</span>
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-secondary rounded-full flex items-center justify-center shadow">
          <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
        </div>
      </div>

      {/* Texte étape */}
      <div className="text-center">
        <h2 className="text-2xl font-black text-primary mb-2">
          {language === 'fr' ? 'Analyse en cours...' : 'Analyzing...'}
        </h2>
        <p className="text-gray-400 text-base">{s[currentStep].text}</p>
      </div>

      {/* Barre de progression */}
      <div className="w-full max-w-md">
        <div className="flex justify-between text-xs text-gray-400 mb-2">
          <span>{language === 'fr' ? 'Progression' : 'Progress'}</span>
          <span className="font-bold text-secondary">{progress}%</span>
        </div>
        <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-primary to-secondary h-3 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Étapes */}
      <div className="flex flex-col gap-2 w-full max-w-md">
        {s.map((step, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              i < currentStep
                ? 'bg-green-50 text-green-600'
                : i === currentStep
                ? 'bg-accent text-primary font-bold shadow-sm'
                : 'bg-gray-50 text-gray-300'
            }`}
          >
            <span className="text-lg">{step.icon}</span>
            <span className="text-sm">{step.text}</span>
            {i < currentStep && <span className="ml-auto text-green-500">✅</span>}
            {i === currentStep && <span className="ml-auto text-secondary">⏳</span>}
          </div>
        ))}
      </div>

    </div>
  );
}

export default Loader;