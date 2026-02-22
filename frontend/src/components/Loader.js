import React from 'react';

const translations = {
  fr: {
    title: "Analyse en cours...",
    steps: [
      "📂 Lecture du fichier Excel...",
      "🧠 Détection des colonnes...",
      "📊 Génération des graphiques...",
      "🚨 Recherche des anomalies...",
      "✅ Finalisation du dashboard...",
    ]
  },
  en: {
    title: "Analyzing...",
    steps: [
      "📂 Reading Excel file...",
      "🧠 Detecting columns...",
      "📊 Generating charts...",
      "🚨 Searching for anomalies...",
      "✅ Finalizing dashboard...",
    ]
  }
};

function Loader({ language }) {
  const t = translations[language];
  const [currentStep, setCurrentStep] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep(prev => (prev < t.steps.length - 1 ? prev + 1 : prev));
    }, 600);
    return () => clearInterval(interval);
  }, [t.steps.length]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
      
      {/* Spinner */}
      <div className="relative">
        <div className="w-24 h-24 border-8 border-accent border-t-primary rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center text-3xl">📊</div>
      </div>

      {/* Titre */}
      <h2 className="text-2xl font-bold text-primary">{t.title}</h2>

      {/* Etapes */}
      <div className="flex flex-col gap-3 w-full max-w-md">
        {t.steps.map((step, index) => (
          <div
            key={index}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              index <= currentStep
                ? 'bg-accent text-primary font-semibold'
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            <span>{index <= currentStep ? '✅' : '⏳'}</span>
            <span className="text-sm">{step}</span>
          </div>
        ))}
      </div>

    </div>
  );
}

export default Loader;