import React from 'react';
import { Table, TableColumn, ResponseErrorPanel, Link } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { useQuery } from '@tanstack/react-query'
import { dashboardsApiRef } from '../api/DashboardsApi';
import { Dashboard } from '../../../dashboards-common/src';

export const DashboardsTable = () => {
  const dashboardsApi = useApi(dashboardsApiRef);

  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboards'],
    queryFn: () => dashboardsApi.getDashboards(),
  });

  const columns: TableColumn<Dashboard>[] = [
    {
      title: 'Name',
      field: 'name',
      render: (row) => <Link to={row.name}>{row.name}</Link>,
    },
    {
      title: 'Title',
      field: 'title',
    },
  ];

  if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  return (
    <Table
      title="Dashboards"
      options={{ search: false, paging: false }}
      columns={columns}
      isLoading={isLoading}
      data={data || []}
    />
  );
}
