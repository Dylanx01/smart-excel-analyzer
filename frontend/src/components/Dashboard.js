import React from 'react';
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

function Dashboard({ data, fileName, language, onReset }) {
  const t = translations[language];

  const handlePrint = () => window.print();

  const handleExportPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(30, 58, 138);
    doc.text('Smart Excel Analyzer — Rapport', 20, 20);
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Fichier : ${fileName}`, 20, 35);
    doc.text(`Lignes : ${data.summary.total_rows}`, 20, 45);
    doc.text(`Colonnes : ${data.summary.total_columns}`, 20, 55);
    doc.text(`Valeurs manquantes : ${data.summary.missing_values}`, 20, 65);
    let y = 80;
    doc.setFontSize(14);
    doc.setTextColor(30, 58, 138);
    doc.text('Indicateurs clés :', 20, y);
    y += 10;
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    data.kpis.forEach(kpi => {
      doc.text(`${kpi.column} — Total: ${kpi.total} | Moyenne: ${kpi.average} | Min: ${kpi.min} | Max: ${kpi.max}`, 20, y);
      y += 8;
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
        doc.text(`⚠ ${alert.message}`, 20, y);
        y += 8;
      });
    }
    doc.save(`rapport_${fileName}.pdf`);
  };

  return (
    <div className="flex flex-col gap-8">

      {/* Header dashboard */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primary">Dashboard</h2>
          <p className="text-gray-500 text-sm">{t.file} : <span className="font-semibold text-secondary">{fileName}</span></p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={handleExportPDF} className="bg-red-500 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-red-600 transition">
            📄 {t.exportPDF}
          </button>
          <button onClick={handlePrint} className="bg-gray-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-gray-700 transition">
            🖨️ {t.print}
          </button>
          <button onClick={onReset} className="bg-primary text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-secondary transition">
            + {t.newFile}
          </button>
        </div>
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