import type { ICDCode } from "../../types";

type Props = {
  codes?: ICDCode[];
};

export default function CodeSuggestionTable({ codes }: Props) {
  if (!codes || codes.length === 0) {
    return <p className="text-sm text-gray-500">No ICD-10 suggestions yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm border">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 border-b text-left">Code</th>
            <th className="px-3 py-2 border-b text-left">Description</th>
            <th className="px-3 py-2 border-b text-left">Confidence</th>
            <th className="px-3 py-2 border-b text-left">Rationale</th>
          </tr>
        </thead>
        <tbody>
          {codes.map((c) => (
            <tr key={c.code}>
              <td className="px-3 py-2 border-b font-mono">{c.code}</td>
              <td className="px-3 py-2 border-b">{c.description}</td>
              <td className="px-3 py-2 border-b">
                {(c.confidence * 100).toFixed(0)}%
              </td>
              <td className="px-3 py-2 border-b">{c.rationale}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
