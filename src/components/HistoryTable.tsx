import React from "react";

type HistoryEntry = {
  timestamp: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
  status: number;
  response: string;
  duration: number;
  user?: string;
  result?: string;
};

interface HistoryTableProps {
  history: HistoryEntry[];
}

export const HistoryTable: React.FC<HistoryTableProps> = ({ history }) => {
  if (!history.length) return <div className="text-gray-500">No history found.</div>;
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-xs text-left border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Timestamp</th>
            <th className="p-2 border">Method</th>
            <th className="p-2 border">URL</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Duration (ms)</th>
          </tr>
        </thead>
        <tbody>
          {history.map((entry, i) => (
            <tr key={i} className="border-b hover:bg-gray-50">
              <td className="p-2 border whitespace-nowrap">{new Date(entry.timestamp).toLocaleString()}</td>
              <td className="p-2 border font-bold">{entry.method}</td>
              <td className="p-2 border max-w-xs truncate" title={entry.url}>{entry.url}</td>
              <td className="p-2 border">{entry.status}</td>
              <td className="p-2 border">{entry.duration}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HistoryTable;
