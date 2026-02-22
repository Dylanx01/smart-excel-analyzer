import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { supabase } from '../supabase';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';

const translations = {
  fr: {
    summary: "Résumé général",
    rows: "Lignes",
    columns: "Colonnes",
    missing: "Valeurs manquantes",
    kpis: "Indicateurs clés",
    total: "Total",
    average: "Moyenne",
    min: "Min",
    max: "Max",
    charts: "Graphiques automatiques",
    alerts: "Alertes",
    anomalies: "Anomalies détectées",
    noAlerts: "Aucune alerte détectée ✅",
    noAnomalies: "Aucune anomalie détectée ✅",
    newFile: "Nouveau fichier",
    exportPDF: "PDF",
    exportWord: "Word",
    exportPPT: "PowerPoint",
    print: "Imprimer",
    share: "Partager",
    file: "Fichier analysé",
    insight: "Analyse intelligente",
    dataQuality: "Qualité des données",
  },
  en: {
    summary: "General Summary",
    rows: "Rows",
    columns: "Columns",
    missing: "Missing values",
    kpis: "Key Indicators",
    total: "Total",
    average: "Average",
    min: "Min",
    max: "Max",
    charts: "Automatic Charts",
    alerts: "Alerts",
    anomalies: "Detected Anomalies",
    noAlerts: "No alerts detected ✅",
    noAnomalies: "No anomalies detected ✅",
    newFile: "New file",
    exportPDF: "PDF",
    exportWord: "Word",
    exportPPT: "PowerPoint",
    print: "Print",
    share: "Share",
    file: "Analyzed file",
    insight: "Smart Analysis",
    dataQuality: "Data Quality",
  }
};

const COLORS = ['#1E3A8A', '#3B82F6', '#60A5FA', '#93C5FD', '#6366F1', '#8B5CF6', '#EC4899', '#F59E0B'];

function generateInsight(data, language) {
  const fr = language === 'fr';
  const insights = [];

  if (data.kpis.length > 0) {
    const topKpi = data.kpis[0];
    insights.push(fr
      ? `📊 Votre fichier contient ${data.summary.total_rows} enregistrements avec ${data.kpis.length} indicateur(s) numérique(s) analysé(s).`
      : `📊 Your file contains ${data.summary.total_rows} records with ${data.kpis.length} numeric indicator(s) analyzed.`
    );
    insights.push(fr
      ? `💡 L'indicateur principal "${topKpi.column}" affiche un total de ${topKpi.total.toLocaleString()} avec une moyenne de ${topKpi.average.toLocaleString()}.`
      : `💡 The main indicator "${topKpi.column}" shows a total of ${topKpi.total.toLocaleString()} with an average of ${topKpi.average.toLocaleString()}.`
    );
  }

  if (data.alerts.length > 0) {
    insights.push(fr
      ? `🚨 ${data.alerts.length} alerte(s) détectée(s) — une attention immédiate est recommandée.`
      : `🚨 ${data.alerts.length} alert(s) detected — immediate attention is recommended.`
    );
  } else {
    insights.push(fr
      ? `✅ Aucune alerte critique — vos données semblent stables.`
      : `✅ No critical alerts — your data appears stable.`
    );
  }

  if (data.summary.missing_values > 0) {
    insights.push(fr
      ? `⚠️ ${data.summary.missing_values} valeur(s) manquante(s) détectée(s) — pensez à compléter vos données.`
      : `⚠️ ${data.summary.missing_values} missing value(s) detected — consider completing your data.`
    );
  }

  return insights;
}

function DataQualityScore({ data }) {
  let score = 100;
  if (data.summary.missing_values > 0) score -= Math.min(30, data.summary.missing_values * 2);
  if (data.alerts.length > 0) score -= data.alerts.length * 10;
  if (data.anomalies.length > 0) score -= data.anomalies.length * 5;
  score = Math.max(0, score);

  const color = score >= 80 ? '#16A34A' : score >= 60 ? '#D97706' : '#DC2626';
  const label = score >= 80 ? '🟢 Excellent' : score >= 60 ? '🟡 Moyen' : '🔴 Faible';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition">
      <h3 className="font-bold text-primary mb-4">📈 Qualité des données</h3>
      <div className="flex items-center gap-4">
        <div className="relative w-20 h-20 flex-shrink-0">
          <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f0f0f0" strokeWidth="3" />
            <circle
              cx="18" cy="18" r="15.9" fill="none"
              stroke={color} strokeWidth="3"
              strokeDasharray={`${score} 100`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-black" style={{ color }}>{score}</span>
          </div>
        </div>
        <div>
          <p className="font-bold text-gray-700">{label}</p>
          <p className="text-gray-400 text-sm mt-1">Score sur 100</p>
          <div className="flex flex-col gap-1 mt-2">
            {data.summary.missing_values > 0 && (
              <p className="text-xs text-orange-500">⚠️ {data.summary.missing_values} valeur(s) manquante(s)</p>
            )}
            {data.alerts.length > 0 && (
              <p className="text-xs text-red-500">🚨 {data.alerts.length} alerte(s)</p>
            )}
            {data.anomalies.length > 0 && (
              <p className="text-xs text-orange-500">🔍 {data.anomalies.length} anomalie(s)</p>
            )}
            {data.summary.missing_values === 0 && data.alerts.length === 0 && data.anomalies.length === 0 && (
              <p className="text-xs text-green-500">✅ Données parfaites</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({ kpi, t }) {
  const range = kpi.max - kpi.min;
  const avgPct = range > 0 ? ((kpi.average - kpi.min) / range) * 100 : 50;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-primary font-bold text-base truncate flex-1">{kpi.column}</h3>
        <span className="bg-accent text-secondary text-xs font-bold px-2 py-1 rounded-lg ml-2">
          {kpi.count} lignes
        </span>
      </div>
      <div className="mb-4">
        <p className="text-xs text-gray-400 mb-1">{t.total}</p>
        <p className="text-3xl font-black text-primary">{kpi.total.toLocaleString()}</p>
      </div>
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>{t.min}: {kpi.min.toLocaleString()}</span>
          <span>{t.max}: {kpi.max.toLocaleString()}</span>
        </div>
        <div className="bg-gray-100 rounded-full h-2">
          <div
            className="bg-secondary h-2 rounded-full transition-all"
            style={{ width: `${avgPct}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1 text-center">
          {t.average}: <span className="font-bold text-primary">{kpi.average.toLocaleString()}</span>
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-green-50 rounded-xl p-2 text-center">
          <p className="text-xs text-gray-400">{t.min}</p>
          <p className="text-green-600 font-bold text-sm">{kpi.min.toLocaleString()}</p>
        </div>
        <div className="bg-red-50 rounded-xl p-2 text-center">
          <p className="text-xs text-gray-400">{t.max}</p>
          <p className="text-red-500 font-bold text-sm">{kpi.max.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}

function ChartCard({ chart }) {
  const [chartType, setChartType] = useState(chart.type);

  const data = chart.labels.map((label, i) => ({
    name: label,
    value: chart.values[i]
  }));

  const renderChart = () => {
    if (chartType === 'line') {
      return (
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1E3A8A" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#1E3A8A" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
          <Area type="monotone" dataKey="value" stroke="#1E3A8A" strokeWidth={2} fill="url(#colorValue)" dot={{ fill: '#3B82F6', r: 4 }} />
        </AreaChart>
      );
    }
    if (chartType === 'bar') {
      return (
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      );
    }
    return (
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} label>
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
        <Legend />
      </PieChart>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-primary font-bold text-sm flex-1">{chart.title}</h3>
        {chart.type !== 'donut' && (
          <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-1">
            <button
              onClick={() => setChartType('line')}
              className={`text-xs px-2 py-1 rounded-lg transition ${chartType === 'line' ? 'bg-white text-primary shadow-sm font-bold' : 'text-gray-400 hover:text-primary'}`}
            >
              📈
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`text-xs px-2 py-1 rounded-lg transition ${chartType === 'bar' ? 'bg-white text-primary shadow-sm font-bold' : 'text-gray-400 hover:text-primary'}`}
            >
              📊
            </button>
          </div>
        )}
      </div>
      <ResponsiveContainer width="100%" height={250}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
}

function Dashboard({ data, fileName, language, onReset, readOnly }) {
  const t = translations[language];
  const insights = generateInsight(data, language);

  const handlePrint = () => window.print();

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(30, 58, 138);
    doc.text('Smart Excel Analyzer - Rapport', 20, 20);
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Fichier : ${fileName}`, 20, 35);
    doc.text(`Lignes : ${data.summary.total_rows}`, 20, 45);
    doc.text(`Colonnes : ${data.summary.total_columns}`, 20, 55);
    doc.text(`Valeurs manquantes : ${data.summary.missing_values}`, 20, 65);
    let y = 80;
    doc.setFontSize(14);
    doc.setTextColor(30, 58, 138);
    doc.text('Indicateurs cles :', 20, y);
    y += 10;
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    data.kpis.forEach(kpi => {
      const line = `${kpi.column} - Total: ${kpi.total} | Moyenne: ${kpi.average} | Min: ${kpi.min} | Max: ${kpi.max}`;
      doc.text(line, 20, y);
      y += 8;
      if (y > 270) { doc.addPage(); y = 20; }
    });
    if (data.alerts.length > 0) {
      y += 5;
      doc.setFontSize(14);
      doc.setTextColor(220, 38, 38);
      doc.text('Alertes :', 20, y);
      y += 10;
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      data.alerts.forEach(alert => {
        doc.text(`! ${alert.message.replace(/[^ -~]/g, '')}`, 20, y);
        y += 8;
        if (y > 270) { doc.addPage(); y = 20; }
      });
    }
    doc.save(`rapport_${fileName}.pdf`);
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
    .alert { background: #FEE2E2; color: #DC2626; padding: 10px; border-radius: 5px; margin: 5px 0; }
  </style>
</head>
<body>
  <h1>Smart Excel Analyzer - Rapport</h1>
  <p><strong>Fichier :</strong> ${fileName}</p>
  <p><strong>Date :</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
  <h2>Resume general</h2>
  <table>
    <tr><th>Indicateur</th><th>Valeur</th></tr>
    <tr><td>Nombre de lignes</td><td>${data.summary.total_rows}</td></tr>
    <tr><td>Nombre de colonnes</td><td>${data.summary.total_columns}</td></tr>
    <tr><td>Valeurs manquantes</td><td>${data.summary.missing_values}</td></tr>
  </table>
  <h2>Indicateurs cles</h2>
  <table>
    <tr><th>Colonne</th><th>Total</th><th>Moyenne</th><th>Min</th><th>Max</th></tr>
    ${data.kpis.map(k => `
    <tr>
      <td>${k.column}</td>
      <td>${k.total.toLocaleString()}</td>
      <td>${k.average.toLocaleString()}</td>
      <td>${k.min.toLocaleString()}</td>
      <td>${k.max.toLocaleString()}</td>
    </tr>`).join('')}
  </table>
  ${data.alerts.length > 0 ? `
  <h2>Alertes</h2>
  ${data.alerts.map(a => `<div class="alert">! ${a.message}</div>`).join('')}
  ` : ''}
</body>
</html>`;
    const blob = new Blob([content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport_${fileName}.doc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPPT = () => {
    const slides = [
      `<div class="slide" style="background:#1E3A8A;">
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;">
          <div style="font-size:60px;">📊</div>
          <h1 style="color:white;font-size:40px;margin:20px 0;">Smart Excel Analyzer</h1>
          <p style="color:#DBEAFE;font-size:22px;">Rapport - ${fileName}</p>
          <p style="color:#93C5FD;font-size:16px;">${new Date().toLocaleDateString('fr-FR')}</p>
        </div>
      </div>`,
      `<div class="slide">
        <h2 style="color:#1E3A8A;border-bottom:3px solid #1E3A8A;padding-bottom:15px;">Resume general</h2>
        <div style="display:flex;gap:40px;margin-top:40px;justify-content:center;">
          <div class="kpi-card"><div style="font-size:50px;font-weight:bold;color:#1E3A8A;">${data.summary.total_rows}</div><div style="color:#666;font-size:18px;">Lignes</div></div>
          <div class="kpi-card"><div style="font-size:50px;font-weight:bold;color:#1E3A8A;">${data.summary.total_columns}</div><div style="color:#666;font-size:18px;">Colonnes</div></div>
          <div class="kpi-card"><div style="font-size:50px;font-weight:bold;color:#1E3A8A;">${data.summary.missing_values}</div><div style="color:#666;font-size:18px;">Valeurs manquantes</div></div>
        </div>
      </div>`,
      `<div class="slide">
        <h2 style="color:#1E3A8A;border-bottom:3px solid #1E3A8A;padding-bottom:15px;">Indicateurs cles</h2>
        <table style="width:100%;border-collapse:collapse;margin-top:30px;font-size:16px;">
          <tr style="background:#1E3A8A;color:white;">
            <th style="padding:12px;text-align:left;">Colonne</th>
            <th style="padding:12px;">Total</th>
            <th style="padding:12px;">Moyenne</th>
            <th style="padding:12px;">Min</th>
            <th style="padding:12px;">Max</th>
          </tr>
          ${data.kpis.map((k, i) => `
          <tr style="background:${i % 2 === 0 ? '#DBEAFE' : 'white'};">
            <td style="padding:12px;font-weight:bold;">${k.column}</td>
            <td style="padding:12px;text-align:center;">${k.total.toLocaleString()}</td>
            <td style="padding:12px;text-align:center;">${k.average.toLocaleString()}</td>
            <td style="padding:12px;text-align:center;">${k.min.toLocaleString()}</td>
            <td style="padding:12px;text-align:center;">${k.max.toLocaleString()}</td>
          </tr>`).join('')}
        </table>
      </div>`,
    ];

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Presentation - ${fileName}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Segoe UI',Arial,sans-serif; background:#111; }
    .slide { width:1280px; height:720px; background:white; padding:60px; margin:20px auto; border-radius:12px; position:relative; box-shadow:0 10px 40px rgba(0,0,0,0.3); page-break-after:always; }
    .kpi-card { background:#DBEAFE; border-radius:16px; padding:30px 50px; text-align:center; min-width:200px; }
    @media print { body { background:white; } .slide { margin:0; border-radius:0; box-shadow:none; } }
  </style>
</head>
<body>
  ${slides.join('')}
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `presentation_${fileName}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    try {
      const shareId = Math.random().toString(36).substring(2, 10);
      const { error } = await supabase
        .from('shares')
        .insert([{
          share_id: shareId,
          file_name: fileName,
          analysis_data: data,
        }]);
      if (!error) {
        const shareUrl = `${window.location.origin}/share/${shareId}`;
        await navigator.clipboard.writeText(shareUrl);
        alert(`Lien copie !\n${shareUrl}\n\nValable 7 jours.`);
      }
    } catch (err) {
      alert('Erreur lors du partage.');
    }
  };

  return (
    <div className="flex flex-col gap-8">

      {/* Header dashboard */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-primary">Dashboard</h2>
          <p className="text-gray-400 text-sm">{t.file} : <span className="font-bold text-secondary">{fileName}</span></p>
        </div>
        {!readOnly && (
          <div className="flex flex-wrap gap-2">
            <button onClick={handleExportPDF} className="bg-red-500 text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-red-600 transition flex items-center gap-1">
              📄 {t.exportPDF}
            </button>
            <button onClick={handleExportWord} className="bg-blue-700 text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-blue-800 transition flex items-center gap-1">
              📝 {t.exportWord}
            </button>
            <button onClick={handleExportPPT} className="bg-orange-500 text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-orange-600 transition flex items-center gap-1">
              📊 {t.exportPPT}
            </button>
            <button onClick={handleShare} className="bg-green-500 text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-green-600 transition flex items-center gap-1">
              🔗 {t.share}
            </button>
            <button onClick={handlePrint} className="bg-gray-500 text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-gray-600 transition flex items-center gap-1">
              🖨️ {t.print}
            </button>
            <button onClick={onReset} className="bg-primary text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-secondary transition flex items-center gap-1">
              + {t.newFile}
            </button>
          </div>
        )}
      </div>

      {/* Insight intelligent */}
      <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-6 text-white">
        <h3 className="font-bold text-lg mb-3">🧠 {t.insight}</h3>
        <div className="flex flex-col gap-2">
          {insights.map((insight, i) => (
            <p key={i} className="text-blue-100 text-sm leading-relaxed">{insight}</p>
          ))}
        </div>
      </div>

      {/* Alertes */}
      {data.alerts.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-bold text-primary">🚨 {t.alerts}</h3>
          {data.alerts.map((alert, i) => (
            <div key={i} className={`px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3 ${
              alert.type === 'danger' ? 'bg-red-50 text-red-700 border border-red-200' :
              alert.type === 'warning' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
              'bg-yellow-50 text-yellow-700 border border-yellow-200'
            }`}>
              <span className="text-xl">{alert.type === 'danger' ? '🔴' : '🟡'}</span>
              {alert.message}
            </div>
          ))}
        </div>
      )}

      {/* Résumé + Qualité */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center hover:shadow-md transition">
          <div className="text-4xl mb-2">📝</div>
          <p className="text-4xl font-black text-primary">{data.summary.total_rows}</p>
          <p className="text-gray-400 text-sm mt-1">{t.rows}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center hover:shadow-md transition">
          <div className="text-4xl mb-2">📊</div>
          <p className="text-4xl font-black text-primary">{data.summary.total_columns}</p>
          <p className="text-gray-400 text-sm mt-1">{t.columns}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center hover:shadow-md transition">
          <div className="text-4xl mb-2">❓</div>
          <p className="text-4xl font-black text-primary">{data.summary.missing_values}</p>
          <p className="text-gray-400 text-sm mt-1">{t.missing}</p>
        </div>
        <DataQualityScore data={data} />
      </div>

      {/* KPIs */}
      {data.kpis.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-primary mb-4">💡 {t.kpis}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.kpis.map((kpi, i) => (
              <KPICard key={i} kpi={kpi} t={t} />
            ))}
          </div>
        </div>
      )}

      {/* Graphiques */}
      {data.charts.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-primary mb-4">📈 {t.charts}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.charts.map((chart, i) => (
              <ChartCard key={i} chart={chart} />
            ))}
          </div>
        </div>
      )}

      {/* Anomalies */}
      <div>
        <h3 className="text-lg font-bold text-primary mb-4">🔍 {t.anomalies}</h3>
        {data.anomalies.length === 0 ? (
          <div className="bg-green-50 text-green-700 border border-green-200 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
            <span className="text-xl">✅</span>
            {t.noAnomalies}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {data.anomalies.map((anomaly, i) => (
              <div key={i} className="bg-orange-50 text-orange-700 border border-orange-200 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                <span className="text-xl">🔍</span>
                {anomaly.message}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

export default Dashboard;