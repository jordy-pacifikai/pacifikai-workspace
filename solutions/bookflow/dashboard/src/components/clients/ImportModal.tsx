'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, FileText, X, Download, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';

interface ImportResult {
  imported: number;
  updated: number;
  skipped: number;
  errors: string[];
}

interface ImportModalProps {
  businessId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function ImportModal({ businessId, onClose, onSuccess }: ImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && (dropped.name.endsWith('.csv') || dropped.type === 'text/csv')) {
      setFile(dropped);
      setResult(null);
    } else {
      toast.error('Seuls les fichiers CSV sont acceptes.');
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setResult(null);
    }
  }, []);

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  }

  async function handleImport() {
    if (!file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('businessId', businessId);

      const res = await fetch('/api/clients/import', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? 'Erreur lors de l\'import');
        return;
      }

      setResult(data as ImportResult);

      const total = data.imported + data.updated;
      if (total > 0) {
        toast.success(`${total} client${total > 1 ? 's' : ''} importe${total > 1 ? 's' : ''} avec succes`);
        onSuccess();
      }
    } catch {
      toast.error('Erreur reseau lors de l\'import');
    } finally {
      setLoading(false);
    }
  }

  function downloadTemplate() {
    const BOM = '\uFEFF';
    const headers = 'Nom;Telephone;Email;Notes;Tags';
    const example = 'Jean Dupont;+689 87 00 00 00;jean@email.com;Client regulier;VIP, Fidele';
    const csv = BOM + headers + '\n' + example + '\n';

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'modele-import-clients.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[61] flex items-center justify-center p-4">
        <div
          className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="import-modal-title"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
            <h2 id="import-modal-title" className="text-white font-semibold text-lg">Importer des clients</h2>
            <button
              onClick={onClose}
              aria-label="Fermer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            {/* Drop zone */}
            {!result && (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all',
                  dragging
                    ? 'border-[#25D366] bg-[#25D366]/5'
                    : file
                      ? 'border-gray-700 bg-gray-800/50'
                      : 'border-gray-700 hover:border-gray-600',
                )}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {file ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileText className="w-8 h-8 text-[#25D366]" />
                    <div className="text-left">
                      <p className="text-white text-sm font-medium truncate max-w-[200px]">
                        {file.name}
                      </p>
                      <p className="text-gray-500 text-xs">{formatFileSize(file.size)}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                        setResult(null);
                      }}
                      className="ml-2 p-1 rounded-lg text-gray-500 hover:text-white hover:bg-gray-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-300 text-sm font-medium">
                      Glissez votre fichier CSV ici
                    </p>
                    <p className="text-gray-500 text-xs mt-1">ou cliquez pour parcourir</p>
                  </>
                )}
              </div>
            )}

            {/* Results display */}
            {result && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-[#25D366]" />
                  <span className="text-white font-medium text-sm">Import termine</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-gray-800 rounded-lg p-3 text-center">
                    <p className="text-[#25D366] text-xl font-bold">{result.imported}</p>
                    <p className="text-gray-500 text-xs">Importes</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3 text-center">
                    <p className="text-blue-400 text-xl font-bold">{result.updated}</p>
                    <p className="text-gray-500 text-xs">Mis a jour</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3 text-center">
                    <p className="text-gray-400 text-xl font-bold">{result.skipped}</p>
                    <p className="text-gray-500 text-xs">Ignores</p>
                  </div>
                </div>

                {result.errors.length > 0 && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 mb-2">
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      <span className="text-red-400 text-xs font-medium">
                        {result.errors.length} erreur{result.errors.length > 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {result.errors.map((err, i) => (
                        <p key={i} className="text-red-300/80 text-xs">{err}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Template download */}
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 text-gray-400 hover:text-[#25D366] text-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Telecharger le modele CSV
            </button>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-800 text-gray-300 rounded-lg px-4 py-2.5 text-sm hover:bg-gray-700 transition-colors"
              >
                {result ? 'Fermer' : 'Annuler'}
              </button>
              {!result && (
                <button
                  onClick={handleImport}
                  disabled={!file || loading}
                  className="flex-1 bg-[#25D366] text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Import en cours...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Importer
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
