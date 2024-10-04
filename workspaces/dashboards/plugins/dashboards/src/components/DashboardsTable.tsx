import React from 'react';
import { Table, TableColumn, ResponseErrorPanel, Link } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import useAsync from 'react-use/lib/useAsync';
import { dashboardsApiRef } from '../api/DashboardsApi';
import { Dashboard } from '../../../dashboards-common/src';

export const DashboardsTable = () => {
  const dashboardsApi = useApi(dashboardsApiRef);

  const { value, loading, error } = useAsync(() => dashboardsApi.getDashboards(), []);

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
      isLoading={loading}
      data={value || []}
    />
  );
}
