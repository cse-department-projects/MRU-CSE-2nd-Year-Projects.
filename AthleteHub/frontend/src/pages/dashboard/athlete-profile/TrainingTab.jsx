import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { trainingApi } from '@/api/trainingApi';
import { DataTable } from '@/components/shared/DataTable';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function TrainingTab({ athleteId }) {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading } = useQuery({
    queryKey: ['training-sessions', athleteId, page],
    queryFn: () => trainingApi.getTrainingSessions({ athleteId, page, pageSize }),
    enabled: !!athleteId
  });

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Completed': return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Completed</Badge>;
      case 'Scheduled': return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Scheduled</Badge>;
      case 'Cancelled': return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Cancelled</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const columns = [
    {
      header: 'Date',
      accessorKey: 'sessionDate',
      cell: (row) => new Date(row.sessionDate).toLocaleDateString()
    },
    {
      header: 'Type / Description',
      accessorKey: 'description',
      cell: (row) => <span className="font-medium">{row.description || 'Training Session'}</span>
    },
    {
      header: 'Coach',
      accessorKey: 'coachName',
      cell: (row) => row.coachName || 'N/A'
    },
    {
      header: 'Duration',
      accessorKey: 'durationMinutes',
      cell: (row) => `${row.durationMinutes || 0} mins`
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (row) => getStatusBadge(row.status)
    }
  ];

  const totalPages = data?.total_pages || 1;

  return (
    <div className="space-y-6">
      <Card className="card-premium">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">Training Schedule & History</h3>
          </div>
          <DataTable 
            columns={columns}
            data={data?.items || []}
            isLoading={isLoading}
            pageCount={totalPages}
            pageIndex={page}
            pageSize={pageSize}
            onPageChange={setPage}
            emptyMessage="No training sessions found for this athlete."
          />
        </CardContent>
      </Card>
    </div>
  );
}
