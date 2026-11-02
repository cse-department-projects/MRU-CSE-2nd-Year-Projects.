import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/axios';
import { referenceApi } from '../../api/referenceApi';
import { PageLayout } from '../../components/ui/PageLayout';

export default function RecruitmentImport() {
  const { currentUser } = useAuth();
  const [file, setFile] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [organizationId, setOrganizationId] = useState(currentUser?.organizationId || '');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    referenceApi.getOrganizations()
      .then(res => {
        const orgs = Array.isArray(res) ? res : (res?.data || []);
        setOrganizations(orgs);
        if (currentUser?.organizationId) {
          setOrganizationId(String(currentUser.organizationId));
        }
      })
      .catch(console.error);
  }, [currentUser]);

  const submit = async (event) => {
    event.preventDefault();
    if (!file || !organizationId) { setError('Choose a file and organization.'); return; }
    const data = new FormData();
    data.append('file', file);
    data.append('organizationId', organizationId);
    setLoading(true); setError(''); setResult(null);
    try {
      const response = await api.post('/recruitment/import', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setResult(response.data.data);
    } catch (requestError) {
      setError(requestError.message || 'Recruitment import failed.');
    } finally { setLoading(false); }
  };

  return <PageLayout title="Import Recruitment Pipeline">
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div><h1 className="text-3xl font-bold">Recruitment Import</h1><p className="mt-2 text-muted-foreground">Add existing AthleteHub athletes to a recruitment pipeline from CSV, XLSX, or JSON.</p></div>
      <form onSubmit={submit} className="space-y-5 rounded-xl border bg-card p-6 shadow-sm">
        <div>
          <label className="mb-2 block text-sm font-medium">Recruiting Organization *</label>
          <select
            required
            value={organizationId}
            onChange={e => setOrganizationId(e.target.value)}
            disabled={Boolean(currentUser?.organizationId)}
            className="w-full rounded-md border bg-background px-3 py-2 disabled:opacity-75 disabled:cursor-not-allowed"
          >
            <option value="">-- Select Organization --</option>
            {organizations.map(org => (
              <option key={org.id} value={org.id}>{org.name}</option>
            ))}
          </select>
        </div>
        <div><label className="mb-2 block text-sm font-medium">Recruitment file</label><input required type="file" accept=".csv,.xlsx,.json" onChange={e => setFile(e.target.files?.[0] || null)} className="block w-full text-sm" /><p className="mt-2 text-xs text-muted-foreground">Required column: <code>athlete_id</code>. Optional columns: <code>stage</code>, <code>rating</code>. JSON must be an array of these objects.</p></div>
        {error && <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
        <button disabled={loading} className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground disabled:opacity-50">{loading ? 'Importing…' : 'Import recruitment records'}</button>
      </form>
      {result && <div className="rounded-xl border bg-card p-6"><h2 className="text-lg font-semibold">Import result</h2><div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4"><p>Total: {result.totalRows}</p><p>Imported: {result.imported}</p><p>Skipped: {result.skipped}</p><p>Failed: {result.failed}</p></div>{result.errors?.length > 0 && <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-destructive">{result.errors.map((item, index) => <li key={index}>{item}</li>)}</ul>}</div>}
    </div>
  </PageLayout>;
}
