import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { matchApi } from '@/api/matchApi';
import { DataTable } from '@/components/shared/DataTable';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy } from 'lucide-react';

export default function CompetitionsTab({ athleteId }) {
  const { data, isLoading } = useQuery({
    queryKey: ['match-results', athleteId],
    queryFn: () => matchApi.getMatchResultsByAthlete(athleteId),
    enabled: !!athleteId
  });

  const getMedalBadge = (medal) => {
    switch(medal) {
      case 'GOLD': return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 shadow-sm"><Trophy className="h-3 w-3 mr-1 text-yellow-600"/> Gold</Badge>;
      case 'SILVER': return <Badge className="bg-gray-100 text-gray-800 border-gray-300 shadow-sm"><Trophy className="h-3 w-3 mr-1 text-gray-500"/> Silver</Badge>;
      case 'BRONZE': return <Badge className="bg-orange-100 text-orange-900 border-orange-300 shadow-sm"><Trophy className="h-3 w-3 mr-1 text-orange-700"/> Bronze</Badge>;
      default: return '-';
    }
  };

  const columns = [
    {
      header: 'Date',
      cell: (row) => new Date(row.match?.scheduledTime || row.createdAt).toLocaleDateString()
    },
    {
      header: 'Tournament / Event',
      cell: (row) => row.match?.tournament?.name || 'General Event'
    },
    {
      header: 'Match / Category',
      cell: (row) => row.match?.name || row.match?.category || 'General Match'
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
  ];

  return (
    <div className="space-y-6">
      <Card className="card-premium">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">Competition History & Results</h3>
          </div>
          <DataTable 
            columns={columns}
            data={Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : [])}
            isLoading={isLoading}
            pageCount={1}
            pageIndex={1}
            pageSize={50}
            onPageChange={() => {}}
            emptyMessage="No competition results found for this athlete."
          />
        </CardContent>
      </Card>
    </div>
  );
}
