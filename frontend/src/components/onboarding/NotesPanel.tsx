import React, { useState, useEffect } from 'react';
import { notesService, Note } from '../../services/notes.service';
import { Send, Pin, Paperclip, Eye, EyeOff, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface NotesPanelProps {
  objectType: string;
  objectId: string;
  organizationId: string;
  currentUserId: string;
  allowVisibilityToggle?: boolean; // For customer onboarding
}

export function NotesPanel({
  objectType,
  objectId,
  organizationId,
  currentUserId,
  allowVisibilityToggle = false,
}: NotesPanelProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNoteBody, setNewNoteBody] = useState('');
  const [newNoteVisibility, setNewNoteVisibility] = useState<'internal' | 'shared'>('internal');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);

  useEffect(() => {
    loadNotes();
  }, [objectType, objectId]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const response = await notesService.getNotes(objectType, objectId);
      setNotes(response.data);
    } catch (error) {
      console.error('Failed to load notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNoteBody.trim()) return;

    try {
      // Extract mentions from body (@username)
      const mentions = extractMentions(newNoteBody);

      await notesService.addNote({
        organizationId,
        objectType,
        objectId,
        authorId: currentUserId,
        body: newNoteBody,
        mentions,
        visibility: newNoteVisibility,
        parentNoteId: replyingTo || undefined,
      });

      setNewNoteBody('');
      setReplyingTo(null);
      await loadNotes();
    } catch (error) {
      console.error('Failed to add note:', error);
    }
  };

  const handleTogglePin = async (noteId: string) => {
    try {
      await notesService.togglePin(noteId);
      await loadNotes();
    } catch (error) {
      console.error('Failed to toggle pin:', error);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      await notesService.deleteNote(noteId);
      await loadNotes();
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  const extractMentions = (text: string): string[] => {
    const mentionRegex = /@(\w+)/g;
    const matches = text.match(mentionRegex);
    return matches ? matches.map((m) => m.substring(1)) : [];
  };

  const highlightMentions = (text: string): React.ReactNode => {
    const parts = text.split(/(@\w+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        return (
          <span key={index} className="text-blue-600 font-medium bg-blue-50 px-1 rounded">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const displayedNotes = showPinnedOnly ? notes.filter((n) => n.pinned) : notes;

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading notes...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Notes & Updates ({notes.length})
        </h3>
        <button
          onClick={() => setShowPinnedOnly(!showPinnedOnly)}
          className={`text-sm px-3 py-1 rounded-lg flex items-center gap-1 ${
            showPinnedOnly
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Pin className="h-4 w-4" />
          {showPinnedOnly ? 'Show All' : 'Pinned Only'}
        </button>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {displayedNotes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p>No notes yet. Be the first to add one!</p>
          </div>
        ) : (
          displayedNotes.map((note) => (
            <div
              key={note.id}
              className={`border rounded-lg p-4 ${
                note.pinned ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {note.authorId.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{note.authorId}</p>
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {allowVisibilityToggle && (
                    <span
                      className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
                        note.visibility === 'shared'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {note.visibility === 'shared' ? (
                        <>
                          <Eye className="h-3 w-3" /> Shared
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-3 w-3" /> Internal
                        </>
                      )}
                    </span>
                  )}
                  {note.pinned && <Pin className="h-4 w-4 text-yellow-600 fill-yellow-600" />}
                  <button
                    onClick={() => handleTogglePin(note.id)}
                    className="text-gray-400 hover:text-yellow-600"
                    title="Pin/Unpin"
                  >
                    <Pin className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="text-sm text-gray-700 mb-2 whitespace-pre-wrap">
                {highlightMentions(note.body)}
              </div>

              {note.attachments && note.attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {note.attachments.map((attachment, idx) => (
                    <a
                      key={idx}
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs bg-gray-100 px-2 py-1 rounded flex items-center gap-1 hover:bg-gray-200"
                    >
                      <Paperclip className="h-3 w-3" />
                      {attachment.name}
                    </a>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 mt-2 pt-2 border-t">
                <button
                  onClick={() => setReplyingTo(note.id)}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  Reply
                </button>
                {note.authorId === currentUserId && (
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Note Input */}
      <div className="border-t pt-4">
        {replyingTo && (
          <div className="mb-2 text-xs text-gray-600 bg-blue-50 p-2 rounded flex items-center justify-between">
            <span>Replying to a note...</span>
            <button onClick={() => setReplyingTo(null)} className="text-blue-600 hover:text-blue-700">
              Cancel
            </button>
          </div>
        )}

        <div className="flex gap-2">
          <textarea
            value={newNoteBody}
            onChange={(e) => setNewNoteBody(e.target.value)}
            placeholder="Add a note... (use @username to mention)"
            className="flex-1 border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleAddNote();
              }
            }}
          />
          <div className="flex flex-col gap-2">
            {allowVisibilityToggle && (
              <button
                onClick={() =>
                  setNewNoteVisibility(newNoteVisibility === 'internal' ? 'shared' : 'internal')
                }
                className={`px-3 py-1 rounded text-xs ${
                  newNoteVisibility === 'shared'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
                title="Toggle visibility"
              >
                {newNoteVisibility === 'shared' ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
            )}
            <button
              onClick={handleAddNote}
              disabled={!newNoteBody.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              Send
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">Tip: Press Cmd/Ctrl + Enter to send</p>
      </div>
    </div>
  );
}
