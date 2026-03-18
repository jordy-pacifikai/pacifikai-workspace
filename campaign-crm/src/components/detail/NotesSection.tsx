'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  MessageSquare,
  Phone,
  Users,
  Mail,
  Facebook,
  Settings,
  Send,
  Plus,
} from 'lucide-react';
import { useNotes, useAddNote } from '@/hooks/useNotes';
import type { Note } from '@/lib/types';
import { cn } from '@/lib/utils';

const NOTE_TYPES: { value: Note['note_type']; label: string }[] = [
  { value: 'note', label: 'Note' },
  { value: 'call', label: 'Appel' },
  { value: 'meeting', label: 'Réunion' },
  { value: 'email', label: 'Email' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'system', label: 'Système' },
];

const TYPE_ICON: Record<Note['note_type'], React.ReactNode> = {
  note:     <MessageSquare size={12} />,
  call:     <Phone size={12} />,
  meeting:  <Users size={12} />,
  email:    <Mail size={12} />,
  facebook: <Facebook size={12} />,
  system:   <Settings size={12} />,
};

const TYPE_COLOR: Record<Note['note_type'], string> = {
  note:     'bg-gray-800/50 text-gray-300',
  call:     'bg-blue-900/30 text-blue-300',
  meeting:  'bg-purple-900/30 text-purple-300',
  email:    'bg-teal-900/30 text-teal-300',
  facebook: 'bg-indigo-900/30 text-indigo-300',
  system:   'bg-amber-900/30 text-amber-300',
};

interface NotesSectionProps {
  prospectId: string;
}

export function NotesSection({ prospectId }: NotesSectionProps) {
  const { data: notes = [], isLoading } = useNotes(prospectId);
  const { mutate: addNote, isPending } = useAddNote();

  const [content, setContent] = useState('');
  const [noteType, setNoteType] = useState<Note['note_type']>('note');
  const [showForm, setShowForm] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    addNote(
      {
        prospect_id: prospectId,
        content: content.trim(),
        author: 'Jordy',
        note_type: noteType,
      },
      {
        onSuccess: () => {
          setContent('');
          setShowForm(false);
        },
      }
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Add note button / form */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-lg border border-dashed border-[#222233] px-3 py-2.5 text-sm text-[#888] transition-colors hover:border-[#0D9488] hover:text-[#0D9488]"
        >
          <Plus size={14} />
          Ajouter une note
        </button>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-2 rounded-lg border border-[#222233] bg-[#0a0a12] p-3"
        >
          {/* Type selector */}
          <div className="flex gap-1 flex-wrap">
            {NOTE_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setNoteType(t.value)}
                className={cn(
                  'rounded-full px-2.5 py-0.5 text-xs transition-colors',
                  noteType === t.value
                    ? 'bg-[#0D9488] text-white'
                    : 'bg-[#141420] text-[#888] hover:text-[#e0e0e0]'
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Contenu de la note..."
            rows={3}
            className="resize-none rounded-md border border-[#222233] bg-[#141420] px-3 py-2 text-sm text-[#e0e0e0] placeholder-[#888] focus:border-[#0D9488] focus:outline-none"
            autoFocus
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-md px-3 py-1.5 text-xs text-[#888] hover:text-[#e0e0e0]"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isPending || !content.trim()}
              className="flex items-center gap-1.5 rounded-md bg-[#0D9488] px-3 py-1.5 text-xs text-white disabled:opacity-50"
            >
              <Send size={11} />
              {isPending ? 'Envoi...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      )}

      {/* Notes list */}
      {isLoading ? (
        <div className="py-4 text-center text-sm text-[#888]">Chargement...</div>
      ) : notes.length === 0 ? (
        <div className="py-6 text-center text-sm text-[#888]">Aucune note pour ce prospect</div>
      ) : (
        <div className="flex flex-col gap-2">
          {notes.map((note) => (
            <div
              key={note.id}
              className="flex flex-col gap-1.5 rounded-lg border border-[#222233] bg-[#0a0a12] p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium',
                      TYPE_COLOR[note.note_type]
                    )}
                  >
                    {TYPE_ICON[note.note_type]}
                    {NOTE_TYPES.find((t) => t.value === note.note_type)?.label}
                  </span>
                  <span className="text-xs text-[#888]">{note.author}</span>
                </div>
                <span className="text-[10px] text-[#666]">
                  {formatDistanceToNow(new Date(note.created_at), { addSuffix: true, locale: fr })}
                </span>
              </div>
              <p className="text-sm text-[#e0e0e0] leading-relaxed whitespace-pre-wrap">
                {note.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
