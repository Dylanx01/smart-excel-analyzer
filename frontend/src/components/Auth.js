import React, { useState } from 'react';
import { supabase } from '../supabase';

function Auth({ language, onAuth }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fr = language === 'fr';

  const handleLogin = async () => {
    if (!email || !password) {
      setError(fr ? 'Veuillez remplir tous les champs.' : 'Please fill all fields.');
      return;
    }
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(fr ? 'Email ou mot de passe incorrect.' : 'Invalid email or password.');
    } else {
      onAuth();
    }
    setLoading(false);
  };

  const handleRegister = async () => {
    if (!email || !password || !name) {
      setError(fr ? 'Veuillez remplir tous les champs.' : 'Please fill all fields.');
      return;
    }
    if (password.length < 6) {
      setError(fr ? 'Le mot de passe doit contenir au moins 6 caractères.' : 'Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } }
    });
    if (error) {
      setError(fr ? 'Erreur lors de l\'inscription.' : 'Registration error.');
    } else {
      setSuccess(fr
        ? 'Compte créé ! Vérifiez votre email pour confirmer votre inscription.'
        : 'Account created! Check your email to confirm your registration.'
      );
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">

      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-primary rounded-2xl p-3 shadow-lg">
          <span className="text-4xl">📊</span>
        </div>
        <div>
          <h1 className="text-2xl font-black text-primary">Smart Excel Analyzer</h1>
          <p className="text-gray-400 text-sm">
            {fr ? 'Analyse automatique & intelligente' : 'Automatic & intelligent analysis'}
          </p>
        </div>
      </div>

      {/* Card */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 w-full max-w-md">

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
          <button
            onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition ${
              mode === 'login' ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-primary'
            }`}
          >
            🔐 {fr ? 'Connexion' : 'Login'}
          </button>
          <button
            onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition ${
              mode === 'register' ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-primary'
            }`}
          >
            ✨ {fr ? 'Inscription' : 'Register'}
          </button>
        </div>

        {/* Titre */}
        <h2 className="text-xl font-black text-primary mb-1">
          {mode === 'login'
            ? (fr ? 'Bon retour 👋' : 'Welcome back 👋')
            : (fr ? 'Créer un compte 🚀' : 'Create an account 🚀')
          }
        </h2>
        <p className="text-gray-400 text-sm mb-6">
          {mode === 'login'
            ? (fr ? 'Connectez-vous pour accéder à vos espaces' : 'Login to access your workspaces')
            : (fr ? 'Rejoignez Smart Excel Analyzer' : 'Join Smart Excel Analyzer')
          }
        </p>

        {/* Formulaire */}
        <div className="flex flex-col gap-4">

          {mode === 'register' && (
            <div>
              <label className="text-xs font-bold text-gray-500 mb-1 block">
                {fr ? 'Nom complet' : 'Full name'}
              </label>
              <input
                type="text"
                placeholder={fr ? 'Jean Dupont' : 'John Doe'}
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-secondary focus:ring-2 focus:ring-accent transition"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-gray-500 mb-1 block">Email</label>
            <input
              type="email"
              placeholder="exemple@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-secondary focus:ring-2 focus:ring-accent transition"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 mb-1 block">
              {fr ? 'Mot de passe' : 'Password'}
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (mode === 'login' ? handleLogin() : handleRegister())}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-secondary focus:ring-2 focus:ring-accent transition"
            />
          </div>

          {/* Erreur */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
              <span>❌</span> {error}
            </div>
          )}

          {/* Succès */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
              <span>✅</span> {success}
            </div>
          )}

          {/* Bouton */}
          <button
            onClick={mode === 'login' ? handleLogin : handleRegister}
            disabled={loading}
            className="bg-primary text-white font-bold py-3 rounded-xl hover:bg-secondary transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? (fr ? 'Chargement...' : 'Loading...')
              : mode === 'login'
                ? (fr ? '🔐 Se connecter' : '🔐 Login')
                : (fr ? '🚀 Créer mon compte' : '🚀 Create my account')
            }
          </button>

        </div>

        {/* Footer card */}
        <p className="text-center text-gray-300 text-xs mt-6">
          {fr ? 'Vos données sont sécurisées 🔒' : 'Your data is secure 🔒'}
        </p>

      </div>

      {/* Footer page */}
      <p className="text-gray-300 text-xs mt-6">
        Smart Excel Analyzer — {fr ? 'Conçu pour les PME africaines 🌍' : 'Built for African SMEs 🌍'}
      </p>

    </div>
  );
}

export default Auth;