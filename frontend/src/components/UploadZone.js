import React, { useState } from 'react';

const translations = {
  fr: {
    title: "Déposez votre fichier Excel ici",
    subtitle: "ou cliquez pour sélectionner un fichier",
    formats: "Formats acceptés : .xlsx, .xls",
    dragging: "Relâchez pour analyser !",
    button: "Sélectionner un fichier",
    features: [
      "🧠 Analyse automatique intelligente",
      "📊 Graphiques générés automatiquement",
      "🚨 Alertes et anomalies détectées",
      "📄 Export PDF, Word, PowerPoint",
    ]
  },
  en: {
    title: "Drop your Excel file here",
    subtitle: "or click to select a file",
    formats: "Accepted formats: .xlsx, .xls",
    dragging: "Release to analyze!",
    button: "Select a file",
    features: [
      "🧠 Intelligent automatic analysis",
      "📊 Automatically generated charts",
      "🚨 Alerts and anomalies detected",
      "📄 Export PDF, Word, PowerPoint",
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
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8">
      
      {/* Zone upload */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`w-full max-w-2xl border-4 border-dashed rounded-2xl p-16 text-center transition-all cursor-pointer ${
          dragging
            ? 'border-secondary bg-accent scale-105'
            : 'border-blue-300 bg-white hover:border-secondary hover:bg-accent'
        }`}
        onClick={() => document.getElementById('fileInput').click()}
      >
        <div className="text-6xl mb-4">📂</div>
        <h2 className="text-2xl font-bold text-primary mb-2">
          {dragging ? t.dragging : t.title}
        </h2>
        <p className="text-gray-500 mb-2">{t.subtitle}</p>
        <p className="text-gray-400 text-sm">{t.formats}</p>

        <input
          id="fileInput"
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={handleChange}
        />

        <button className="mt-6 bg-primary text-white font-semibold px-8 py-3 rounded-xl hover:bg-secondary transition">
          {t.button}
        </button>
      </div>

      {/* Features */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl">
        {t.features.map((feature, index) => (
          <div key={index} className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
            <p className="text-sm text-gray-600">{feature}</p>
          </div>
        ))}
      </div>

    </div>
  );
}

export default UploadZone;