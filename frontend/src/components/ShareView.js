import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import Dashboard from './Dashboard';
import Loader from './Loader';

function ShareView({ shareId, language }) {
  const [data, setData] = useState(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSharedDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shareId]);
  
  const fetchSharedDashboard = async () => {
    setLoading(true);
    try {
      const { data: share, error } = await supabase
        .from('shares')
        .select('*')
        .eq('share_id', shareId)
        .single();

      if (error || !share) {
        setError('Lien invalide ou expiré.');
        return;
      }

      const now = new Date();
      const expiresAt = new Date(share.expires_at);
      if (now > expiresAt) {
        setError('Ce lien a expiré.');
        return;
      }

      setData(share.analysis_data);
      setFileName(share.file_name);
    } catch (err) {
      setError('Erreur lors du chargement.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Loader language={language} />
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
        <div className="text-5xl mb-4">😕</div>
        <h2 className="text-xl font-bold text-primary mb-2">Lien invalide</h2>
        <p className="text-gray-400">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header lecture seule */}
      <header className="bg-primary shadow-lg mb-8">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-lg p-2">
              <span className="text-2xl">📊</span>
            </div>
            <div>
              <h1 className="text-white text-xl font-bold">Smart Excel Analyzer</h1>
              <p className="text-blue-200 text-xs">Dashboard partagé — lecture seule</p>
            </div>
          </div>
          <div className="bg-blue-800 text-blue-200 text-xs px-3 py-2 rounded-xl">
            👁️ Lecture seule
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pb-8">
        <Dashboard
          data={data}
          fileName={fileName}
          language={language}
          onReset={() => {}}
          readOnly={true}
        />
      </main>
    </div>
  );
}

export default ShareView;