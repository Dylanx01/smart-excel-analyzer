import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import Dashboard from './Dashboard';
import Loader from './Loader';
import Compare from './Compare';

const translations = {
  fr: {
    back: "Retour",
    upload: "Uploader un fichier Excel",
    history: "Historique des fichiers",
    noFiles: "Aucun fichier uploadé dans cet espace",
    analyze: "Analyser",
    delete: "Supprimer",
    compare: "Comparer",
  },
  en: {
    back: "Back",
    upload: "Upload an Excel file",
    history: "Files history",
    noFiles: "No files uploaded in this workspace",
    analyze: "Analyze",
    delete: "Delete",
    compare: "Compare",
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
          className="bg-gray-100 text-gray-600 font-semibold px-4 py-2 rounded-xl hover:bg-gray-200 transition"
        >
          ← {t.back}
        </button>
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            style={{ background: workspace.color + '20' }}
          >
            {workspace.icon}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-primary">{workspace.name}</h2>
            {workspace.description && <p className="text-gray-400 text-sm">{workspace.description}</p>}
          </div>
        </div>
      </div>

      {/* Zone upload */}
      {!currentData && !analyzing && !compareData && (
        <div
          className="w-full border-4 border-dashed border-blue-300 rounded-2xl p-10 text-center cursor-pointer hover:border-secondary hover:bg-accent transition"
          onClick={() => document.getElementById('wsFileInput').click()}
        >
          <div className="text-4xl mb-3">📂</div>
          <p className="text-primary font-bold text-lg">{t.upload}</p>
          <p className="text-gray-400 text-sm mt-1">Formats acceptés : .xlsx, .xls</p>
          <input
            id="wsFileInput"
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={e => { if (e.target.files[0]) handleUpload(e.target.files[0]); }}
          />
        </div>
      )}

      {analyzing && <Loader language={language} />}

      {/* Dashboard */}
      {currentData && !analyzing && (
        <div>
          <button
            onClick={() => { setCurrentData(null); setCurrentFile(''); }}
            className="mb-4 bg-gray-100 text-gray-600 font-semibold px-4 py-2 rounded-xl hover:bg-gray-200 transition"
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

      {/* Comparaison */}
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
          <h3 className="text-lg font-bold text-primary mb-4">📋 {t.history}</h3>

          {selectedForCompare.length > 0 && (
            <div className="bg-accent border border-secondary rounded-2xl p-4 mb-4 flex items-center justify-between">
              <p className="text-primary font-semibold text-sm">
                🔄 {selectedForCompare.length === 2
                  ? <><strong>{selectedForCompare[0].file_name}</strong> vs <strong>{selectedForCompare[1].file_name}</strong></>
                  : <>Sélectionnez un 2ème fichier à comparer</>
                }
              </p>
              <div className="flex gap-2">
                {selectedForCompare.length === 2 && (
                  <button
                    onClick={handleCompare}
                    className="bg-primary text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-secondary transition"
                  >
                    🔄 {t.compare}
                  </button>
                )}
                <button
                  onClick={() => setSelectedForCompare([])}
                  className="text-gray-400 hover:text-gray-600 text-sm px-2"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center text-gray-400 py-10">Chargement...</div>
          ) : files.length === 0 ? (
            <div className="text-center text-gray-400 py-16 bg-white rounded-2xl border border-gray-100">
              <div className="text-5xl mb-4">📭</div>
              <p>{t.noFiles}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {files.map(file => (
                <div
                  key={file.id}
                  className={`bg-white rounded-2xl border p-4 flex items-center justify-between transition ${
                    selectedForCompare.find(f => f.id === file.id)
                      ? 'border-secondary bg-accent'
                      : 'border-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📊</span>
                    <div>
                      <p className="font-semibold text-primary text-sm">{file.file_name}</p>
                      <p className="text-gray-400 text-xs">
                        {new Date(file.uploaded_at).toLocaleDateString('fr-FR')} à {new Date(file.uploaded_at).toLocaleTimeString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleCompare(file)}
                      className={`text-sm font-semibold px-3 py-2 rounded-xl transition ${
                        selectedForCompare.find(f => f.id === file.id)
                          ? 'bg-secondary text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-accent'
                      }`}
                    >
                      🔄
                    </button>
                    <button
                      onClick={() => handleAnalyzeExisting(file)}
                      style={{ background: workspace.color }}
                      className="text-white text-sm font-semibold px-3 py-2 rounded-xl hover:opacity-90 transition"
                    >
                      📊 {t.analyze}
                    </button>
                    <button
                      onClick={() => handleDelete(file.id)}
                      className="bg-red-50 text-red-500 text-sm font-semibold px-3 py-2 rounded-xl hover:bg-red-100 transition"
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