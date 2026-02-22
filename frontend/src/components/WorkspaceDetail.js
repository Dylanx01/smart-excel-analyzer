import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import Dashboard from './Dashboard';
import Loader from './Loader';
import Compare from './Compare';

const translations = {
  fr: {
    back: "Retour",
    upload: "Uploader un fichier Excel",
    uploadDesc: "Glissez-déposez ou cliquez pour sélectionner",
    history: "Historique des fichiers",
    noFiles: "Aucun fichier uploadé dans cet espace",
    noFilesDesc: "Uploadez votre premier fichier Excel pour commencer",
    analyze: "Analyser",
    delete: "Supprimer",
    compare: "Comparer",
    selectTwo: "Sélectionnez un 2ème fichier",
    files: "fichier(s)",
    formats: "Formats acceptés : .xlsx, .xls",
  },
  en: {
    back: "Back",
    upload: "Upload an Excel file",
    uploadDesc: "Drag & drop or click to select",
    history: "Files history",
    noFiles: "No files uploaded in this workspace",
    noFilesDesc: "Upload your first Excel file to get started",
    analyze: "Analyze",
    delete: "Delete",
    compare: "Compare",
    selectTwo: "Select a 2nd file",
    files: "file(s)",
    formats: "Accepted formats: .xlsx, .xls",
  }
};

function WorkspaceDetail({ workspace, language, onBack }) {
  const t = translations[language];
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [currentData, setCurrentData] = useState(null);
  const [currentFile, setCurrentFile] = useState('');
  const [selectedForCompare, setSelectedForCompare] = useState([]);
  const [compareData, setCompareData] = useState(null);
  const [comparing, setComparing] = useState(false);

  useEffect(() => {
    fetchFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspace.id]);

  const fetchFiles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('category_id', workspace.id)
      .order('uploaded_at', { ascending: false });
    if (!error) setFiles(data || []);
    setLoading(false);
  };

  const handleUpload = async (file) => {
    setAnalyzing(true);
    setCurrentData(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('https://smart-excel-analyzer.onrender.com/analyze', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();

      if (result.status === 'success') {
        await supabase.from('files').insert([{
          category_id: workspace.id,
          file_name: file.name,
          analysis_data: result.data,
        }]);
        setCurrentData(result.data);
        setCurrentFile(file.name);
        fetchFiles();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAnalyzeExisting = (file) => {
    setCurrentData(file.analysis_data);
    setCurrentFile(file.file_name);
  };

  const handleDelete = async (id) => {
    await supabase.from('files').delete().eq('id', id);
    if (currentFile === files.find(f => f.id === id)?.file_name) {
      setCurrentData(null);
      setCurrentFile('');
    }
    fetchFiles();
  };

  const toggleCompare = (file) => {
    if (selectedForCompare.find(f => f.id === file.id)) {
      setSelectedForCompare(selectedForCompare.filter(f => f.id !== file.id));
    } else if (selectedForCompare.length < 2) {
      setSelectedForCompare([...selectedForCompare, file]);
    }
  };

  const handleCompare = async () => {
    if (selectedForCompare.length !== 2) return;
    setComparing(true);
    setCompareData(null);

    try {
      const d1 = selectedForCompare[0].analysis_data;
      const d2 = selectedForCompare[1].analysis_data;

      const kpis1 = {};
      const kpis2 = {};
      d1.kpis.forEach(k => kpis1[k.column] = k);
      d2.kpis.forEach(k => kpis2[k.column] = k);

      const kpis_comparison = [];
      for (const col in kpis1) {
        if (kpis2[col]) {
          const old_total = kpis1[col].total;
          const new_total = kpis2[col].total;
          const change_pct = old_total !== 0
            ? Math.round(((new_total - old_total) / Math.abs(old_total)) * 10000) / 100
            : 0;
          kpis_comparison.push({
            column: col,
            file1_total: old_total,
            file2_total: new_total,
            change: Math.round((new_total - old_total) * 100) / 100,
            change_pct,
            trend: new_total > old_total ? 'up' : new_total < old_total ? 'down' : 'stable'
          });
        }
      }

      setCompareData({
        file1: selectedForCompare[0].file_name,
        file2: selectedForCompare[1].file_name,
        summary: {
          file1_rows: d1.summary.total_rows,
          file2_rows: d2.summary.total_rows,
          rows_diff: d2.summary.total_rows - d1.summary.total_rows,
        },
        kpis_comparison,
        alerts1: d1.alerts || [],
        alerts2: d2.alerts || [],
        anomalies1: d1.anomalies || [],
        anomalies2: d2.anomalies || [],
      });

    } catch (err) {
      console.error(err);
    } finally {
      setComparing(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="bg-gray-100 text-gray-600 font-bold px-4 py-2 rounded-xl hover:bg-gray-200 transition flex items-center gap-2"
        >
          ← {t.back}
        </button>
        <div className="flex items-center gap-3">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm"
            style={{ background: workspace.color + '20' }}
          >
            {workspace.icon}
          </div>
          <div>
            <h2 className="text-2xl font-black text-primary">{workspace.name}</h2>
            {workspace.description && (
              <p className="text-gray-400 text-sm">{workspace.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Zone upload */}
      {!currentData && !analyzing && !compareData && (
        <div
          className="w-full border-4 border-dashed border-blue-200 rounded-3xl p-12 text-center cursor-pointer hover:border-secondary hover:bg-accent transition group"
          onClick={() => document.getElementById('wsFileInput').click()}
        >
          <div className="flex justify-center mb-4">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl group-hover:scale-110 transition"
              style={{ background: workspace.color + '15' }}
            >
              📂
            </div>
          </div>
          <h3 className="text-xl font-black text-primary mb-1">{t.upload}</h3>
          <p className="text-gray-400 text-sm mb-1">{t.uploadDesc}</p>
          <p className="text-gray-300 text-xs">{t.formats}</p>
          <input
            id="wsFileInput"
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={e => { if (e.target.files[0]) handleUpload(e.target.files[0]); }}
          />
          <button
            className="mt-6 text-white font-bold px-8 py-3 rounded-2xl hover:opacity-90 transition shadow"
            style={{ background: workspace.color }}
          >
            Choisir un fichier →
          </button>
        </div>
      )}

      {analyzing && <Loader language={language} />}

      {/* Dashboard */}
      {currentData && !analyzing && (
        <div>
          <button
            onClick={() => { setCurrentData(null); setCurrentFile(''); }}
            className="mb-4 bg-gray-100 text-gray-600 font-bold px-4 py-2 rounded-xl hover:bg-gray-200 transition flex items-center gap-2"
          >
            ← Retour à l'espace
          </button>
          <Dashboard
            data={currentData}
            fileName={currentFile}
            language={language}
            onReset={() => { setCurrentData(null); setCurrentFile(''); }}
          />
        </div>
      )}

      {comparing && <Loader language={language} />}

      {compareData && !comparing && (
        <div>
          <Compare
            data={compareData}
            language={language}
            onClose={() => { setCompareData(null); setSelectedForCompare([]); }}
          />
        </div>
      )}

      {/* Historique */}
      {!currentData && !analyzing && !compareData && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black text-primary">📋 {t.history}</h3>
            {files.length > 0 && (
              <span className="bg-accent text-secondary text-xs font-bold px-3 py-1 rounded-full">
                {files.length} {t.files}
              </span>
            )}
          </div>

          {/* Bannière comparaison */}
          {selectedForCompare.length > 0 && (
            <div
              className="rounded-2xl p-4 mb-4 flex items-center justify-between"
              style={{ background: workspace.color + '10', border: `2px solid ${workspace.color}30` }}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔄</span>
                <p className="font-bold text-sm" style={{ color: workspace.color }}>
                  {selectedForCompare.length === 2
                    ? `${selectedForCompare[0].file_name} vs ${selectedForCompare[1].file_name}`
                    : t.selectTwo
                  }
                </p>
              </div>
              <div className="flex gap-2">
                {selectedForCompare.length === 2 && (
                  <button
                    onClick={handleCompare}
                    style={{ background: workspace.color }}
                    className="text-white text-sm font-bold px-4 py-2 rounded-xl hover:opacity-90 transition"
                  >
                    🔄 {t.compare}
                  </button>
                )}
                <button
                  onClick={() => setSelectedForCompare([])}
                  className="text-gray-400 hover:text-gray-600 text-sm px-2 font-bold"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center text-gray-400 py-16">
              <div className="text-4xl mb-4 animate-bounce">📊</div>
              <p>Chargement...</p>
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <div className="text-5xl mb-4">📭</div>
              <h3 className="font-bold text-primary mb-1">{t.noFiles}</h3>
              <p className="text-gray-400 text-sm">{t.noFilesDesc}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {files.map(file => (
                <div
                  key={file.id}
                  className={`bg-white rounded-2xl border p-4 flex items-center justify-between transition hover:shadow-sm ${
                    selectedForCompare.find(f => f.id === file.id)
                      ? 'border-secondary bg-accent'
                      : 'border-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                      style={{ background: workspace.color + '15' }}
                    >
                      📊
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-primary text-sm truncate">{file.file_name}</p>
                      <p className="text-gray-400 text-xs">
                        {new Date(file.uploaded_at).toLocaleDateString('fr-FR')} à {new Date(file.uploaded_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => toggleCompare(file)}
                      className={`text-sm font-bold px-3 py-2 rounded-xl transition ${
                        selectedForCompare.find(f => f.id === file.id)
                          ? 'text-white'
                          : 'bg-gray-100 text-gray-500 hover:bg-accent'
                      }`}
                      style={selectedForCompare.find(f => f.id === file.id) ? { background: workspace.color } : {}}
                    >
                      🔄
                    </button>
                    <button
                      onClick={() => handleAnalyzeExisting(file)}
                      style={{ background: workspace.color }}
                      className="text-white text-sm font-bold px-3 py-2 rounded-xl hover:opacity-90 transition"
                    >
                      📊 {t.analyze}
                    </button>
                    <button
                      onClick={() => handleDelete(file.id)}
                      className="bg-red-50 text-red-500 text-sm font-bold px-3 py-2 rounded-xl hover:bg-red-100 transition"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default WorkspaceDetail;