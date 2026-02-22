import React, { useState } from 'react';

const translations = {
  fr: {
    badge: "Analyse intelligente & automatique",
    title1: "Transformez vos",
    title2: "fichiers Excel",
    title3: "en insights puissants",
    subtitle: "Uploadez n'importe quel fichier Excel — notre IA analyse tout automatiquement et génère un dashboard professionnel en quelques secondes.",
    button: "Analyser mon fichier Excel",
    drag: "ou glissez-déposez votre fichier ici",
    formats: "Formats acceptés : .xlsx, .xls",
    dragging: "Relâchez pour analyser !",
    stats: [
      { value: "100%", label: "Automatique" },
      { value: "∞", label: "Types de fichiers" },
      { value: "<5s", label: "Temps d'analyse" },
      { value: "0", label: "Configuration requise" },
    ],
    features: [
      { icon: "🧠", title: "IA Universelle", desc: "S'adapte à n'importe quel Excel automatiquement" },
      { icon: "📊", title: "Graphiques Auto", desc: "Générés intelligemment selon vos données" },
      { icon: "🚨", title: "Alertes Intelligentes", desc: "Détecte les anomalies et baisses anormales" },
      { icon: "📄", title: "Export Pro", desc: "PDF, Word, PowerPoint en un clic" },
      { icon: "📁", title: "Espaces de travail", desc: "Organisez vos fichiers par catégorie" },
      { icon: "🔗", title: "Partage facile", desc: "Partagez votre dashboard par lien unique" },
    ]
  },
  en: {
    badge: "Smart & automatic analysis",
    title1: "Transform your",
    title2: "Excel files",
    title3: "into powerful insights",
    subtitle: "Upload any Excel file — our AI analyzes everything automatically and generates a professional dashboard in seconds.",
    button: "Analyze my Excel file",
    drag: "or drag and drop your file here",
    formats: "Accepted formats: .xlsx, .xls",
    dragging: "Release to analyze!",
    stats: [
      { value: "100%", label: "Automatic" },
      { value: "∞", label: "File types" },
      { value: "<5s", label: "Analysis time" },
      { value: "0", label: "Configuration needed" },
    ],
    features: [
      { icon: "🧠", title: "Universal AI", desc: "Adapts to any Excel file automatically" },
      { icon: "📊", title: "Auto Charts", desc: "Intelligently generated from your data" },
      { icon: "🚨", title: "Smart Alerts", desc: "Detects anomalies and abnormal drops" },
      { icon: "📄", title: "Pro Export", desc: "PDF, Word, PowerPoint in one click" },
      { icon: "📁", title: "Workspaces", desc: "Organize your files by category" },
      { icon: "🔗", title: "Easy sharing", desc: "Share your dashboard via unique link" },
    ]
  }
};

function UploadZone({ onUpload, language }) {
  const t = translations[language];
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onUpload(file);
  };

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) onUpload(file);
  };

  return (
    <div className="flex flex-col gap-16">

      {/* Hero Section */}
      <div className="flex flex-col items-center text-center gap-6 pt-8">

        {/* Badge */}
        <div className="flex items-center gap-2 bg-accent border border-secondary px-4 py-2 rounded-full">
          <div className="w-2 h-2 bg-secondary rounded-full animate-pulse"></div>
          <span className="text-secondary text-sm font-semibold">{t.badge}</span>
        </div>

        {/* Titre */}
        <div className="flex flex-col gap-1">
          <h1 className="text-5xl font-black text-gray-800">{t.title1}</h1>
          <h1 className="text-5xl font-black text-primary">{t.title2}</h1>
          <h1 className="text-5xl font-black text-gray-800">{t.title3}</h1>
        </div>

        {/* Sous-titre */}
        <p className="text-gray-500 text-lg max-w-2xl leading-relaxed">
          {t.subtitle}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-6 w-full max-w-2xl mt-4">
          {t.stats.map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
              <p className="text-2xl font-black text-primary">{stat.value}</p>
              <p className="text-gray-400 text-xs mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Zone Upload */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`w-full border-4 border-dashed rounded-3xl p-16 text-center transition-all cursor-pointer ${
          dragging
            ? 'border-secondary bg-accent scale-105 shadow-lg'
            : 'border-blue-200 bg-white hover:border-secondary hover:bg-accent hover:shadow-md'
        }`}
        onClick={() => document.getElementById('fileInput').click()}
      >
        {/* Icône animée */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 bg-accent rounded-3xl flex items-center justify-center text-5xl shadow-sm">
              {dragging ? '🎯' : '📂'}
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-white text-sm font-bold shadow">
              +
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-primary mb-2">
          {dragging ? t.dragging : t.button}
        </h2>
        <p className="text-gray-400 mb-1">{t.drag}</p>
        <p className="text-gray-300 text-sm">{t.formats}</p>

        <input
          id="fileInput"
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={handleChange}
        />

        <button className="mt-8 bg-primary text-white font-bold px-10 py-4 rounded-2xl hover:bg-secondary transition shadow-lg hover:shadow-xl text-lg">
          {t.button} →
        </button>
      </div>

      {/* Features Grid */}
      <div>
        <h2 className="text-2xl font-bold text-center text-primary mb-8">
          Tout ce dont vous avez besoin 🚀
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {t.features.map((feature, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-start gap-4 hover:shadow-md hover:border-secondary transition">
              <div className="text-3xl bg-accent rounded-xl p-3 flex-shrink-0">
                {feature.icon}
              </div>
              <div>
                <h3 className="font-bold text-primary mb-1">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-8 border-t border-gray-100">
        <p className="text-gray-400 text-sm">
          Smart Excel Analyzer — Conçu pour les PME africaines 🌍
        </p>
        <p className="text-gray-300 text-xs mt-1">
          Vos données restent privées et sécurisées
        </p>
      </div>

    </div>
  );
}

export default UploadZone;