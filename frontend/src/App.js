import React, { useState } from 'react';
import './App.css';

// Components
import Header from './components/Header';
import UploadZone from './components/UploadZone';
import Dashboard from './components/Dashboard';
import Loader from './components/Loader';

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState('');
  const [language, setLanguage] = useState('fr');

  const handleFileUpload = async (file) => {
    setLoading(true);
    setError(null);
    setFileName(file.name);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://127.0.0.1:8000/analyze', {
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
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header language={language} setLanguage={setLanguage} onReset={handleReset} />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {!data && !loading && (
          <UploadZone onUpload={handleFileUpload} language={language} />
        )}
        {loading && <Loader language={language} />}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mt-4">
            <strong>Erreur : </strong>{error}
          </div>
        )}
        {data && !loading && (
          <Dashboard data={data} fileName={fileName} language={language} onReset={handleReset} />
        )}
      </main>
    </div>
  );
}

export default App;