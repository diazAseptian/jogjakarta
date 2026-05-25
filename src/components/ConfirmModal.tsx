import React from 'react';

interface Props {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({ open, title, message, confirmLabel = 'Hapus', cancelLabel = 'Batal', onConfirm, onCancel }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-lg w-[92%] max-w-md p-5">
        {title && <p className="font-semibold text-gray-800 mb-2">{title}</p>}
        <p className="text-sm text-gray-600 mb-4">{message}</p>
        <div className="flex gap-2 justify-end">
          <button onClick={onCancel} className="px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">{cancelLabel}</button>
          <button onClick={onConfirm} className="px-3 py-2 rounded-xl bg-red-500 text-white text-sm hover:bg-red-600">{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
