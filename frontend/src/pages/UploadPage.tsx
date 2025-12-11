import NoteUploadForm from "../components/upload/NoteUploadForm";

export default function UploadPage() {
  return (
    <div className="max-w-5xl mx-auto p-4 space-y-4">
      <h1 className="text-xl font-semibold mb-2">Upload Clinical Note</h1>
      <p className="text-sm text-gray-600 mb-2">
        Paste or type a clinical note. In the full system, this will be cleaned,
        de-identified, and processed by an LLM to generate summaries and ICD-10
        codes.
      </p>
      <NoteUploadForm />
    </div>
  );
}
