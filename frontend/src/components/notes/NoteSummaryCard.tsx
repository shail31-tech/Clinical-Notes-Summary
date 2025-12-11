import type { NoteSummary } from "../../types";

type Props = {
  note: NoteSummary;
};

export default function NoteSummaryCard({ note }: Props) {
  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm space-y-2">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-lg">{note.title}</h2>
        <span className="text-xs px-2 py-1 rounded bg-gray-100">
          {note.status}
        </span>
      </div>
      {note.chiefComplaint && (
        <p>
          <span className="font-medium">Chief complaint: </span>
          {note.chiefComplaint}
        </p>
      )}
      {note.assessment && (
        <p>
          <span className="font-medium">Assessment: </span>
          {note.assessment}
        </p>
      )}
      {note.plan && (
        <p>
          <span className="font-medium">Plan: </span>
          {note.plan}
        </p>
      )}
    </div>
  );
}
