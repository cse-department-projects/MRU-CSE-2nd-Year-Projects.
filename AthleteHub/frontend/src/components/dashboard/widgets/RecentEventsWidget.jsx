import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { eventApi } from '@/api/eventApi';
import { DataTable } from '@/components/shared/DataTable';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ActivitySquare } from 'lucide-react';

export default function RecentEventsWidget() {
  const { data, isLoading } = useQuery({
    queryKey: ['recent-events'],
    queryFn: () => eventApi.getEvents({ page: 1, pageSize: 5, sortBy: 'createdAt', sortDir: 'desc' }),
  });

  const columns = [
    {
      header: 'Event Name',
      accessorKey: 'name',
      cell: (row) => <span className="font-semibold">{row.name}</span>
    },
    {
      header: 'Start Date',
      accessorKey: 'startDate',
      cell: (row) => new Date(row.startDate).toLocaleDateString()
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (row) => (
        <Badge variant="outline" className={
          row.status === 'UPCOMING' ? 'bg-blue-100 text-blue-800' :
          row.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
          row.status === 'COMPLETED' ? 'bg-gray-100 text-gray-800' : ''
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
          <div className="p-2 bg-purple-100 rounded-lg text-purple-700">
            <ActivitySquare className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-bold">Recent Events</h3>
        </div>
        <DataTable 
          columns={columns}
          data={data?.items || []}
          isLoading={isLoading}
          pageCount={1}
          pageIndex={1}
          pageSize={5}
          onPageChange={() => {}}
          emptyMessage="No events found."
        />
      </CardContent>
    </Card>
  );
}
