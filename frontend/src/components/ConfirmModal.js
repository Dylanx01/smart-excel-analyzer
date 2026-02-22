import React from 'react';

function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmColor = 'bg-red-500 hover:bg-red-600' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">

      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full mx-4 flex flex-col gap-5 animate-bounce-once">

        {/* Icône */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-3xl">
            🗑️
          </div>
        </div>

        {/* Texte */}
        <div className="text-center">
          <h3 className="text-xl font-black text-primary mb-2">{title}</h3>
          <p className="text-gray-400 text-sm">{message}</p>
        </div>

        {/* Boutons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-100 text-gray-600 font-bold px-4 py-3 rounded-xl hover:bg-gray-200 transition"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 text-white font-bold px-4 py-3 rounded-xl transition ${confirmColor}`}
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;