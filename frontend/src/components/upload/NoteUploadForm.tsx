import { useState } from "react";
import { uploadNote } from "../../api/notes";
import type { NoteSummary } from "../../types";
import { useNavigate } from "react-router-dom";

type Props = {
  onUploaded?: (note: NoteSummary) => void;
};

export default function NoteUploadForm({ onUploaded }: Props) {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      setError("Please paste or type a clinical note.");
      return;
    }
    if (!title.trim()) {
      setError("Please provide a short title for this note.");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const note = await uploadNote(text, title);
      onUploaded?.(note);
      navigate(`/notes/${note.noteId}`);
    } catch (err) {
      console.error(err);
      setError("Failed to upload note. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl mx-auto">
      <div>
        <label className="block text-sm font-medium mb-1">Note title</label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2 text-sm"
          placeholder="e.g., Chest pain, 54M"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Clinical note text</label>
        <textarea
          className="w-full border rounded px-3 py-2 text-sm h-64 font-mono"
          placeholder="Paste or type the clinical note here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 rounded bg-black text-white text-sm disabled:opacity-60"
      >
        {loading ? "Uploading..." : "Upload & Process"}
      </button>
    </form>
  );
}
