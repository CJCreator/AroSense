import React from 'react';

interface LogListProps<T> {
  logs: T[];
  renderLog: (log: T) => React.ReactNode;
  onEdit?: (log: T) => void;
  onDelete?: (log: T) => void;
  isLoading?: boolean;
  emptyText?: string;
}

function LogList<T>({ logs, renderLog, onEdit, onDelete, isLoading = false, emptyText = 'No logs yet.' }: LogListProps<T>) {
  if (isLoading) return <p className="text-textSecondary text-center py-4">Loading logs...</p>;
  if (!logs.length) return <p className="text-textSecondary text-center py-4">{emptyText}</p>;
  return (
    <ul className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
      {logs.map((log, idx) => (
        <li key={(log as any).id || idx} className="p-3 bg-slate-50 rounded-lg shadow-sm">
          {renderLog(log)}
          {(onEdit || onDelete) && (
            <div className="flex space-x-1 mt-2">
              {onEdit && <button onClick={() => onEdit(log)} className="p-1.5 text-blue-600 hover:text-blue-800" aria-label="Edit log">Edit</button>}
              {onDelete && <button onClick={() => onDelete(log)} className="p-1.5 text-red-600 hover:text-red-800" aria-label="Delete log">Delete</button>}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

export default LogList;
