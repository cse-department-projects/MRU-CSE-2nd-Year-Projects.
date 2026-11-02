import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { organizationApi } from '@/api/organizationApi';
import { DataTable } from '@/components/shared/DataTable';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2 } from 'lucide-react';

export default function RecentOrganizationsWidget() {
  const { data, isLoading } = useQuery({
    queryKey: ['recent-organizations'],
    queryFn: () => organizationApi.getOrganizations({ page: 1, pageSize: 5, sortBy: 'createdAt', sortDir: 'desc' }),
  });

  const columns = [
    {
      header: 'Name',
      accessorKey: 'name',
      cell: (row) => <span className="font-semibold">{row.name}</span>
    },
    {
      header: 'Type',
      accessorKey: 'organizationTypeName',
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
          <div className="p-2 bg-primary/10 rounded-lg">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-lg font-bold">Recent Organizations</h3>
        </div>
        <DataTable 
          columns={columns}
          data={data?.items || []}
          isLoading={isLoading}
          pageCount={1}
          pageIndex={1}
          pageSize={5}
          onPageChange={() => {}}
          emptyMessage="No recent organizations found."
        />
      </CardContent>
    </Card>
  );
}
