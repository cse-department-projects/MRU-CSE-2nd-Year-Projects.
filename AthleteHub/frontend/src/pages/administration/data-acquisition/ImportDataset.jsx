import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';
import { organizationApi } from '../../../api/organizationApi';

const ImportDataset = () => {
  const [file, setFile] = useState(null);
  const [profile, setProfile] = useState('Olympedia');
  const [targetOrganizationId, setTargetOrganizationId] = useState('');
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [error, setError] = useState('');
  const [importResult, setImportResult] = useState(null);

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const res = await organizationApi.getOrganizations({ page_size: 100 });
        if (res && res.data) {
          setOrganizations(res.data);
        }
      } catch (e) {
        console.error('Failed to load organizations for import mapping', e);
      }
    };
    fetchOrgs();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handlePreview = async () => {
    if (!file) {
      setError('Please select a file to preview.');
      return;
    }
    setLoading(true);
    setError('');
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('profile', profile);

    try {
      const response = await api.post('/data-acquisition/preview', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setPreviewData(response.data);
    } catch (err) {
      const backendMessage = err.response?.data?.message;
      const backendError = err.response?.data?.error;
      const backendTrace = err.response?.data?.trace;
      if (backendTrace) {
        console.error("Backend Trace:", backendTrace);
      }
      setError(backendError ? `${backendError}: ${backendMessage}` : err.message || 'Error occurred during preview.');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('profile', profile);
    if (targetOrganizationId) {
      formData.append('targetOrganizationId', targetOrganizationId);
    }

    try {
      const response = await api.post('/data-acquisition/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setImportResult(response.data);
      setPreviewData(null); // Clear preview after successful import
    } catch (err) {
      setError(err.message || 'Error occurred during import.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setPreviewData(null);
    setImportResult(null);
    setError('');
    setTargetOrganizationId('');
    if (document.getElementById('file-upload')) {
      document.getElementById('file-upload').value = '';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Upload Dataset</h2>
      
      {error && (
        <div className="p-4 rounded-md bg-destructive/15 text-destructive border border-destructive/20">
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}
      
      {importResult && (
        <div className="p-4 rounded-md bg-green-50 text-green-700 border border-green-200 flex justify-between items-center">
          <div>
            <p className="font-medium">Import Job Completed. Status: {importResult.status}</p>
            <p className="text-sm mt-1">
              Total: {importResult.totalRows}, Imported: {importResult.importedRows}, Skipped: {importResult.skippedRows}
            </p>
          </div>
          <button 
            onClick={resetForm}
            className="px-3 py-1 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 transition-colors"
          >
            Import Another
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-end gap-4 p-5 bg-muted/30 rounded-lg border">
        <div className="flex-1 min-w-[180px]">
          <label className="block text-sm font-medium mb-2">Mapping Profile</label>
          <select
            value={profile}
            onChange={(e) => setProfile(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="Olympedia">Olympedia</option>
          </select>
        </div>

        <div className="flex-1 min-w-[220px]">
          <label className="block text-sm font-medium mb-2">
            Target Organization <span className="text-muted-foreground font-normal">(Optional)</span>
          </label>
          <select
            value={targetOrganizationId}
            onChange={(e) => setTargetOrganizationId(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">Global Pool (Unassigned)</option>
            {organizations.map(org => (
              <option key={org.id} value={org.id}>
                {org.name} {org.organization_code ? `(${org.organization_code})` : ''}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium mb-2">CSV File</label>
          <input
            id="file-upload"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground file:border-0 file:bg-primary file:text-primary-foreground file:mr-4 file:px-4 file:-my-2 file:h-10 file:cursor-pointer hover:file:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>
        
        <button
          onClick={handlePreview}
          disabled={!file || loading}
          className="h-10 px-6 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center min-w-[120px]"
        >
          {loading && !previewData ? (
            <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : 'Preview'}
        </button>
      </div>

      {previewData && (
        <div className="mt-8 space-y-4">
          <h3 className="text-lg font-medium">Preview Results</h3>
          
          <div className="flex flex-wrap gap-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
              Total Rows: {previewData.totalRows}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Valid: {previewData.validRows}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              Invalid: {previewData.invalidRows}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Duplicate: {previewData.duplicateRows}
            </span>
          </div>
          
          <div className="border rounded-md overflow-hidden overflow-y-auto max-h-[400px]">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted text-muted-foreground sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">First Name</th>
                  <th className="px-4 py-3 font-medium">Last Name</th>
                  <th className="px-4 py-3 font-medium">DOB</th>
                  <th className="px-4 py-3 font-medium">Country</th>
                  <th className="px-4 py-3 font-medium">Sport</th>
                  <th className="px-4 py-3 font-medium">Issues</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {previewData.previewRecords && previewData.previewRecords.map((record, index) => {
                  let rowClass = "hover:bg-muted/50 transition-colors";
                  if (!record.valid) rowClass += " bg-red-50/50";
                  else if (record.duplicate) rowClass += " bg-yellow-50/50";
                  
                  return (
                    <tr key={index} className={rowClass}>
                      <td className="px-4 py-3">
                        {record.valid && !record.duplicate && <span className="inline-flex px-2 py-1 text-[10px] font-semibold rounded bg-green-100 text-green-800">Valid</span>}
                        {!record.valid && <span className="inline-flex px-2 py-1 text-[10px] font-semibold rounded bg-red-100 text-red-800">Invalid</span>}
                        {record.valid && record.duplicate && <span className="inline-flex px-2 py-1 text-[10px] font-semibold rounded bg-yellow-100 text-yellow-800">Duplicate</span>}
                      </td>
                      <td className="px-4 py-3">{record.athlete?.firstName}</td>
                      <td className="px-4 py-3">{record.athlete?.lastName}</td>
                      <td className="px-4 py-3 text-muted-foreground">{record.athlete?.dateOfBirth}</td>
                      <td className="px-4 py-3">{record.athlete?.country}</td>
                      <td className="px-4 py-3">{record.athlete?.sport?.name}</td>
                      <td className="px-4 py-3 text-red-600 text-xs">
                        {record.errors && record.errors.join(', ')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button 
              onClick={() => setPreviewData(null)}
              className="px-4 py-2 border rounded-md font-medium hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleImport}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 disabled:opacity-50 flex items-center"
            >
              {loading && previewData ? (
                <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : null}
              Execute Import
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportDataset;
