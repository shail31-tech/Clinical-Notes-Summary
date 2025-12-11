import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getNote } from "../api/notes";
import type { NoteSummary } from "../types";

export default function NoteDetailPage() {
  const { noteId } = useParams<{ noteId: string }>();
  const [note, setNote] = useState<NoteSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!noteId) return;

    setLoading(true);
    setError(null);

    getNote(noteId)
      .then((data) => {
        setNote(data);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load note from backend.");
      })
      .finally(() => setLoading(false));
  }, [noteId]);

  if (!noteId) {
    return (
      <div className="p-6">
        <p>Invalid note id.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-600">Loading note…</p>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="p-6 space-y-3">
        <p className="text-red-600">{error ?? "Note not found."}</p>
        <Link to="/" className="text-indigo-600 hover:underline text-sm">
          ← Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold mb-1">{note.title}</h1>
          <p className="text-xs text-gray-500">
            ID: {note.noteId} •{" "}
            {new Date(note.createdAt).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            note.status === "COMPLETED"
              ? "bg-emerald-100 text-emerald-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {note.status}
        </span>
      </div>

      {/* Summary sections */}
      <div className="grid md:grid-cols-2 gap-6">
        <Section title="Chief Complaint" body={note.chiefComplaint} />
        <Section
          title="History of Present Illness"
          body={note.historyOfPresentIllness}
        />
        <Section title="Assessment" body={note.assessment} />
        <Section title="Plan" body={note.plan} />
      </div>

      {/* Meds & Allergies */}
      <div className="grid md:grid-cols-2 gap-6">
        <TagSection title="Medications" items={note.medications} />
        <TagSection title="Allergies" items={note.allergies} />
      </div>

      {/* ICD-10 Codes */}
      <div className="border rounded-xl p-4">
        <h2 className="font-semibold text-lg mb-3">ICD-10 Codes</h2>
        {note.icdCodes && note.icdCodes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-4">Code</th>
                  <th className="text-left py-2 pr-4">Description</th>
                  <th className="text-left py-2">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {note.icdCodes.map((c) => (
                  <tr key={c.code} className="border-b last:border-b-0">
                    <td className="py-2 pr-4 font-mono">{c.code}</td>
                    <td className="py-2 pr-4">{c.description}</td>
                    <td className="py-2">
                      {(c.confidence * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            No ICD-10 codes extracted for this note.
          </p>
        )}
      </div>

      {/* Raw clinical note */}
      {note.rawText && (
        <div className="border rounded-xl p-4 bg-gray-50">
          <h2 className="font-semibold text-lg mb-3">Raw Clinical Note</h2>
          <pre className="whitespace-pre-wrap text-sm text-gray-800">
            {note.rawText}
          </pre>
        </div>
      )}

      <div>
        <Link to="/" className="text-indigo-600 hover:underline text-sm">
          ← Back to dashboard
        </Link>
      </div>
    </div>
  );
}

function Section({ title, body }: { title: string; body?: string }) {
  return (
    <div className="border rounded-xl p-4 h-full">
      <h2 className="font-semibold text-sm mb-2">{title}</h2>
      <p className="text-sm text-gray-800 whitespace-pre-wrap">
        {body && body.trim().length > 0 ? body : "Not available."}
      </p>
    </div>
  );
}

function TagSection({ title, items }: { title: string; items?: string[] }) {
  return (
    <div className="border rounded-xl p-4 h-full">
      <h2 className="font-semibold text-sm mb-2">{title}</h2>
      {items && items.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <span
              key={item}
              className="px-2 py-1 rounded-full bg-slate-100 text-xs text-slate-800"
            >
              {item}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">None documented.</p>
      )}
    </div>
  );
}
