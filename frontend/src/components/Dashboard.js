import React from 'react';
import { jsPDF } from 'jspdf';
import { supabase } from '../supabase';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
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
    exportPDF: "Exporter PDF",
    exportWord: "Exporter Word",
    exportPPT: "Exporter PowerPoint",
    print: "Imprimer",
    share: "Partager",
    file: "Fichier analysé",
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
    exportPDF: "Export PDF",
    exportWord: "Export Word",
    exportPPT: "Export PowerPoint",
    print: "Print",
    share: "Share",
    file: "Analyzed file",
  }
};

const COLORS = ['#1E3A8A', '#3B82F6', '#60A5FA', '#93C5FD', '#DBEAFE'];

function KPICard({ kpi, t }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-primary font-bold text-lg mb-4 truncate">{kpi.column}</h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-accent rounded-xl p-3 text-center">
          <p className="text-xs text-gray-500">{t.total}</p>
          <p className="text-primary font-bold text-sm">{kpi.total.toLocaleString()}</p>
        </div>
        <div className="bg-accent rounded-xl p-3 text-center">
          <p className="text-xs text-gray-500">{t.average}</p>
          <p className="text-primary font-bold text-sm">{kpi.average.toLocaleString()}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-3 text-center">
          <p className="text-xs text-gray-500">{t.min}</p>
          <p className="text-green-600 font-bold text-sm">{kpi.min.toLocaleString()}</p>
        </div>
        <div className="bg-red-50 rounded-xl p-3 text-center">
          <p className="text-xs text-gray-500">{t.max}</p>
          <p className="text-red-500 font-bold text-sm">{kpi.max.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}

function ChartCard({ chart }) {
  const data = chart.labels.map((label, i) => ({
    name: label,
    value: chart.values[i]
  }));

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-primary font-bold text-base mb-4">{chart.title}</h3>
      <ResponsiveContainer width="100%" height={250}>
        {chart.type === 'line' ? (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#1E3A8A" strokeWidth={2} dot={{ fill: '#3B82F6' }} />
          </LineChart>
        ) : chart.type === 'bar' ? (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="value" fill="#1E3A8A" radius={[4, 4, 0, 0]} />
          </BarChart>
        ) : (
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

function Dashboard({ data, fileName, language, onReset, readOnly }) {
  const t = translations[language];

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
  <h1>Smart Excel Analyzer — Rapport</h1>
  <p><strong>Fichier :</strong> ${fileName}</p>
  <p><strong>Date :</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
  <h2>Résumé général</h2>
  <table>
    <tr><th>Indicateur</th><th>Valeur</th></tr>
    <tr><td>Nombre de lignes</td><td>${data.summary.total_rows}</td></tr>
    <tr><td>Nombre de colonnes</td><td>${data.summary.total_columns}</td></tr>
    <tr><td>Valeurs manquantes</td><td>${data.summary.missing_values}</td></tr>
  </table>
  <h2>Indicateurs clés</h2>
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
  ${data.anomalies.length > 0 ? `
  <h2>Anomalies</h2>
  ${data.anomalies.map(a => `<div class="alert">! ${a.message}</div>`).join('')}
  ` : '<h2>Anomalies</h2><p>Aucune anomalie detectee</p>'}
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
          <p style="color:#DBEAFE;font-size:22px;">Rapport — ${fileName}</p>
          <p style="color:#93C5FD;font-size:16px;">${new Date().toLocaleDateString('fr-FR')}</p>
        </div>
      </div>`,
      `<div class="slide">
        <h2 style="color:#1E3A8A;border-bottom:3px solid #1E3A8A;padding-bottom:15px;">Résumé général</h2>
        <div style="display:flex;gap:40px;margin-top:40px;justify-content:center;">
          <div class="kpi-card"><div style="font-size:50px;font-weight:bold;color:#1E3A8A;">${data.summary.total_rows}</div><div style="color:#666;font-size:18px;">Lignes</div></div>
          <div class="kpi-card"><div style="font-size:50px;font-weight:bold;color:#1E3A8A;">${data.summary.total_columns}</div><div style="color:#666;font-size:18px;">Colonnes</div></div>
          <div class="kpi-card"><div style="font-size:50px;font-weight:bold;color:#1E3A8A;">${data.summary.missing_values}</div><div style="color:#666;font-size:18px;">Valeurs manquantes</div></div>
        </div>
      </div>`,
      `<div class="slide">
        <h2 style="color:#1E3A8A;border-bottom:3px solid #1E3A8A;padding-bottom:15px;">Indicateurs clés</h2>
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
      `<div class="slide">
        <h2 style="color:#DC2626;border-bottom:3px solid #DC2626;padding-bottom:15px;">Alertes & Anomalies</h2>
        <div style="margin-top:30px;">
          ${data.alerts.length > 0
            ? data.alerts.map(a => `<div style="background:#FEE2E2;border-left:5px solid #DC2626;padding:15px;margin:10px 0;border-radius:8px;font-size:16px;">! ${a.message}</div>`).join('')
            : '<div style="background:#DCFCE7;border-left:5px solid #16A34A;padding:15px;border-radius:8px;font-size:16px;">Aucune alerte detectee</div>'
          }
        </div>
      </div>`,
    ];

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Présentation — ${fileName}</title>
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
  <div style="text-align:center;padding:20px;color:#666;font-size:14px;">Ouvrez ce fichier dans Chrome et utilisez F11 pour le plein ecran</div>
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
          <h2 className="text-2xl font-bold text-primary">Dashboard</h2>
          <p className="text-gray-500 text-sm">{t.file} : <span className="font-semibold text-secondary">{fileName}</span></p>
        </div>
        {!readOnly && (
          <div className="flex flex-wrap gap-2">
            <button onClick={handleExportPDF} className="bg-red-500 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-red-600 transition">
              📄 {t.exportPDF}
            </button>
            <button onClick={handleExportWord} className="bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-blue-800 transition">
              📝 {t.exportWord}
            </button>
            <button onClick={handleExportPPT} className="bg-orange-500 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-orange-600 transition">
              📊 {t.exportPPT}
            </button>
            <button onClick={handleShare} className="bg-green-500 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-green-600 transition">
              🔗 {t.share}
            </button>
            <button onClick={handlePrint} className="bg-gray-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-gray-700 transition">
              🖨️ {t.print}
            </button>
            <button onClick={onReset} className="bg-primary text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-secondary transition">
              + {t.newFile}
            </button>
          </div>
        )}
      </div>

      {/* Alertes */}
      {data.alerts.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-bold text-primary">🚨 {t.alerts}</h3>
          {data.alerts.map((alert, i) => (
            <div key={i} className={`px-4 py-3 rounded-xl text-sm font-medium ${
              alert.type === 'danger' ? 'bg-red-100 text-red-700 border border-red-300' :
              alert.type === 'warning' ? 'bg-orange-100 text-orange-700 border border-orange-300' :
              'bg-yellow-100 text-yellow-700 border border-yellow-300'
            }`}>
              ⚠️ {alert.message}
            </div>
          ))}
        </div>
      )}

      {/* Résumé */}
      <div>
        <h3 className="text-lg font-bold text-primary mb-4">📋 {t.summary}</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: t.rows, value: data.summary.total_rows, icon: '📝' },
            { label: t.columns, value: data.summary.total_columns, icon: '📊' },
            { label: t.missing, value: data.summary.missing_values, icon: '❓' },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
              <div className="text-3xl mb-2">{item.icon}</div>
              <p className="text-3xl font-bold text-primary">{item.value}</p>
              <p className="text-gray-500 text-sm mt-1">{item.label}</p>
            </div>
          ))}
        </div>
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
          <div className="bg-green-50 text-green-700 border border-green-200 px-4 py-3 rounded-xl text-sm">
            {t.noAnomalies}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {data.anomalies.map((anomaly, i) => (
              <div key={i} className="bg-orange-50 text-orange-700 border border-orange-200 px-4 py-3 rounded-xl text-sm">
                🔍 {anomaly.message}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

export default Dashboard;