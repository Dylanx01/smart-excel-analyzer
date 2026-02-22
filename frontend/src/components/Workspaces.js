import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useToast } from './Toast';
import ConfirmModal from './ConfirmModal';

const ICONS = ['📁', '👥', '📊', '💰', '📋', '🏢', '📝', '⚙️', '🏥', '🎓', '🛒', '🏦'];
const COLORS = ['#1E3A8A', '#DC2626', '#16A34A', '#D97706', '#7C3AED', '#0891B2', '#DB2777', '#EA580C'];

const translations = {
  fr: {
    title: "Mes espaces de travail",
    subtitle: "Organisez vos fichiers Excel par catégorie",
    newWorkspace: "Nouvel espace",
    createWorkspace: "Créer l'espace",
    editWorkspace: "Modifier l'espace",
    saveChanges: "Sauvegarder",
    cancel: "Annuler",
    workspaceName: "Nom de l'espace",
    workspaceDesc: "Description (optionnelle)",
    noWorkspaces: "Aucun espace créé — créez votre premier espace !",
    files: "fichier(s)",
    open: "Ouvrir",
    delete: "Supprimer",
    edit: "Modifier",
    chooseIcon: "Choisir une icône",
    chooseColor: "Choisir une couleur",
    examples: "Exemples : RH, Finance, Ventes, Santé...",
    search: "Rechercher un espace...",
    noResults: "Aucun espace trouvé pour cette recherche",
    sortDate: "Date",
    sortName: "Nom",
  },
  en: {
    title: "My Workspaces",
    subtitle: "Organize your Excel files by category",
    newWorkspace: "New workspace",
    createWorkspace: "Create workspace",
    editWorkspace: "Edit workspace",
    saveChanges: "Save changes",
    cancel: "Cancel",
    workspaceName: "Workspace name",
    workspaceDesc: "Description (optional)",
    noWorkspaces: "No workspace yet — create your first one!",
    files: "file(s)",
    open: "Open",
    delete: "Delete",
    edit: "Edit",
    chooseIcon: "Choose an icon",
    chooseColor: "Choose a color",
    examples: "Examples: HR, Finance, Sales, Health...",
    search: "Search a workspace...",
    noResults: "No workspace found for this search",
    sortDate: "Date",
    sortName: "Name",
  }
};

function EditModal({ workspace, onSave, onCancel, t }) {
  const [name, setName] = useState(workspace.name);
  const [description, setDescription] = useState(workspace.description || '');
  const [icon, setIcon] = useState(workspace.icon);
  const [color, setColor] = useState(workspace.color);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 flex flex-col gap-5">

        <h3 className="font-black text-primary text-xl">✏️ {t.editWorkspace}</h3>

        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder={t.workspaceName}
          className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-secondary transition"
        />
        <input
          type="text"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder={t.workspaceDesc}
          className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-secondary transition"
        />

        {/* Icônes */}
        <div>
          <p className="text-sm text-gray-500 mb-2 font-semibold">{t.chooseIcon}</p>
          <div className="flex gap-2 flex-wrap">
            {ICONS.map(i => (
              <button
                key={i}
                onClick={() => setIcon(i)}
                className={`text-2xl p-3 rounded-xl transition ${
                  icon === i
                    ? 'bg-accent border-2 border-secondary scale-110'
                    : 'bg-gray-50 hover:bg-accent border-2 border-transparent'
                }`}
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        {/* Couleurs */}
        <div>
          <p className="text-sm text-gray-500 mb-2 font-semibold">{t.chooseColor}</p>
          <div className="flex gap-3">
            {COLORS.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                style={{ background: c }}
                className={`w-10 h-10 rounded-xl transition ${
                  color === c ? 'ring-4 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-105'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            style={{ background: color + '20' }}
          >
            {icon}
          </div>
          <div>
            <p className="font-bold text-primary">{name || 'Nom de l\'espace'}</p>
            <p className="text-gray-400 text-xs">{description || 'Description...'}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onSave({ name, description, icon, color })}
            className="bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-secondary transition flex-1"
          >
            ✅ {t.saveChanges}
          </button>
          <button
            onClick={onCancel}
            className="bg-gray-100 text-gray-600 font-bold px-6 py-3 rounded-xl hover:bg-gray-200 transition"
          >
            {t.cancel}
          </button>
        </div>
      </div>
    </div>
  );
}

function Workspaces({ language, onOpenWorkspace }) {
  const t = translations[language];
  const toast = useToast();
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [editWorkspace, setEditWorkspace] = useState(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date');
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
    if (!name.trim()) {
      toast.warning('Veuillez entrer un nom pour l\'espace.');
      return;
    }
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
      toast.success(`Espace "${name}" créé avec succès !`);
    } else {
      toast.error('Erreur lors de la création.');
    }
  };

  const updateWorkspace = async ({ name, description, icon, color }) => {
    if (!name.trim()) {
      toast.warning('Veuillez entrer un nom pour l\'espace.');
      return;
    }
    const { error } = await supabase
      .from('categories')
      .update({ name, description, icon, color })
      .eq('id', editWorkspace.id);
    if (!error) {
      fetchWorkspaces();
      toast.success(`Espace "${name}" modifié avec succès !`);
      setEditWorkspace(null);
    } else {
      toast.error('Erreur lors de la modification.');
    }
  };

  const deleteWorkspace = async (id) => {
    const ws = workspaces.find(w => w.id === id);
    await supabase.from('categories').delete().eq('id', id);
    fetchWorkspaces();
    toast.success(`Espace "${ws?.name}" supprimé.`);
    setConfirmDelete(null);
  };

  const filteredWorkspaces = workspaces
    .filter(ws => ws.name.toLowerCase().includes(search.toLowerCase()) ||
      ws.description?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return new Date(b.created_at) - new Date(a.created_at);
    });

  return (
    <div className="flex flex-col gap-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-primary">{t.title}</h2>
          <p className="text-gray-400 text-sm">{t.subtitle}</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary text-white font-bold px-5 py-3 rounded-2xl hover:bg-secondary transition shadow-sm flex items-center gap-2"
        >
          ➕ {t.newWorkspace}
        </button>
      </div>

      {/* Formulaire création */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-primary text-lg mb-4">✨ Créer un espace</h3>
          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder={t.workspaceName}
              value={name}
              onChange={e => setName(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-secondary focus:ring-2 focus:ring-accent transition"
            />
            <input
              type="text"
              placeholder={t.examples}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-secondary focus:ring-2 focus:ring-accent transition"
            />

            {/* Icônes */}
            <div>
              <p className="text-sm text-gray-500 mb-2 font-semibold">{t.chooseIcon}</p>
              <div className="flex gap-2 flex-wrap">
                {ICONS.map(i => (
                  <button
                    key={i}
                    onClick={() => setIcon(i)}
                    className={`text-2xl p-3 rounded-xl transition ${
                      icon === i
                        ? 'bg-accent border-2 border-secondary scale-110'
                        : 'bg-gray-50 hover:bg-accent border-2 border-transparent'
                    }`}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>

            {/* Couleurs */}
            <div>
              <p className="text-sm text-gray-500 mb-2 font-semibold">{t.chooseColor}</p>
              <div className="flex gap-3">
                {COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    style={{ background: c }}
                    className={`w-10 h-10 rounded-xl transition ${
                      color === c ? 'ring-4 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-105'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{ background: color + '20' }}
              >
                {icon}
              </div>
              <div>
                <p className="font-bold text-primary">{name || 'Nom de l\'espace'}</p>
                <p className="text-gray-400 text-xs">{description || 'Description...'}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={createWorkspace}
                className="bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-secondary transition flex-1"
              >
                ✅ {t.createWorkspace}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="bg-gray-100 text-gray-600 font-bold px-6 py-3 rounded-xl hover:bg-gray-200 transition"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barre recherche + tri */}
      {workspaces.length > 0 && (
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder={t.search}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-secondary transition"
            />
          </div>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-secondary transition bg-white"
          >
            <option value="date">📅 {t.sortDate}</option>
            <option value="name">🔤 {t.sortName}</option>
          </select>
        </div>
      )}

      {/* Liste workspaces */}
      {loading ? (
        <div className="text-center text-gray-400 py-16">
          <div className="text-4xl mb-4 animate-bounce">📂</div>
          <p>Chargement...</p>
        </div>
      ) : workspaces.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-gray-100">
          <div className="text-6xl mb-4">📂</div>
          <h3 className="text-xl font-bold text-primary mb-2">{t.noWorkspaces}</h3>
          <p className="text-gray-400 text-sm mb-6">Créez un espace pour organiser vos fichiers Excel</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-primary text-white font-bold px-6 py-3 rounded-2xl hover:bg-secondary transition"
          >
            ➕ {t.newWorkspace}
          </button>
        </div>
      ) : filteredWorkspaces.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-gray-400 text-sm">{t.noResults}</p>
          <button
            onClick={() => setSearch('')}
            className="mt-3 text-secondary text-sm font-bold hover:underline"
          >
            Effacer la recherche
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWorkspaces.map(ws => (
            <div
              key={ws.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4 hover:shadow-md transition group"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 group-hover:scale-105 transition"
                  style={{ background: ws.color + '20' }}
                >
                  {ws.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-primary truncate">{ws.name}</h3>
                  {ws.description && (
                    <p className="text-gray-400 text-xs truncate">{ws.description}</p>
                  )}
                </div>
              </div>

              <div
                className="rounded-xl px-4 py-3 flex items-center justify-between"
                style={{ background: ws.color + '10' }}
              >
                <span className="text-sm font-bold" style={{ color: ws.color }}>
                  📊 {ws.files?.[0]?.count || 0} {t.files}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(ws.created_at).toLocaleDateString('fr-FR')}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => onOpenWorkspace(ws)}
                  style={{ background: ws.color }}
                  className="text-white text-sm font-bold px-4 py-2 rounded-xl flex-1 hover:opacity-90 transition flex items-center justify-center gap-2"
                >
                  📂 {t.open}
                </button>
                <button
                  onClick={() => setEditWorkspace(ws)}
                  className="bg-blue-50 text-blue-500 text-sm font-bold px-3 py-2 rounded-xl hover:bg-blue-100 transition"
                >
                  ✏️
                </button>
                <button
                  onClick={() => setConfirmDelete(ws)}
                  className="bg-red-50 text-red-500 text-sm font-bold px-3 py-2 rounded-xl hover:bg-red-100 transition"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal édition */}
      {editWorkspace && (
        <EditModal
          workspace={editWorkspace}
          onSave={updateWorkspace}
          onCancel={() => setEditWorkspace(null)}
          t={t}
        />
      )}

      <ConfirmModal
        isOpen={!!confirmDelete}
        title="Supprimer l'espace ?"
        message={`L'espace "${confirmDelete?.name}" et tous ses fichiers seront supprimés définitivement.`}
        onConfirm={() => deleteWorkspace(confirmDelete?.id)}
        onCancel={() => setConfirmDelete(null)}
      />

    </div>
  );
}

export default Workspaces;