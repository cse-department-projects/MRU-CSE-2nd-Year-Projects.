import { useReports } from '../../hooks/useReports';
import { ReportCard } from './ReportCard';

export const ReportFeed = () => {
  const { reports } = useReports();
  return (
    <div>
      <h2 className="text-2xl font-heading text-forest-950 mb-6">Recent Reports</h2>
      {reports.length === 0 ? (
        <div className="bg-white p-8 text-center rounded-xl border border-forest-100">No reports yet. Be the first to take action!</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {reports.slice(0, 10).map(report => <ReportCard key={report.id} report={report} />)}
        </div>
      )}
    </div>
  );
};
