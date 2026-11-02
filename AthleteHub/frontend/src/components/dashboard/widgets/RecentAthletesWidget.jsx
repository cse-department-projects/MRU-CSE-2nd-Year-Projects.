import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { athleteApi } from '@/api/athleteApi';
import { DataTable } from '@/components/shared/DataTable';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function RecentAthletesWidget({ organizationId }) {
  const { data, isLoading } = useQuery({
    queryKey: ['recent-athletes', organizationId],
    queryFn: () => athleteApi.getAthletes({ page: 1, pageSize: 5, organizationId, sortBy: 'createdAt', sortDir: 'desc' }),
  });

  const columns = [
    {
      header: 'Athlete',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{(row.fullName || row.firstName || '?').substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold text-sm">{row.fullName || `${row.firstName} ${row.lastName}`}</span>
            <span className="text-xs text-muted-foreground">{row.athleteCode}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Sport',
      accessorKey: 'sport.name',
      cell: (row) => row.sport?.name || 'N/A'
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (row) => (
        <Badge variant="outline" className={row.status === 'Active' ? 'bg-green-100 text-green-800' : ''}>
          {row.status}
        </Badge>
      )
    },
  ];

  return (
    <Card className="card-premium h-full">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg text-blue-700">
            <Users className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-bold">Recent Athletes</h3>
        </div>
        <DataTable 
          columns={columns}
          data={data?.items || []}
          isLoading={isLoading}
          pageCount={1}
          pageIndex={1}
          pageSize={5}
          onPageChange={() => {}}
          emptyMessage="No athletes found."
        />
      </CardContent>
    </Card>
  );
}
