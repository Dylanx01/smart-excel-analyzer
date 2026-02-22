import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const translations = {
  fr: {
    title: "Comparaison de fichiers",
    file1: "Fichier 1",
    file2: "Fichier 2",
    rows: "Lignes",
    evolution: "Évolution des indicateurs",
    charts: "Comparaison visuelle",
    alerts: "Comparaison des alertes",
    anomalies: "Comparaison des anomalies",
    score: "Score global",
    better: "Le fichier 2 est meilleur 📈",
    worse: "Le fichier 2 est moins bon 📉",
    stable: "Pas de changement significatif ➡️",
    noAlerts: "Aucune alerte",
    noAnomalies: "Aucune anomalie",
    before: "Avant",
    after: "Après",
    noCommon: "Aucun indicateur commun trouvé",
  },
  en: {
    title: "Files Comparison",
    file1: "File 1",
    file2: "File 2",
    rows: "Rows",
    evolution: "Indicators Evolution",
    charts: "Visual Comparison",
    alerts: "Alerts Comparison",
    anomalies: "Anomalies Comparison",
    score: "Global Score",
    better: "File 2 is better 📈",
    worse: "File 2 is worse 📉",
    stable: "No significant change ➡️",
    noAlerts: "No alerts",
    noAnomalies: "No anomalies",
    before: "Before",
    after: "After",
    noCommon: "No common indicators found",
  }
};

function Compare({ data, language, onClose }) {
  const t = translations[language];

  const improvements = data.kpis_comparison.filter(k => k.trend === 'up').length;
  const degradations = data.kpis_comparison.filter(k => k.trend === 'down').length;
  const globalScore = improvements > degradations ? 'better' : degradations > improvements ? 'worse' : 'stable';
  const rowsDiff = data.summary.rows_diff;

  const chartData = data.kpis_comparison.map(k => ({
    name: k.column,
    [data.file1]: k.file1_total,
    [data.file2]: k.file2_total,
  }));

  const handleExportPDF = () => {
    const { jsPDF } = require('jspdf');
    const doc = new jsPDF();
  
    doc.setFontSize(18);
    doc.setTextColor(30, 58, 138);
    doc.text('Smart Excel Analyzer - Rapport de Comparaison', 20, 20);
  
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Fichier 1 : ${data.file1}`, 20, 35);
    doc.text(`Fichier 2 : ${data.file2}`, 20, 45);
    doc.text(`Lignes fichier 1 : ${data.summary.file1_rows}`, 20, 55);
    doc.text(`Lignes fichier 2 : ${data.summary.file2_rows}`, 20, 65);
    doc.text(`Difference : ${rowsDiff >= 0 ? '+' : ''}${rowsDiff}`, 20, 75);
  
    let y = 90;
    doc.setFontSize(14);
    doc.setTextColor(30, 58, 138);
    doc.text('Evolution des indicateurs :', 20, y);
    y += 10;
  
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    data.kpis_comparison.forEach(kpi => {
      const trend = kpi.trend === 'up' ? '+' : kpi.trend === 'down' ? '-' : '=';
      const line = `${trend} ${kpi.column} : ${kpi.file1_total} -> ${kpi.file2_total} (${kpi.change_pct}%)`;
      doc.text(line, 20, y);
      y += 8;
      if (y > 270) { doc.addPage(); y = 20; }
    });
  
    if (data.alerts1?.length > 0 || data.alerts2?.length > 0) {
      y += 5;
      doc.setFontSize(14);
      doc.setTextColor(220, 38, 38);
      doc.text('Alertes :', 20, y);
      y += 10;
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      [...(data.alerts1 || []), ...(data.alerts2 || [])].forEach(alert => {
        doc.text(`! ${alert.message.replace(/[^ -~]/g, '')}`, 20, y);
        y += 8;
        if (y > 270) { doc.addPage(); y = 20; }
      });
    }
  
    doc.save(`comparaison_${data.file1}_vs_${data.file2}.pdf`);
  };

  const handleExportWord = () => {
    const content = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
    h1 { color: #1E3A8A; border-bottom: 2px solid #1E3A8A; padding-bottom: 10px; }
    h2 { color: #1E3A8A; margin-top: 30px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th { background: #1E3A8A; color: white; padding: 8px; text-align: left; }
    td { padding: 8px; border-bottom: 1px solid #ddd; }
    .up { color: #16A34A; font-weight: bold; }
    .down { color: #DC2626; font-weight: bold; }
    .stable { color: #666; }
    .score { padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
    .alert { background: #FEE2E2; color: #DC2626; padding: 10px; border-radius: 5px; margin: 5px 0; }
    .anomaly { background: #FEF3C7; color: #D97706; padding: 10px; border-radius: 5px; margin: 5px 0; }
  </style>
</head>
<body>
  <h1>📊 Rapport de Comparaison — Smart Excel Analyzer</h1>
  <p><strong>Date :</strong> ${new Date().toLocaleDateString('fr-FR')}</p>

  <h2>📁 Fichiers comparés</h2>
  <table>
    <tr><th>Fichier</th><th>Lignes</th></tr>
    <tr><td>${data.file1}</td><td>${data.summary.file1_rows}</td></tr>
    <tr><td>${data.file2}</td><td>${data.summary.file2_rows}</td></tr>
    <tr><td><strong>Différence</strong></td><td><strong>${rowsDiff >= 0 ? '+' : ''}${rowsDiff}</strong></td></tr>
  </table>

  <h2>🏆 Score global</h2>
  <div class="score" style="background:${improvements > degradations ? '#DCFCE7' : degradations > improvements ? '#FEE2E2' : '#F3F4F6'}">
    <strong>${improvements > degradations ? '📈 Le fichier 2 est meilleur' : degradations > improvements ? '📉 Le fichier 2 est moins bon' : '➡️ Pas de changement significatif'}</strong><br/>
    📈 ${improvements} amélioration(s) — 📉 ${degradations} baisse(s)
  </div>

  <h2>💡 Évolution des indicateurs</h2>
  <table>
    <tr><th>Colonne</th><th>Avant</th><th>Après</th><th>Variation</th></tr>
    ${data.kpis_comparison.map(k => `
    <tr>
      <td>${k.column}</td>
      <td>${k.file1_total.toLocaleString()}</td>
      <td>${k.file2_total.toLocaleString()}</td>
      <td class="${k.trend}">
        ${k.trend === 'up' ? '📈 +' : k.trend === 'down' ? '📉 ' : '➡️ '}${k.change_pct}%
      </td>
    </tr>`).join('')}
  </table>

  <h2>🚨 Alertes</h2>
  <p><strong>${data.file1} :</strong></p>
  ${data.alerts1?.length > 0 ? data.alerts1.map(a => `<div class="alert">⚠️ ${a.message}</div>`).join('') : '<p>✅ Aucune alerte</p>'}
  <p><strong>${data.file2} :</strong></p>
  ${data.alerts2?.length > 0 ? data.alerts2.map(a => `<div class="alert">⚠️ ${a.message}</div>`).join('') : '<p>✅ Aucune alerte</p>'}

  <h2>🔍 Anomalies</h2>
  <p><strong>${data.file1} :</strong></p>
  ${data.anomalies1?.length > 0 ? data.anomalies1.map(a => `<div class="anomaly">🔍 ${a.message}</div>`).join('') : '<p>✅ Aucune anomalie</p>'}
  <p><strong>${data.file2} :</strong></p>
  ${data.anomalies2?.length > 0 ? data.anomalies2.map(a => `<div class="anomaly">🔍 ${a.message}</div>`).join('') : '<p>✅ Aucune anomalie</p>'}
</body>
</html>`;

    const blob = new Blob([content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comparaison_${data.file1}_vs_${data.file2}.doc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary">🔄 {t.title}</h2>
        <div className="flex gap-2">
          <button
            onClick={handleExportPDF}
            className="bg-red-500 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-red-600 transition"
          >
            📄 PDF
          </button>
          <button
            onClick={handleExportWord}
            className="bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-blue-800 transition"
          >
            📝 Word
          </button>
          <button
            onClick={onClose}
            className="bg-gray-100 text-gray-600 font-semibold px-4 py-2 rounded-xl hover:bg-gray-200 transition"
          >
            ✕ Fermer
          </button>
        </div>
      </div>

      {/* Score global */}
      <div className={`rounded-2xl p-6 text-center ${
        globalScore === 'better' ? 'bg-green-50 border border-green-200' :
        globalScore === 'worse' ? 'bg-red-50 border border-red-200' :
        'bg-gray-50 border border-gray-200'
      }`}>
        <p className="text-sm text-gray-500 mb-1">🏆 {t.score}</p>
        <p className={`text-2xl font-bold ${
          globalScore === 'better' ? 'text-green-600' :
          globalScore === 'worse' ? 'text-red-600' :
          'text-gray-600'
        }`}>
          {t[globalScore]}
        </p>
        <p className="text-sm text-gray-400 mt-2">
          📈 {improvements} amélioration(s) — 📉 {degradations} baisse(s)
        </p>
      </div>

      {/* Résumé fichiers */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
          <p className="text-gray-500 text-sm mb-1">{t.file1}</p>
          <p className="text-primary font-bold text-base truncate">{data.file1}</p>
          <p className="text-gray-400 text-sm">{data.summary.file1_rows} {t.rows}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center flex flex-col items-center justify-center">
          <div className="text-3xl mb-2">🔄</div>
          <div className={`text-2xl font-bold ${rowsDiff >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {rowsDiff >= 0 ? '+' : ''}{rowsDiff}
          </div>
          <p className="text-gray-400 text-xs">{t.rows}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
          <p className="text-gray-500 text-sm mb-1">{t.file2}</p>
          <p className="text-primary font-bold text-base truncate">{data.file2}</p>
          <p className="text-gray-400 text-sm">{data.summary.file2_rows} {t.rows}</p>
        </div>
      </div>

      {/* Graphique comparatif */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-primary mb-4">📊 {t.charts}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey={data.file1} fill="#93C5FD" radius={[4, 4, 0, 0]} />
              <Bar dataKey={data.file2} fill="#1E3A8A" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Évolution des KPIs */}
      <div>
        <h3 className="text-lg font-bold text-primary mb-4">💡 {t.evolution}</h3>
        {data.kpis_comparison.length === 0 ? (
          <div className="bg-gray-50 text-gray-400 text-center py-10 rounded-2xl">
            {t.noCommon}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {data.kpis_comparison.map((kpi, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-primary">{kpi.column}</h4>
                  <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                    kpi.trend === 'up' ? 'bg-green-100 text-green-600' :
                    kpi.trend === 'down' ? 'bg-red-100 text-red-600' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {kpi.trend === 'up' ? '📈 +' : kpi.trend === 'down' ? '📉 ' : '➡️ '}
                    {kpi.change_pct}%
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400">{t.before}</p>
                    <p className="font-bold text-gray-600">{kpi.file1_total.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center justify-center text-2xl">→</div>
                  <div className={`rounded-xl p-3 ${
                    kpi.trend === 'up' ? 'bg-green-50' :
                    kpi.trend === 'down' ? 'bg-red-50' : 'bg-gray-50'
                  }`}>
                    <p className="text-xs text-gray-400">{t.after}</p>
                    <p className={`font-bold ${
                      kpi.trend === 'up' ? 'text-green-600' :
                      kpi.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                    }`}>{kpi.file2_total.toLocaleString()}</p>
                  </div>
                </div>
                <div className="mt-3 bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      kpi.trend === 'up' ? 'bg-green-500' :
                      kpi.trend === 'down' ? 'bg-red-500' : 'bg-gray-400'
                    }`}
                    style={{ width: `${Math.min(Math.abs(kpi.change_pct), 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Comparaison alertes */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="text-base font-bold text-primary mb-3">🚨 {t.alerts} — {data.file1}</h3>
          {data.alerts1?.length > 0 ? (
            data.alerts1.map((a, i) => (
              <div key={i} className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-xl mb-2">
                ⚠️ {a.message}
              </div>
            ))
          ) : (
            <p className="text-green-500 text-sm">✅ {t.noAlerts}</p>
          )}
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="text-base font-bold text-primary mb-3">🚨 {t.alerts} — {data.file2}</h3>
          {data.alerts2?.length > 0 ? (
            data.alerts2.map((a, i) => (
              <div key={i} className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-xl mb-2">
                ⚠️ {a.message}
              </div>
            ))
          ) : (
            <p className="text-green-500 text-sm">✅ {t.noAlerts}</p>
          )}
        </div>
      </div>

      {/* Comparaison anomalies */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="text-base font-bold text-primary mb-3">🔍 {t.anomalies} — {data.file1}</h3>
          {data.anomalies1?.length > 0 ? (
            data.anomalies1.map((a, i) => (
              <div key={i} className="bg-orange-50 text-orange-600 text-sm px-3 py-2 rounded-xl mb-2">
                🔍 {a.message}
              </div>
            ))
          ) : (
            <p className="text-green-500 text-sm">✅ {t.noAnomalies}</p>
          )}
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="text-base font-bold text-primary mb-3">🔍 {t.anomalies} — {data.file2}</h3>
          {data.anomalies2?.length > 0 ? (
            data.anomalies2.map((a, i) => (
              <div key={i} className="bg-orange-50 text-orange-600 text-sm px-3 py-2 rounded-xl mb-2">
                🔍 {a.message}
              </div>
            ))
          ) : (
            <p className="text-green-500 text-sm">✅ {t.noAnomalies}</p>
          )}
        </div>
      </div>

    </div>
  );
}

export default Compare;