import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { trainingApi } from '@/api/trainingApi';
import { DataTable } from '@/components/shared/DataTable';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';

export default function RecentTrainingWidget({ coachId, athleteId }) {
  const { data, isLoading } = useQuery({
    queryKey: ['recent-training', coachId, athleteId],
    queryFn: () => trainingApi.getTrainingSessions({ page: 1, pageSize: 5, coachId, athleteId, sortDir: 'desc' }),
  });

  const columns = [
    {
      header: 'Date',
      cell: (row) => new Date(row.sessionDate).toLocaleDateString()
    },
    {
      header: 'Description',
      accessorKey: 'description',
      cell: (row) => <span className="font-medium">{row.description || 'Training Session'}</span>
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (row) => (
        <Badge variant="outline" className={
          row.status === 'Completed' ? 'bg-green-100 text-green-800' :
          row.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' : ''
        }>
          {row.status}
        </Badge>
      )
    },
  ];

  return (
    <Card className="card-premium h-full">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-indigo-100 rounded-lg text-indigo-700">
            <Calendar className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-bold">Recent Training</h3>
        </div>
        <DataTable 
          columns={columns}
          data={data?.items || []}
          isLoading={isLoading}
          pageCount={1}
          pageIndex={1}
          pageSize={5}
          onPageChange={() => {}}
          emptyMessage="No training sessions found."
        />
      </CardContent>
    </Card>
  );
}
