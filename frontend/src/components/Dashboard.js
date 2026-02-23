import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { supabase } from '../supabase';
import { useToast } from './Toast';
import * as XLSX from 'xlsx';
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
    exportExcel: "Excel",
    print: "Imprimer",
    share: "Partager",
    file: "Fichier analysé",
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
    exportExcel: "Excel",
    print: "Print",
    share: "Share",
    file: "Analyzed file",
    dataQuality: "Data Quality",
  }
};

const COLORS = ['#1E3A8A', '#3B82F6', '#60A5FA', '#93C5FD', '#6366F1', '#8B5CF6', '#EC4899', '#F59E0B'];

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

function AIInsightsBlock({ ai }) {
  if (!ai) return null;

  
  return (
    <div className="flex flex-col gap-6">

      {/* Header IA */}
      <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">✨</span>
              <h3 className="font-black text-xl">Analyse IA — {ai.domaine}</h3>
            </div>
            <p className="text-blue-100 text-sm leading-relaxed mb-3">{ai.contexte}</p>
            <p className="text-white text-sm leading-relaxed font-medium">{ai.resume_executif}</p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-2xl p-4 text-center flex-shrink-0">
            <div className="relative w-16 h-16 mx-auto mb-2">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="15.9" fill="none"
                  stroke="white" strokeWidth="3"
                  strokeDasharray={`${ai.score_sante} 100`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-black text-lg">{ai.score_sante}</span>
              </div>
            </div>
            <p className="text-blue-100 text-xs font-bold">Score santé</p>
            {ai.score_explication && (
              <p className="text-blue-200 text-xs mt-1 max-w-24">{ai.score_explication}</p>
            )}
          </div>
        </div>
      </div>

      {/* Insights */}
      {ai.insights && ai.insights.length > 0 && (
        <div>
          <h3 className="text-lg font-black text-primary mb-4">💡 Insights intelligents</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ai.insights.map((insight, i) => (
              <div
                key={i}
                className={`bg-white rounded-2xl border shadow-sm p-5 hover:shadow-md transition ${
                  insight.priorite === 'haute' ? 'border-red-200' :
                  insight.priorite === 'moyenne' ? 'border-orange-200' :
                  'border-green-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{insight.icone}</span>
                  <h4 className="font-bold text-primary text-sm flex-1">{insight.titre}</h4>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    insight.priorite === 'haute' ? 'bg-red-50 text-red-500' :
                    insight.priorite === 'moyenne' ? 'bg-orange-50 text-orange-500' :
                    'bg-green-50 text-green-500'
                  }`}>
                    {insight.priorite}
                  </span>
                </div>
                <p className="text-gray-500 text-xs mb-3 leading-relaxed">{insight.observation}</p>
                <div className="bg-accent rounded-xl p-3">
                  <p className="text-secondary text-xs font-bold mb-1">💡 Conseil</p>
                  <p className="text-gray-600 text-xs leading-relaxed">{insight.conseil}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Points forts / faibles / opportunités / risques */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ai.points_forts && ai.points_forts.length > 0 && (
          <div className="bg-white rounded-2xl border border-green-100 shadow-sm p-5">
            <h3 className="font-bold text-green-600 mb-3 flex items-center gap-2">
              <span>✅</span> Points forts
            </h3>
            <div className="flex flex-col gap-2">
              {ai.points_forts.map((point, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-green-500 text-sm mt-0.5 flex-shrink-0">→</span>
                  <p className="text-gray-600 text-sm">{point}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {ai.points_faibles && ai.points_faibles.length > 0 && (
          <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-5">
            <h3 className="font-bold text-red-500 mb-3 flex items-center gap-2">
              <span>⚠️</span> Points faibles
            </h3>
            <div className="flex flex-col gap-2">
              {ai.points_faibles.map((point, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-red-400 text-sm mt-0.5 flex-shrink-0">→</span>
                  <p className="text-gray-600 text-sm">{point}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {ai.opportunites && ai.opportunites.length > 0 && (
          <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5">
            <h3 className="font-bold text-blue-500 mb-3 flex items-center gap-2">
              <span>🚀</span> Opportunités
            </h3>
            <div className="flex flex-col gap-2">
              {ai.opportunites.map((opp, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-blue-400 text-sm mt-0.5 flex-shrink-0">→</span>
                  <p className="text-gray-600 text-sm">{opp}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {ai.risques && ai.risques.length > 0 && (
          <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-5">
            <h3 className="font-bold text-orange-500 mb-3 flex items-center gap-2">
              <span>🔺</span> Risques
            </h3>
            <div className="flex flex-col gap-2">
              {ai.risques.map((risque, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-orange-400 text-sm mt-0.5 flex-shrink-0">→</span>
                  <p className="text-gray-600 text-sm">{risque}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Plan d'action */}
      {ai.plan_action && ai.plan_action.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-black text-primary text-lg mb-4">📋 Plan d'action prioritaire</h3>
          <div className="flex flex-col gap-3">
            {ai.plan_action.map((action, i) => (
              <div key={i} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-accent transition">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-sm flex-shrink-0 ${
                  action.priorite === 1 ? 'bg-red-500' :
                  action.priorite === 2 ? 'bg-orange-500' :
                  'bg-blue-500'
                }`}>
                  {action.priorite}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-primary text-sm mb-1">{action.action}</p>
                  <div className="flex flex-wrap gap-3">
                    <p className="text-gray-400 text-xs">⏱️ {action.delai}</p>
                    {action.responsable && <p className="text-gray-400 text-xs">👤 {action.responsable}</p>}
                    <p className="text-gray-400 text-xs">💥 {action.impact}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conclusion */}
      {ai.conclusion && (
        <div className="bg-accent rounded-2xl border border-blue-100 p-5 text-center">
          <p className="text-secondary font-bold text-sm">🎯 {ai.conclusion}</p>
        </div>
      )}

    </div>
  );
}

function Dashboard({ data, fileName, language, onReset, readOnly }) {
  const t = translations[language];
  const toast = useToast();

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

    let y = 70;

    if (data.ai_insights) {
      doc.setFontSize(14);
      doc.setTextColor(30, 58, 138);
      doc.text(`Domaine : ${data.ai_insights.domaine}`, 20, y); y += 10;
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(`Score santé : ${data.ai_insights.score_sante}/100`, 20, y); y += 10;

      const resume = doc.splitTextToSize(data.ai_insights.resume_executif || '', 170);
      doc.text(resume, 20, y); y += resume.length * 7 + 5;

      if (data.ai_insights.insights && data.ai_insights.insights.length > 0) {
        doc.setFontSize(14);
        doc.setTextColor(30, 58, 138);
        doc.text('Insights IA :', 20, y); y += 10;
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        data.ai_insights.insights.forEach(insight => {
          if (y > 260) { doc.addPage(); y = 20; }
          const lines = doc.splitTextToSize(`• ${insight.titre}: ${insight.observation}`, 170);
          doc.text(lines, 20, y); y += lines.length * 6 + 4;
        });
      }

      if (data.ai_insights.plan_action && data.ai_insights.plan_action.length > 0) {
        if (y > 240) { doc.addPage(); y = 20; }
        doc.setFontSize(14);
        doc.setTextColor(30, 58, 138);
        doc.text('Plan d\'action :', 20, y); y += 10;
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        data.ai_insights.plan_action.forEach(action => {
          if (y > 260) { doc.addPage(); y = 20; }
          const lines = doc.splitTextToSize(`${action.priorite}. ${action.action} (${action.delai})`, 170);
          doc.text(lines, 20, y); y += lines.length * 6 + 4;
        });
      }
    }

    if (data.kpis.length > 0) {
      if (y > 240) { doc.addPage(); y = 20; }
      doc.setFontSize(14);
      doc.setTextColor(30, 58, 138);
      doc.text('Indicateurs clés :', 20, y); y += 10;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      data.kpis.forEach(kpi => {
        if (y > 260) { doc.addPage(); y = 20; }
        doc.text(`${kpi.column} — Total: ${kpi.total} | Moy: ${kpi.average} | Min: ${kpi.min} | Max: ${kpi.max}`, 20, y);
        y += 8;
      });
    }

    doc.save(`rapport_${fileName}.pdf`);
  };

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    const resumeData = [
      ['Smart Excel Analyzer — Rapport IA'],
      ['Fichier analysé', fileName],
      ['Date', new Date().toLocaleDateString('fr-FR')],
      [],
      ['RÉSUMÉ GÉNÉRAL'],
      ['Nombre de lignes', data.summary.total_rows],
      ['Nombre de colonnes', data.summary.total_columns],
      ['Valeurs manquantes', data.summary.missing_values],
    ];

    if (data.ai_insights) {
      resumeData.push([]);
      resumeData.push(['ANALYSE IA']);
      resumeData.push(['Domaine', data.ai_insights.domaine]);
      resumeData.push(['Score santé', `${data.ai_insights.score_sante}/100`]);
      resumeData.push(['Résumé', data.ai_insights.resume_executif]);
    }

    const wsResume = XLSX.utils.aoa_to_sheet(resumeData);
    wsResume['!cols'] = [{ wch: 30 }, { wch: 50 }];
    XLSX.utils.book_append_sheet(wb, wsResume, 'Resume');

    if (data.kpis.length > 0) {
      const kpiHeaders = ['Indicateur', 'Total', 'Moyenne', 'Min', 'Max', 'Nb lignes'];
      const kpiRows = data.kpis.map(k => [k.column, k.total, k.average, k.min, k.max, k.count]);
      const wsKpis = XLSX.utils.aoa_to_sheet([kpiHeaders, ...kpiRows]);
      wsKpis['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 10 }];
      XLSX.utils.book_append_sheet(wb, wsKpis, 'Indicateurs');
    }

    if (data.ai_insights && data.ai_insights.insights && data.ai_insights.insights.length > 0) {
      const insightHeaders = ['Titre', 'Observation', 'Conseil', 'Priorité'];
      const insightRows = data.ai_insights.insights.map(i => [i.titre, i.observation, i.conseil, i.priorite]);
      const wsInsights = XLSX.utils.aoa_to_sheet([insightHeaders, ...insightRows]);
      wsInsights['!cols'] = [{ wch: 25 }, { wch: 40 }, { wch: 40 }, { wch: 10 }];
      XLSX.utils.book_append_sheet(wb, wsInsights, 'Insights IA');
    }

    if (data.ai_insights && data.ai_insights.plan_action && data.ai_insights.plan_action.length > 0) {
      const planHeaders = ['Priorité', 'Action', 'Délai', 'Responsable', 'Impact'];
      const planRows = data.ai_insights.plan_action.map(a => [a.priorite, a.action, a.delai, a.responsable || '', a.impact]);
      const wsPlan = XLSX.utils.aoa_to_sheet([planHeaders, ...planRows]);
      wsPlan['!cols'] = [{ wch: 10 }, { wch: 40 }, { wch: 15 }, { wch: 20 }, { wch: 30 }];
      XLSX.utils.book_append_sheet(wb, wsPlan, 'Plan action');
    }

    if (data.alerts.length > 0) {
      const alertHeaders = ['Type', 'Message'];
      const alertRows = data.alerts.map(a => [a.type, a.message]);
      const wsAlerts = XLSX.utils.aoa_to_sheet([alertHeaders, ...alertRows]);
      XLSX.utils.book_append_sheet(wb, wsAlerts, 'Alertes');
    }

    XLSX.writeFile(wb, `rapport_${fileName}.xlsx`);
    toast.success('Export Excel généré avec succès !');
  };

  const handleExportWord = () => {
    const ai = data.ai_insights;
    const content = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
    h1 { color: #1E3A8A; border-bottom: 2px solid #1E3A8A; padding-bottom: 10px; }
    h2 { color: #1E3A8A; margin-top: 30px; }
    h3 { color: #3B82F6; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th { background: #1E3A8A; color: white; padding: 8px; text-align: left; }
    td { padding: 8px; border-bottom: 1px solid #ddd; }
    .score { background: #EFF6FF; border-radius: 8px; padding: 15px; display: inline-block; }
    .insight { background: #f8f9fa; border-left: 4px solid #3B82F6; padding: 12px; margin: 8px 0; border-radius: 4px; }
    .action { background: #f0fdf4; padding: 10px; margin: 6px 0; border-radius: 4px; }
    .alert { background: #FEE2E2; color: #DC2626; padding: 10px; border-radius: 5px; margin: 5px 0; }
  </style>
</head>
<body>
  <h1>📊 Smart Excel Analyzer — Rapport IA</h1>
  <p><strong>Fichier :</strong> ${fileName}</p>
  <p><strong>Date :</strong> ${new Date().toLocaleDateString('fr-FR')}</p>

  ${ai ? `
  <h2>✨ Analyse Intelligente — ${ai.domaine}</h2>
  <div class="score"><strong>Score santé : ${ai.score_sante}/100</strong><br>${ai.score_explication || ''}</div>
  <p>${ai.resume_executif}</p>

  ${ai.insights && ai.insights.length > 0 ? `
  <h2>💡 Insights</h2>
  ${ai.insights.map(i => `
    <div class="insight">
      <strong>${i.icone} ${i.titre}</strong> [${i.priorite}]<br>
      <em>${i.observation}</em><br>
      <strong>Conseil :</strong> ${i.conseil}
    </div>
  `).join('')}` : ''}

  ${ai.points_forts && ai.points_forts.length > 0 ? `
  <h2>✅ Points forts</h2>
  <ul>${ai.points_forts.map(p => `<li>${p}</li>`).join('')}</ul>` : ''}

  ${ai.points_faibles && ai.points_faibles.length > 0 ? `
  <h2>⚠️ Points faibles</h2>
  <ul>${ai.points_faibles.map(p => `<li>${p}</li>`).join('')}</ul>` : ''}

  ${ai.plan_action && ai.plan_action.length > 0 ? `
  <h2>📋 Plan d'action</h2>
  ${ai.plan_action.map(a => `
    <div class="action">
      <strong>${a.priorite}. ${a.action}</strong><br>
      ⏱️ ${a.delai} | 👤 ${a.responsable || ''} | 💥 ${a.impact}
    </div>
  `).join('')}` : ''}

  ${ai.conclusion ? `<h2>🎯 Conclusion</h2><p>${ai.conclusion}</p>` : ''}
  ` : ''}

  <h2>📊 Indicateurs clés</h2>
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
  <h2>🚨 Alertes</h2>
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
    const ai = data.ai_insights;
    const slides = [
      `<div class="slide" style="background:#1E3A8A;">
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;">
          <div style="font-size:60px;">📊</div>
          <h1 style="color:white;font-size:40px;margin:20px 0;">Smart Excel Analyzer</h1>
          <p style="color:#DBEAFE;font-size:22px;">${ai ? ai.domaine : 'Rapport'} — ${fileName}</p>
          <p style="color:#93C5FD;font-size:16px;">${new Date().toLocaleDateString('fr-FR')}</p>
        </div>
      </div>`,

      ai ? `<div class="slide">
        <h2 style="color:#1E3A8A;border-bottom:3px solid #1E3A8A;padding-bottom:15px;">✨ Analyse IA</h2>
        <div style="display:flex;gap:30px;margin-top:30px;align-items:flex-start;">
          <div style="flex:1;">
            <p style="font-size:18px;color:#374151;line-height:1.6;">${ai.resume_executif}</p>
            ${ai.conclusion ? `<p style="margin-top:20px;color:#3B82F6;font-weight:bold;font-size:16px;">🎯 ${ai.conclusion}</p>` : ''}
          </div>
          <div style="background:#EFF6FF;border-radius:16px;padding:30px;text-align:center;min-width:160px;">
            <div style="font-size:48px;font-weight:bold;color:#1E3A8A;">${ai.score_sante}</div>
            <div style="color:#6B7280;font-size:16px;">Score santé /100</div>
          </div>
        </div>
      </div>` : '',

      ai && ai.insights && ai.insights.length > 0 ? `<div class="slide">
        <h2 style="color:#1E3A8A;border-bottom:3px solid #1E3A8A;padding-bottom:15px;">💡 Insights clés</h2>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:30px;">
          ${ai.insights.slice(0, 4).map(ins => `
          <div style="background:#f8f9fa;border-left:4px solid #3B82F6;padding:15px;border-radius:8px;">
            <div style="font-weight:bold;color:#1E3A8A;margin-bottom:8px;">${ins.icone} ${ins.titre}</div>
            <div style="color:#6B7280;font-size:13px;">${ins.observation}</div>
          </div>`).join('')}
        </div>
      </div>` : '',

      ai && ai.plan_action && ai.plan_action.length > 0 ? `<div class="slide">
        <h2 style="color:#1E3A8A;border-bottom:3px solid #1E3A8A;padding-bottom:15px;">📋 Plan d'action</h2>
        <div style="margin-top:30px;display:flex;flex-direction:column;gap:15px;">
          ${ai.plan_action.map(a => `
          <div style="display:flex;gap:20px;align-items:center;background:#f0fdf4;padding:15px;border-radius:12px;">
            <div style="width:40px;height:40px;border-radius:50%;background:${a.priorite === 1 ? '#EF4444' : a.priorite === 2 ? '#F97316' : '#3B82F6'};color:white;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:18px;flex-shrink:0;">${a.priorite}</div>
            <div>
              <div style="font-weight:bold;color:#1E3A8A;">${a.action}</div>
              <div style="color:#6B7280;font-size:13px;">⏱️ ${a.delai} | 💥 ${a.impact}</div>
            </div>
          </div>`).join('')}
        </div>
      </div>` : '',

      data.kpis.length > 0 ? `<div class="slide">
        <h2 style="color:#1E3A8A;border-bottom:3px solid #1E3A8A;padding-bottom:15px;">📊 Indicateurs clés</h2>
        <table style="width:100%;border-collapse:collapse;margin-top:30px;font-size:15px;">
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
      </div>` : '',
    ].filter(Boolean);

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Presentation — ${fileName}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Segoe UI',Arial,sans-serif; background:#111; }
    .slide { width:1280px; height:720px; background:white; padding:60px; margin:20px auto; border-radius:12px; position:relative; box-shadow:0 10px 40px rgba(0,0,0,0.3); page-break-after:always; overflow:hidden; }
    @media print { body { background:white; } .slide { margin:0; border-radius:0; box-shadow:none; } }
  </style>
</head>
<body>${slides.join('')}</body>
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
        .insert([{ share_id: shareId, file_name: fileName, analysis_data: data }]);
      if (!error) {
        const shareUrl = `${window.location.origin}/share/${shareId}`;
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Lien copié ! Valable 7 jours.');
      } else {
        toast.error('Erreur lors du partage.');
      }
    } catch (err) {
      toast.error('Erreur lors du partage.');
    }
  };

  return (
    <div className="flex flex-col gap-8">

      {/* Header */}
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
            <button onClick={handleExportExcel} className="bg-green-600 text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-green-700 transition flex items-center gap-1">
              📊 {t.exportExcel}
            </button>
            <button onClick={handleExportWord} className="bg-blue-700 text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-blue-800 transition flex items-center gap-1">
              📝 {t.exportWord}
            </button>
            <button onClick={handleExportPPT} className="bg-orange-500 text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-orange-600 transition flex items-center gap-1">
              🎯 {t.exportPPT}
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

      {/* Résumé */}
      <div className="grid grid-cols-3 gap-4">
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
      </div>

      {/* Alertes */}
      {data.alerts && data.alerts.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-bold text-primary">🚨 {t.alerts}</h3>
          {data.alerts.map((alert, i) => (
            <div key={i} className={`px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3 ${
              alert.type === 'danger' ? 'bg-red-50 text-red-700 border border-red-200' :
              'bg-orange-50 text-orange-700 border border-orange-200'
            }`}>
              <span className="text-xl">{alert.type === 'danger' ? '🔴' : '🟡'}</span>
              {alert.message}
            </div>
          ))}
        </div>
      )}

      {/* Analyse IA complète */}
      <AIInsightsBlock ai={data.ai_insights} />

      {/* KPIs */}
      {data.kpis && data.kpis.length > 0 && (
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
      {data.charts && data.charts.length > 0 && (
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
        {!data.anomalies || data.anomalies.length === 0 ? (
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
