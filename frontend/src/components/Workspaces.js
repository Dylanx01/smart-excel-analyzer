import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

const ICONS = ['📁', '👥', '📊', '💰', '📋', '🏢', '📝', '⚙️'];
const COLORS = ['#1E3A8A', '#DC2626', '#16A34A', '#D97706', '#7C3AED', '#0891B2'];

const translations = {
  fr: {
    title: "Mes espaces de travail",
    subtitle: "Organisez vos fichiers Excel par catégorie",
    newWorkspace: "Nouvel espace",
    createWorkspace: "Créer l'espace",
    cancel: "Annuler",
    workspaceName: "Nom de l'espace",
    workspaceDesc: "Description (optionnelle)",
    noWorkspaces: "Aucun espace créé — créez votre premier espace !",
    files: "fichier(s)",
    open: "Ouvrir",
    delete: "Supprimer",
    chooseIcon: "Choisir une icône",
    chooseColor: "Choisir une couleur",
  },
  en: {
    title: "My Workspaces",
    subtitle: "Organize your Excel files by category",
    newWorkspace: "New workspace",
    createWorkspace: "Create workspace",
    cancel: "Cancel",
    workspaceName: "Workspace name",
    workspaceDesc: "Description (optional)",
    noWorkspaces: "No workspace yet — create your first one!",
    files: "file(s)",
    open: "Open",
    delete: "Delete",
    chooseIcon: "Choose an icon",
    chooseColor: "Choose a color",
  }
};

function Workspaces({ language, onOpenWorkspace }) {
  const t = translations[language];
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('📁');
  const [color, setColor] = useState('#1E3A8A');

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('categories')
      .select('*, files(count)')
      .order('created_at', { ascending: false });
    if (!error) setWorkspaces(data || []);
    setLoading(false);
  };

  const createWorkspace = async () => {
    if (!name.trim()) return;
    const { error } = await supabase
      .from('categories')
      .insert([{ name, description, icon, color }]);
    if (!error) {
      setName('');
      setDescription('');
      setIcon('📁');
      setColor('#1E3A8A');
      setShowForm(false);
      fetchWorkspaces();
    }
  };

  const deleteWorkspace = async (id) => {
    await supabase.from('categories').delete().eq('id', id);
    fetchWorkspaces();
  };

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary">{t.title}</h2>
          <p className="text-gray-500 text-sm">{t.subtitle}</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary text-white font-semibold px-4 py-2 rounded-xl hover:bg-secondary transition"
        >
          ➕ {t.newWorkspace}
        </button>
      </div>

      {/* Formulaire création */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder={t.workspaceName}
              value={name}
              onChange={e => setName(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-secondary"
            />
            <input
              type="text"
              placeholder={t.workspaceDesc}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-secondary"
            />

            {/* Icônes */}
            <div>
              <p className="text-sm text-gray-500 mb-2">{t.chooseIcon}</p>
              <div className="flex gap-2 flex-wrap">
                {ICONS.map(i => (
                  <button
                    key={i}
                    onClick={() => setIcon(i)}
                    className={`text-2xl p-2 rounded-xl transition ${icon === i ? 'bg-accent border-2 border-secondary' : 'bg-gray-100 hover:bg-accent'}`}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>

            {/* Couleurs */}
            <div>
              <p className="text-sm text-gray-500 mb-2">{t.chooseColor}</p>
              <div className="flex gap-2">
                {COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    style={{ background: c }}
                    className={`w-8 h-8 rounded-full transition ${color === c ? 'ring-4 ring-offset-2 ring-gray-400' : ''}`}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={createWorkspace}
                className="bg-primary text-white font-semibold px-6 py-2 rounded-xl hover:bg-secondary transition"
              >
                ✅ {t.createWorkspace}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="bg-gray-100 text-gray-600 font-semibold px-6 py-2 rounded-xl hover:bg-gray-200 transition"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Liste workspaces */}
      {loading ? (
        <div className="text-center text-gray-400 py-10">Chargement...</div>
      ) : workspaces.length === 0 ? (
        <div className="text-center text-gray-400 py-16 bg-white rounded-2xl border border-gray-100">
          <div className="text-5xl mb-4">📂</div>
          <p>{t.noWorkspaces}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspaces.map(ws => (
            <div key={ws.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{ background: ws.color + '20' }}
                >
                  {ws.icon}
                </div>
                <div>
                  <h3 className="font-bold text-primary">{ws.name}</h3>
                  {ws.description && <p className="text-gray-400 text-xs">{ws.description}</p>}
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                {ws.files?.[0]?.count || 0} {t.files}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => onOpenWorkspace(ws)}
                  style={{ background: ws.color }}
                  className="text-white text-sm font-semibold px-4 py-2 rounded-xl flex-1 hover:opacity-90 transition"
                >
                  📂 {t.open}
                </button>
                <button
                  onClick={() => deleteWorkspace(ws.id)}
                  className="bg-red-50 text-red-500 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-red-100 transition"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Workspaces;