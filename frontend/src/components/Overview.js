import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

function Overview({ language, onOpenWorkspace }) {
  const [workspaces, setWorkspaces] = useState([]);
  const [recentFiles, setRecentFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalWorkspaces: 0,
    totalFiles: 0,
    totalAnalyses: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: ws } = await supabase
      .from('categories')
      .select('*, files(count)')
      .order('created_at', { ascending: false });

    const { data: files } = await supabase
      .from('files')
      .select('*')
      .order('uploaded_at', { ascending: false })
      .limit(5);

    if (ws) {
      setWorkspaces(ws);
      const totalFiles = ws.reduce((acc, w) => acc + (w.files?.[0]?.count || 0), 0);
      setStats({
        totalWorkspaces: ws.length,
        totalFiles,
        totalAnalyses: totalFiles,
      });
    }
    if (files) setRecentFiles(files);
    setLoading(false);
  };

  if (loading) return (
    <div className="text-center py-16">
      <div className="text-4xl animate-bounce mb-4">📊</div>
      <p className="text-gray-400">Chargement...</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-8">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-primary">
          {language === 'fr' ? '🌍 Vue d\'ensemble' : '🌍 Overview'}
        </h2>
        <p className="text-gray-400 text-sm">
          {language === 'fr' ? 'Tableau de bord global de tous vos espaces' : 'Global dashboard of all your workspaces'}
        </p>
      </div>

      {/* Stats globales */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: '📁', value: stats.totalWorkspaces, label: language === 'fr' ? 'Espaces de travail' : 'Workspaces' },
          { icon: '📊', value: stats.totalFiles, label: language === 'fr' ? 'Fichiers uploadés' : 'Uploaded files' },
          { icon: '🧠', value: stats.totalAnalyses, label: language === 'fr' ? 'Analyses effectuées' : 'Analyses done' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center hover:shadow-md transition">
            <div className="text-4xl mb-2">{stat.icon}</div>
            <p className="text-4xl font-black text-primary">{stat.value}</p>
            <p className="text-gray-400 text-sm mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Activité récente */}
      <div>
        <h3 className="text-lg font-black text-primary mb-4">
          🕐 {language === 'fr' ? 'Activité récente' : 'Recent activity'}
        </h3>
        {recentFiles.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-gray-400 text-sm">
              {language === 'fr' ? 'Aucune activité récente' : 'No recent activity'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {recentFiles.map(file => {
              const ws = workspaces.find(w => w.id === file.category_id);
              return (
                <div
                  key={file.id}
                  className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between hover:shadow-sm transition cursor-pointer"
                  onClick={() => ws && onOpenWorkspace(ws)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                      style={{ background: ws ? ws.color + '20' : '#EFF6FF' }}
                    >
                      {ws ? ws.icon : '📊'}
                    </div>
                    <div>
                      <p className="font-bold text-primary text-sm">{file.file_name}</p>
                      <p className="text-gray-400 text-xs">
                        {ws ? ws.name : '—'} · {new Date(file.uploaded_at).toLocaleDateString('fr-FR')} à {new Date(file.uploaded_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <span className="text-gray-300 text-sm">→</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Workspaces aperçu */}
      <div>
        <h3 className="text-lg font-black text-primary mb-4">
          📁 {language === 'fr' ? 'Mes espaces' : 'My workspaces'}
        </h3>
        {workspaces.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <div className="text-4xl mb-3">📂</div>
            <p className="text-gray-400 text-sm">
              {language === 'fr' ? 'Aucun espace créé' : 'No workspace created'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workspaces.map(ws => (
              <div
                key={ws.id}
                onClick={() => onOpenWorkspace(ws)}
                className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition cursor-pointer group"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 group-hover:scale-105 transition"
                  style={{ background: ws.color + '20' }}
                >
                  {ws.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-primary truncate">{ws.name}</p>
                  <p className="text-gray-400 text-xs">
                    {ws.files?.[0]?.count || 0} {language === 'fr' ? 'fichier(s)' : 'file(s)'}
                  </p>
                  {/* Barre progression fichiers */}
                  <div className="mt-2 bg-gray-100 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full transition-all"
                      style={{
                        width: `${Math.min(((ws.files?.[0]?.count || 0) / 10) * 100, 100)}%`,
                        background: ws.color
                      }}
                    />
                  </div>
                </div>
                <span className="text-gray-300 group-hover:text-primary transition">→</span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

export default Overview;