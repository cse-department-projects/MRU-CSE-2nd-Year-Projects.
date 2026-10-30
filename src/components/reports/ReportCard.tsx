import type { Report } from '../../types';
import { useObjectUrl } from '../../hooks/useObjectUrl';
import { timeAgo } from '../../utils/timeAgo';
import { MapPin, ThumbsUp, Image as ImageIcon, Trash2 } from 'lucide-react';
import { useReports } from '../../hooks/useReports';

export const ReportCard = ({ report }: { report: Report }) => {
  const imageUrl = useObjectUrl(report.imageId);
  const displayUrl = report.imageUrl || imageUrl;
  const { upvotedReportIds, toggleReportUpvote, deleteReport } = useReports();
  const hasUpvoted = upvotedReportIds.includes(report.id);
  const handleDelete = () => {
    if (window.confirm(`Delete “${report.title}”? This cannot be undone.`)) deleteReport(report.id);
  };
  return <article className="surface-card flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg">
    {displayUrl ? <img src={displayUrl} alt={report.title} className="h-48 w-full object-cover"/> : <div className="flex h-24 items-center justify-center gap-2 bg-gradient-to-br from-leaf-50 to-forest-100 text-sm text-forest-600"><ImageIcon size={18}/>No photo attached</div>}
    <div className="flex flex-grow flex-col p-5"><div className="mb-2 flex flex-wrap gap-2"><span className="rounded-full bg-leaf-50 px-3 py-1 text-xs font-bold capitalize text-leaf-600">{report.status}</span><span className="rounded-full bg-earth-100 px-3 py-1 text-xs font-bold text-forest-700">{report.problemType}</span></div><h3 className="mb-1 font-heading text-lg font-bold">{report.title}</h3><p className="mb-2 flex items-center gap-1.5 text-sm text-forest-600"><MapPin size={15}/>{report.area}</p><p className="mb-4 line-clamp-3 text-sm leading-6">{report.description}</p><div className="mt-auto flex items-center justify-between border-t border-forest-100 pt-3 text-xs text-forest-500"><span>{timeAgo(report.createdAt)}</span><div className="flex items-center gap-2"><button type="button" onClick={() => toggleReportUpvote(report.id)} aria-pressed={hasUpvoted} aria-label={`${hasUpvoted ? 'Remove your upvote from' : 'Upvote'} ${report.title}`} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-bold transition ${hasUpvoted ? 'border-leaf-500 bg-leaf-50 text-leaf-600' : 'border-forest-100 text-forest-600 hover:border-leaf-500 hover:bg-leaf-50 hover:text-leaf-600'}`}><ThumbsUp size={15} fill={hasUpvoted ? 'currentColor' : 'none'}/>{report.upvotes}</button>{report.isOwn && <button type="button" onClick={handleDelete} aria-label={`Delete report: ${report.title}`} className="inline-flex items-center justify-center rounded-full border border-red-100 p-2 text-red-600 transition hover:border-red-200 hover:bg-red-50"><Trash2 size={15}/></button>}</div></div></div>
  </article>;
};
