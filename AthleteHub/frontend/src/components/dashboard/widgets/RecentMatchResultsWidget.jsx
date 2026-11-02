import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { matchApi } from '@/api/matchApi';
import { DataTable } from '@/components/shared/DataTable';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, ArrowRight } from 'lucide-react';

export default function RecentMatchResultsWidget({ athleteId, title }) {
  const { data, isLoading } = useQuery({
    queryKey: ['recent-match-results', athleteId],
    queryFn: async () => {
      if (athleteId) {
        const res = await matchApi.getMatchResultsByAthlete(athleteId);
        if (Array.isArray(res?.data)) return res.data;
        if (Array.isArray(res)) return res;
        return [];
      }
      const res = await matchApi.getMatches({ pageSize: 5 });
      if (Array.isArray(res?.data?.items)) return res.data.items;
      if (Array.isArray(res?.data)) return res.data;
      if (Array.isArray(res?.items)) return res.items;
      if (Array.isArray(res)) return res;
      return [];
    }
  });

  const getMedalBadge = (medal) => {
    switch(medal) {
      case 'GOLD': return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Gold</Badge>;
      case 'SILVER': return <Badge className="bg-gray-100 text-gray-800 border-gray-300">Silver</Badge>;
      case 'BRONZE': return <Badge className="bg-orange-100 text-orange-900 border-orange-300">Bronze</Badge>;
      default: return '-';
    }
  };

  const columns = athleteId ? [
    {
      header: 'Match',
      cell: (row) => <span className="font-semibold">{row.match?.name || row.match?.category || row.resultCode || 'Tournament Match'}</span>
    },
    {
      header: 'Rank',
      cell: (row) => row.rank ? <span className="font-bold">#{row.rank}</span> : '-'
    },
    {
      header: 'Score',
      cell: (row) => row.score || '-'
    },
    {
      header: 'Medal',
      cell: (row) => getMedalBadge(row.medal)
    },
  ] : [
    {
      header: 'Match',
      cell: (row) => <span className="font-semibold">{row.matchCode || row.tournamentName || 'Match'}</span>
    },
    {
      header: 'Teams / Players',
      cell: (row) => `${row.participantOneName || 'TBD'} vs ${row.participantTwoName || 'TBD'}`
    },
    {
      header: 'Status',
      cell: (row) => (
        <Badge variant="outline" className={row.status === 'LIVE' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}>
          {row.status || 'SCHEDULED'}
        </Badge>
      )
    }
  ];

  // Limit to 5 safely
  const list = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data?.items)
    ? data.items
    : [];
  const displayData = list.slice(0, 5);

  return (
    <Card className="card-premium h-full">
      <CardContent className="p-6">
        <div className="flex items-center justify-between gap-2 mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 dark:bg-amber-950/50 rounded-lg text-amber-700 dark:text-amber-400">
              <Trophy className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold">{title || 'Matches & Fixtures'}</h3>
          </div>
          <Link
            to="/dashboard/matches/calendar"
            className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
          >
            <span>View Schedule</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        
        <DataTable 
          columns={columns}
          data={displayData}
          isLoading={isLoading}
          pageCount={1}
          pageIndex={1}
          pageSize={5}
          onPageChange={() => {}}
          emptyMessage="No match results found."
        />
      </CardContent>
    </Card>
  );
}
