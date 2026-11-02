import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';

const ImportHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await api.get('/data-acquisition/history');
      setHistory(response.data);
    } catch (err) {
      console.error('Failed to fetch history', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Import History</h2>
      
      <div className="border rounded-md overflow-hidden bg-background">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-muted text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Job ID</th>
              <th className="px-4 py-3 font-medium">Dataset / Source</th>
              <th className="px-4 py-3 font-medium">File Name</th>
              <th className="px-4 py-3 font-medium">Start Time</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Total Rows</th>
              <th className="px-4 py-3 font-medium">Imported</th>
              <th className="px-4 py-3 font-medium">Skipped / Failed</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {history.map((job) => (
              <tr key={job.id} className="hover:bg-muted/50 transition-colors">
                <td className="px-4 py-3 font-medium">#{job.id}</td>
                <td className="px-4 py-3">{job.datasetName} ({job.source})</td>
                <td className="px-4 py-3 text-muted-foreground">{job.fileName}</td>
                <td className="px-4 py-3">{new Date(job.startedAt).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    job.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                    job.status === 'RUNNING' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {job.status}
                  </span>
                </td>
                <td className="px-4 py-3">{job.totalRows}</td>
                <td className="px-4 py-3 font-medium text-green-600">{job.importedRows}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {job.skippedRows} ({job.duplicateRows} dup, {job.failedRows} fail)
                </td>
              </tr>
            ))}
            {history.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                  No import history found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ImportHistory;
