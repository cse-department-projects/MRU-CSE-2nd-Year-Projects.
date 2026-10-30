import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Search, MapPin, ArrowRight } from 'lucide-react';
import { useReports } from '../hooks/useReports';
import { ReportCard } from '../components/reports/ReportCard';

export const IssuesPage = () => {
  const { reports } = useReports();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All');
  const filtered = useMemo(() => reports.filter(report => {
    const matchesQuery = `${report.title} ${report.area} ${report.problemType}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (status === 'All' || report.status === status.toLowerCase());
  }), [reports, query, status]);
  return <>
    <section className="page-hero"><div className="mx-auto max-w-7xl px-4 py-9 sm:px-5 sm:py-14 md:px-8 md:py-16"><Link to="/" className="mb-6 inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-white hover:bg-white/25 sm:mb-7">← &nbsp;Back to Home</Link><div className="flex flex-col gap-4 sm:flex-row sm:items-start"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/15 sm:h-16 sm:w-16"><ClipboardList size={25}/></span><div className="min-w-0"><h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">Issues Raised</h1><p className="mt-3 max-w-3xl text-base leading-7 text-white/80 sm:text-lg sm:leading-8">See what your community cares about. Every report is a first step toward a cleaner, safer place to live.</p></div></div></div></section>
    <section className="mx-auto max-w-7xl px-5 py-12 md:px-8"><div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-3xl text-forest-950">Community reports</h2><p className="mt-1 text-forest-600">{filtered.length} {filtered.length === 1 ? 'report' : 'reports'} on this device</p></div><Link to="/report" className="action-button self-start">Report an issue <ArrowRight size={17}/></Link></div><div className="mb-7 flex flex-col gap-3 rounded-2xl border border-forest-100 bg-white p-4 sm:flex-row"><label className="relative flex-1"><Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-leaf-600"/><input className="field pl-11" type="search" placeholder="Search title, location or issue type..." value={query} onChange={e=>setQuery(e.target.value)}/></label><select className="field sm:max-w-48" value={status} onChange={e=>setStatus(e.target.value)} aria-label="Filter by status"><option>All</option><option>Pending</option><option>Reviewed</option><option>Resolved</option></select></div>{filtered.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{filtered.map(report=><ReportCard key={report.id} report={report}/>)}</div> : <div className="surface-card flex flex-col items-center px-6 py-16 text-center"><span className="grid h-16 w-16 place-items-center rounded-full bg-leaf-50 text-leaf-600"><MapPin size={30}/></span><h3 className="mt-5 text-2xl">{reports.length ? 'No matching reports' : 'No reports yet'}</h3><p className="mt-2 max-w-md text-forest-600">{reports.length ? 'Try another search or filter.' : 'Be the first to share an environmental issue in your area.'}</p>{!reports.length&&<Link to="/report" className="action-button mt-6">Submit a report <ArrowRight size={17}/></Link>}</div>}</section>
  </>;
};
