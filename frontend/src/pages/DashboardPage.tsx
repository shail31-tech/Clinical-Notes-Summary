import { useEffect, useState } from "react";
import { listNotes } from "../api/notes";
import type { NoteSummary } from "../types";
import { Link } from "react-router-dom";

export default function DashboardPage() {
  const [notes, setNotes] = useState<NoteSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await listNotes();
        setNotes(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load notes from backend.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p className="p-4">Loading notes...</p>;

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-3">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-xl font-semibold">Notes Dashboard</h1>
        <Link
          to="/upload"
          className="text-sm px-3 py-2 rounded bg-black text-white"
        >
          + New Note
        </Link>
      </div>

      {error && (
        <p className="text-sm text-red-600 mb-2">{error}</p>
      )}

      {notes.length === 0 && !error && (
        <p className="text-sm text-gray-500">
          No notes yet. Click &quot;New Note&quot; to upload your first one.
        </p>
      )}

      <div className="space-y-3">
        {notes.map((note) => (
          <Link
            key={note.noteId}
            to={`/notes/${note.noteId}`}
            className="block border rounded-lg p-3 hover:bg-gray-50 transition"
          >
            <div className="flex justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium truncate">{note.title}</p>
                <p className="text-xs text-gray-500">
                  {new Date(note.createdAt).toLocaleString()}
                </p>
                {note.assessment && (
                  <p className="text-xs text-gray-600 mt-1">
                    {note.assessment}
                  </p>
                )}
              </div>

              <span
                className={`text-xs px-2 py-1 h-fit rounded-full whitespace-nowrap ${
                  note.status === "COMPLETED"
                    ? "bg-emerald-100 text-emerald-800"
                    : note.status === "PENDING" || note.status === "PROCESSING"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {note.status}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
